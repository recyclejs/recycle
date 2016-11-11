export default function ({ adapter, additionalSources }) {
  const {
    BaseComponent,
    createElement,
    findDOMNode,
    Observable,
    Subject,
  } = adapter

  const events = {}
  let rootComponent

  function createComponent(constructor, props, parent) {
    const key = (props) ? props.key : null
    const domNodes = {}
    const children = new Map()
    const childActions = makeSubject()
    const componentUpdate = makeSubject()
    const outsideActions = makeSubject()
    let ReactComponent
    let componentName
    let timesRendered = 0
    let state = null
    let config

    setConfig(props)

    const componentSources = {
      ...additionalSources,
      DOM: { select: generateDOMSource(domNodes) },
      componentUpdate: componentUpdate.stream.share(),
      childrenActions: childActions.stream.switch().share(),
      actions: makeSubject().stream.share(),
    }

    function getProp(propKey) {
      if (!props) {
        return null
      }
      return props[propKey]
    }

    function setConfig(ownProps) {
      config = constructor(ownProps)
      props = ownProps
      componentName = config.displayName || constructor.name
    }

    function getReactComponent() {
      if (ReactComponent) {
        return ReactComponent
      }

      class ReactClass extends BaseComponent {
        constructor(ownProps) {
          super(ownProps)
          this.state = {
            recycleState: config.initialState,
          }
          state = this.state.recycleState
        }

        componentDidMount() {
          if (config.actions) {
            Observable.merge(...forceArray(config.actions(componentSources, getProp)))
              .filter(action => action)
              .subscribe(componentSources.actions)
          }

          this.stateSubsription = getStateStream().subscribe((newVal) => {
            if (newVal.state) {
              this.setState({
                recycleState: newVal.state,
                lastAction: newVal.action,
              })
            }
          })

          updateChildActions()
        }

        shouldComponentUpdate(nextProps, nextState) {
          if (config.shouldComponentUpdate) {
            return config.shouldComponentUpdate(nextProps, nextState.recycleState, this.props, this.state.recycleState)
          }
          return true
        }

        componentWillUpdate() {
          setConfig(this.props)
        }

        componentDidUpdate() {
          state = this.state.recycleState
          componentUpdate.observer.next(this.state.recycleState)
          emit('componentUpdated', [this.state.recycleState, this.state.lastAction, thisComponent])
          const el = findDOMNode(this)
          updateDomStreams(domNodes, el)
        }

        componentWillUnmount() {
          if (this.stateSubsription) {
            this.stateSubsription.unsubscribe()
          }
          parent.removeChild(thisComponent)
        }

        render() {
          timesRendered++
          if (!config.view) return null
          return config.view(this.state.recycleState, this.props, jsxHandler)
        }
      }

      ReactClass.displayName = componentName
      ReactClass.propTypes = config.propTypes || null
      ReactComponent = ReactClass
      return ReactComponent
    }

    function jsxHandler() {
      if (typeof arguments['0'] === 'function') {
        const childConstructor = arguments['0']
        const childProps = arguments['1'] || {}

        if (isReactComponent(childConstructor)) {
          return createReactElement(createElement, arguments, jsxHandler)
        }

        const child = (children.has(childConstructor)) ? children.get(childConstructor)[childProps.key] : false

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

    function updateChildActions() {
      if (parent) {
        parent.updateChildActions()
      }

      const newActions = Observable.merge(
        ...forceArray(getChildren())
          .filter(component => component.getActions())
          .map(component => component.getActions())
      )

      if (newActions) {
        childActions.observer.next(newActions)
      }
    }

    function getChildren() {
      const childrenArr = []

      for (const childrenConstructor of children.keys()) {
        const components = children.get(childrenConstructor)
        Object.keys(components).forEach((componentKey) => {
          childrenArr.push(components[componentKey])
        })
      }

      return childrenArr
    }

    function getStateStream() {
      const reducers = [
        componentSources.actions
          .do(a => emit('action', [a, thisComponent]))
          .filter(() => false),
      ]

      if (config.reducers) {
        reducers.push(...forceArray(config.reducers(componentSources)))
      }

      // TODO: sideefects middleware (nikakav record nije potreban, druga svrha)
      // user klikne na button
      // pošalje akciju koja radi side effect
      // frontend na istu stavlja pending: true
      // u reduceru: sideefects.update postavlja novi state i dodatno
      // pending: false

      return Observable.merge(...reducers)
        .merge(outsideActions.stream.switch())
        .startWith({
          state: config.initialState,
        })
        .scan((last, { reducer, action }) => (
          {
            state: reducer(last.state, action),
            reducer,
            action,
          }
        ))
        .share()
    }

    function removeChild(component) {
      const components = children.get(component.getConstructor())
      delete components[component.getKey()]
      children.set(component.getConstructor(), components)
    }

    function setState(newState, action) {
      outsideActions.observer.next(
        Observable.of(action)
          .reducer(() => newState)
      )
    }

    function get(prop) {
      return config[prop]
    }

    function set(prop, val) {
      config[prop] = val
    }

    const thisComponent = {
      get,
      set,
      updateChildActions,
      setState,
      getChildren,
      removeChild,
      getActions: () => componentSources.actions,
      getReactComponent,
      getName: () => componentName,
      getKey: () => key,
      getState: () => state,
      getConstructor: () => constructor,
    }

    if (!parent) {
      if (rootComponent) throw new Error('rootComponent already set')
      rootComponent = thisComponent
    }

    emit('componentInit', thisComponent)
    return thisComponent
  }

  function makeSubject() {
    const stream = new Subject()
    const observer = {
      next: x => stream.next(x),
      error: err => stream.error(err),
      complete: () => stream.complete(),
    }
    return { stream, observer }
  }

  function generateDOMSource(domNodes) {
    return function domSelector(selector) {
      return {
        events: function getEvent(event) {
          if (!domNodes[selector]) {
            domNodes[selector] = {}
          }

          if (!domNodes[selector][event]) {
            domNodes[selector][event] = makeSubject()
          }

          return domNodes[selector][event].stream.switch().share()
        },
      }
    }
  }

  function updateDomStreams(domNodes, el) {
    Object.keys(domNodes).forEach((selector) => {
      Object.keys(domNodes[selector]).forEach((event) => {
        const domEl = el.querySelector(selector)
        domNodes[selector][event].observer.next(Observable.fromEvent(domEl, event))
      })
    })
  }

  function addListener(event, cb) {
    if (!events[event]) {
      events[event] = new Set()
    }
    events[event].add(cb)
  }

  function removeListener(event, cb) {
    if (!events[event]) {
      return
    }
    events[event].delete(cb)
  }

  function emit(event, payload) {
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
    getAllComponents: () => getAllComponents(rootComponent),
  }
}

export function registerComponent(newComponent, children) {
  const constructor = newComponent.getConstructor()
  const key = newComponent.getKey()
  const name = newComponent.getName()

  const obj = children.get(constructor) || {}

  if (obj[key]) throw Error(`Could not register recycle component '${name}'. Key '${key}' is already in use.`)

  obj[key] = newComponent
  children.set(constructor, obj)
}

export function getAllComponents(rootComponent) {
  const components = []
  function addInArray(component) {
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

export function getComponentStructure(rootComponent) {
  function addInStructure(parent, component) {
    const current = {
      component,
      name: component.getName(),
      children: [],
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

export function createReactElement(createElementHandler, args, jsx) {
  const constructor = args['0']
  const props = args['1'] || {}

  const originalRender = constructor.prototype.render
  constructor.prototype.render = function render() {
    return originalRender.call(this, props._recycleRenderHandler)
  }

  props._recycleRenderHandler = jsx

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

export function isReactComponent(constructor) {
  if (constructor.prototype.render) {
    return true
  }
  return false
}

export function forceArray(arr) {
  if (!Array.isArray(arr)) return [arr]
  return arr
}

export function applyRecycleObservable(Observable) {
  Observable.prototype.reducer = function reducer(reducerFn) {
    return this.map(action => ({ reducer: reducerFn, action }))
  }

  Observable.prototype.filterByType = function filterByType(type) {
    return this.filter(action => action.type === type)
  }
}
