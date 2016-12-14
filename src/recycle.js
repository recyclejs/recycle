export default function ({ adapter }) {
  const {
    BaseComponent,
    createElement,
    findDOMNode,
    Observable,
    Subject
  } = adapter

  const events = {}
  let rootComponent

  function createComponent (constructor, props, parent) {
    const key = (props) ? props.key : null
    const domNodes = {}
    const children = new Map()
    const childrenActions = new Subject()
    const injectedState = new Subject()
    const propsReference = new Subject()
    const stateReference = new Subject()
    let ReactComponent
    let componentName
    let timesRendered = 0
    let state = null
    let config

    config = constructor(props)
    if (typeof config === 'function') {
      config = { view: config }
    }
    componentName = config.displayName || constructor.name

    const componentSources = {
      DOM: { select: generateDOMSource(domNodes) },
      childrenActions: childrenActions.switch().share(),
      actions: new Subject(),
      props: propsReference.share(),
      state: stateReference.share()
    }

    function updateStatePropsReference () {
      stateReference.next({...state})
      propsReference.next({...props})
    }

    function getReactComponent () {
      if (ReactComponent) {
        return ReactComponent
      }

      class ReactClass extends BaseComponent {
        constructor (ownProps) {
          super(ownProps)
          if (config.initialState && (typeof config.initialState !== 'object' || Array.isArray(config.initialState))) {
            const stateStr = JSON.stringify(config.initialState)
            throw new Error(`Component state must be an object, got: '${stateStr}'`)
          }
          this.state = {
            recycleState: config.initialState
          }
          state = this.state.recycleState
        }

        componentDidMount () {
          if (config.actions) {
            Observable.merge(...forceArray(config.actions(componentSources)))
              .filter(action => action)
              .subscribe(componentSources.actions)
          }
          updateStatePropsReference()
          this.stateSubsription = getStateStream().merge(injectedState).subscribe((newVal) => {
            const newState = newVal.state
            const newAction = newVal.action

            if (typeof newState !== 'object' || Array.isArray(newState)) {
              let lastActionErr = ''
              if (typeof newAction === 'object') {
                lastActionErr = ` Last recieved action: '${JSON.stringify(newAction.type)}'.`
              }
              let componentNameErr = ''
              if (componentName) {
                componentNameErr = ` Check reducers of ${componentName} component.`
              }
              const stateStr = JSON.stringify(newState)
              throw new Error(`Component state must be an object, got: '${stateStr}'.${componentNameErr}${lastActionErr}`)
            }

            this.setState({
              recycleState: {...newState}
            })
          })

          updateChildrenActions()

          const el = findDOMNode(this)
          updateDomStreams(domNodes, el)

          if (config.componentDidMount) {
            return config.componentDidMount()
          }
        }

        shouldComponentUpdate (nextProps, nextState) {
          if (config.shouldComponentUpdate) {
            return config.shouldComponentUpdate(nextProps, nextState.recycleState, this.props, this.state.recycleState)
          }
          return true
        }

        componentDidUpdate (prevProps, prevState) {
          props = this.props
          state = this.state.recycleState
          updateStatePropsReference()

          emit('componentUpdate', thisComponent)
          const el = findDOMNode(this)
          updateDomStreams(domNodes, el)

          if (config.componentDidUpdate) {
            const params = {
              select: (selector) => {
                return el.querySelector(selector)
              },
              props: this.props,
              state: this.state.recycleState,
              prevProps,
              prevState: prevState.recycleState
            }
            return config.componentDidUpdate(params)
          }
        }

        componentWillUnmount () {
          if (this.stateSubsription) {
            this.stateSubsription.unsubscribe()
          }
          if (parent) {
            parent.removeChild(thisComponent)
          }

          if (config.componentWillUnmount) {
            return config.componentWillUnmount()
          }
        }

        render () {
          timesRendered++
          if (!config.view) return null
          return config.view(jsxHandler, this.props, this.state.recycleState)
        }
      }

      ReactClass.displayName = componentName
      ReactClass.propTypes = config.propTypes || null
      ReactComponent = ReactClass
      return ReactComponent
    }

    function jsxHandler () {
      if (typeof arguments['0'] === 'function') {
        const childConstructor = arguments['0']
        const childProps = arguments['1'] || {}

        if (isReactComponent(childConstructor)) {
          return createReactElement(createElement, arguments, jsxHandler)
        }

        const child = getByConstructor(childConstructor, childProps.key)

        if (child) {
          if (timesRendered === 1) {
            if (!child.getKey()) {
              throw new Error(`Recycle component '${child.getName()}' called multiple times without the key property`)
            } else {
              throw new Error(`Recycle component '${child.getName()}' called multiple times with the same key property '${child.getKey()}'`)
            }
          }
          return createElement(child.getReactComponent(), childProps)
        }

        const newComponent = createComponent(childConstructor, childProps, thisComponent)
        registerComponent(newComponent, children)
        return createElement(newComponent.getReactComponent(), childProps)
      }
      return createElement.apply(this, arguments)
    }

    function updateChildrenActions () {
      if (parent) {
        parent.updateChildrenActions()
      }

      const newActions = Observable.merge(
        ...forceArray(getChildren())
          .filter(component => component.getActions())
          .map(component => component.getActions().map(a => {
            a.childComponent = component.getConstructor()
            return a
          }))
      )

      if (newActions) {
        childrenActions.next(newActions)
      }
    }

    function getByConstructor (constructor, key) {
      return (children.has(constructor)) ? children.get(constructor)[key] : false
    }

    function getChildren () {
      const childrenArr = []

      for (const childrenConstructor of children.keys()) {
        const components = children.get(childrenConstructor)
        Object.keys(components).forEach((componentKey) => {
          childrenArr.push(components[componentKey])
        })
      }

      return childrenArr
    }

    function getStateStream () {
      const reducers = [
        componentSources.actions
          .do(a => emit('action', [a, thisComponent]))
          .filter(() => false)
      ]

      if (config.reducers) {
        reducers.push(...forceArray(config.reducers(componentSources)))
      }

      return Observable.merge(...reducers)
        .map(({ reducer, action }) => {
          let newState = reducer({...state}, action)
          emit('newState', [thisComponent, newState, action])
          if (newState === false) {
            newState = {...state}
          }
          return {
            state: newState,
            reducer,
            action
          }
        })
        .share()
    }

    function removeChild (component) {
      if (!component) {
        return
      }

      const components = children.get(component.getConstructor())
      delete components[component.getKey()]
      children.set(component.getConstructor(), components)
    }

    function setState (newState, action) {
      injectedState.next({
        state: newState
      })
    }

    function get (prop) {
      return config[prop]
    }

    function set (prop, val) {
      config[prop] = val
    }

    function getSource (sourceName) {
      return componentSources[sourceName]
    }

    function setSource (sourceName, source) {
      if (componentSources[sourceName]) {
        throw new Error(`Could not set component source. '${sourceName}' is already defined.`)
      }
      componentSources[sourceName] = source
    }

    const thisComponent = {
      get,
      set,
      getSource,
      setSource,
      updateChildrenActions,
      setState,
      getChildren,
      removeChild,
      getReactComponent,
      jsxHandler,
      getByConstructor,
      getActions: () => componentSources.actions,
      getName: () => componentName,
      getKey: () => key,
      getState: () => state,
      getProps: () => props,
      getConstructor: () => constructor
    }

    if (!parent) {
      if (rootComponent) throw new Error('rootComponent already set')
      rootComponent = thisComponent
      emit('initialize')
    }

    emit('componentInit', thisComponent)
    return thisComponent
  }

  function generateDOMSource (domNodes) {
    return function domSelector (selector) {
      return {
        events: function getEvent (event) {
          if (!domNodes[selector]) {
            domNodes[selector] = {}
          }

          if (!domNodes[selector][event]) {
            domNodes[selector][event] = new Subject()
          }

          return domNodes[selector][event].switch().share()
        }
      }
    }
  }

  function updateDomStreams (domNodes, el) {
    Object.keys(domNodes).forEach((selector) => {
      Object.keys(domNodes[selector]).forEach((event) => {
        const domEl = el.querySelector(selector)
        if (domEl) {
          domNodes[selector][event].next(Observable.fromEvent(domEl, event))
        }
      })
    })
  }

  function addListener (event, cb) {
    if (!events[event]) {
      events[event] = new Set()
    }
    events[event].add(cb)
  }

  function removeListener (event, cb) {
    if (!events[event]) {
      return
    }
    events[event].delete(cb)
  }

  function emit (event, payload) {
    if (events[event]) {
      for (const cb of events[event]) {
        if (Array.isArray(payload)) {
          cb(...payload)
        } else {
          cb(payload)
        }
      }
    }
  }

  applyRecycleObservable(Observable)

  return {
    on: addListener,
    unbind: removeListener,
    createComponent,
    getComponentStructure: () => getComponentStructure(rootComponent),
    getRootComponent: () => rootComponent,
    getAllComponents: () => getAllComponents(rootComponent)
  }
}

export function registerComponent (newComponent, children) {
  const constructor = newComponent.getConstructor()
  const key = newComponent.getKey()
  const name = newComponent.getName()

  const obj = children.get(constructor) || {}

  if (obj[key]) throw Error(`Could not register recycle component '${name}'. Key '${key}' is already in use.`)

  obj[key] = newComponent
  children.set(constructor, obj)
}

export function getAllComponents (rootComponent) {
  const components = []
  function addInArray (component) {
    components.push(component)

    if (component.getChildren()) {
      component.getChildren().forEach((c) => {
        addInArray(c)
      })
    }
  }

  addInArray(rootComponent)
  return components
}

export function getComponentStructure (rootComponent) {
  function addInStructure (parent, component) {
    const current = {
      component,
      name: component.getName(),
      children: []
    }
    if (parent.children) {
      parent.children.push(current)
    } else {
      structure = current
    }

    if (component.getChildren()) {
      component.getChildren().forEach((c) => {
        addInStructure(current, c)
      })
    }
  }

  let structure = {}
  addInStructure(structure, rootComponent)
  return structure
}

export function createReactElement (createElementHandler, args, jsx) {
  const constructor = args['0']
  const props = args['1'] || {}

  const originalRender = constructor.prototype.render
  constructor.prototype.getJsxHandler = function () {
    return this
  }.bind(jsx)

  constructor.prototype.render = function render () {
    return originalRender.call(this, this.getJsxHandler())
  }

  const newArgs = []
  for (let i = 0; i < args.length || i < 2; i++) {
    if (i === 0) {
      newArgs.push(constructor)
    } else if (i === 1) {
      newArgs.push(props)
    } else if (i > 1) {
      newArgs.push(args[i])
    }
  }

  return createElementHandler.apply(this, newArgs)
}

export function isReactComponent (constructor) {
  if (constructor.prototype.render) {
    return true
  }
  return false
}

export function forceArray (arr) {
  if (!Array.isArray(arr)) return [arr]
  return arr
}

export function applyRecycleObservable (Observable) {
  Observable.prototype.reducer = function reducer (reducerFn) {
    return this.map(action => ({ reducer: reducerFn, action }))
  }

  Observable.prototype.filterByType = function filterByType (type) {
    return this.filter(action => action.type === type)
  }

  Observable.prototype.filterByComponent = function filterByComponent (constructor) {
    return this.filter(action => action.childComponent === constructor)
  }

  Observable.prototype.mapToLatest = function mapToLatest (sourceFirst, sourceSecond) {
    if (sourceSecond) {
      return this.mapToLatest(sourceFirst).withLatestFrom(sourceSecond, (props, state) => ({props, state}))
    }
    return this.withLatestFrom(sourceFirst, (first, second) => second)
  }
}
