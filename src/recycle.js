export default function (componentAdapter, streamAdapter) {
  const { React, getEventHandler } = componentAdapter
  const { Subject, Observable } = streamAdapter

  const events = {}
  let createElement = React.createElement
  let BaseComponent = React.Component
  let rootComponent

  function createComponent (constructor, props, parent) {
    const key = (props) ? props.key : null
    const refsSubjects = {}
    let refs = []
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
      select: generateDOMStream(refsSubjects),
      selectClass: generateDOMStream(refsSubjects, 'CLASSNAME-'),
      selectId: generateDOMStream(refsSubjects, 'ID-'),
      childrenActions: childrenActions.switch().share(),
      actions: new Subject(),
      props: propsReference.share(),
      state: stateReference.share()
    }

    function updateRefs () {
      Object.keys(refsSubjects).forEach((selector) => {
        Object.keys(refsSubjects[selector]).forEach((event) => {
          const foundRefs = refs.filter(ref => ref.selector === selector)
          const streams = foundRefs.filter(ref => ref.events && ref.events[event])
                                   .map(ref => ref.events[event])
          if (streams.length) {
            const nextStream = (streams.length === 1) ? streams[0] : Observable.merge(...streams)
            refsSubjects[selector][event].next(nextStream)
          }
        })
      })
    }

    function updateStatePropsReference () {
      stateReference.next(shallowImmutable(state))
      propsReference.next(shallowImmutable(props))
    }

    function getReactComponent () {
      if (ReactComponent) {
        return ReactComponent
      }

      class ReactClass extends BaseComponent {
        constructor (ownProps) {
          super(ownProps)
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

          this.stateSubsription = getStateStream().merge(injectedState).subscribe(newVal => {
            this.setState({
              recycleState: shallowImmutable(newVal.state)
            })
          })
        }

        componentDidMount () {
          updateChildrenActions()
          updateRefs()
          updateStatePropsReference()

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

          emit('componentUpdate', thisComponent)
          updateRefs(this.refs)
          updateStatePropsReference()
          if (config.componentDidUpdate) {
            const params = {
              selectAll: (selector) => {
                return refs.filter(ref => ref.selector === selector)
                        .map(ref => this.refs[`recycle-${ref.index}`])
              },
              select: (selector) => params.selectAll(selector)[0],
              refs: this.refs,
              props: this.props,
              state: this.state.recycleState,
              prevProps,
              prevState: prevState.recycleState
            }
            return config.componentDidUpdate(params)
          }
        }

        componentWillUnmount () {
          emit('componentWillUnmount', thisComponent)

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
          refs = []
          if (!config.view) return null

          let before = React.createElement
          React.createElement = jsxHandler
          let toReturn = config.view(this.props, this.state.recycleState, jsxHandler)
          React.createElement = before
          return toReturn
        }
      }

      ReactClass.displayName = componentName
      ReactClass.propTypes = config.propTypes || null
      ReactComponent = ReactClass
      return ReactComponent
    }

    function jsxHandler () {
      let recycleSelector = (arguments['1']) ? arguments['1'].recycle : undefined
      let className = (arguments['1']) ? arguments['1'].className : undefined
      let id = (arguments['1']) ? arguments['1'].id : undefined
      let value = (arguments['1']) ? arguments['1'].return : undefined

      let selectors = []
      if (recycleSelector) {
        selectors.push(recycleSelector)
      }
      if (className) {
        let classes = className.split(' ').map(className => 'CLASSNAME-' + className)
        selectors = selectors.concat(classes)
      }
      if (id) {
        selectors.push('ID-' + id)
      }

      selectors.forEach(selector => {
        // if recycle selector is provided
        let events = {}

        if (refsSubjects[selector]) {
          Object.keys(refsSubjects[selector]).forEach(listenTo => {
            // create streams from reactEvents
            const reactEvent = getEventHandler(listenTo) || listenTo
            let subject = new Subject()
            events[listenTo] = subject
            let customFunction
            if (typeof arguments['1'][reactEvent] === 'function') {
              customFunction = arguments['1'][reactEvent]
            }
            arguments['1'][reactEvent] = function () {
              let event = arguments['0']
              if (customFunction) {
                event = customFunction.apply(this, arguments)
              }
              subject.next({ event, value })
            }
          })

          refs.push({ selector, events })
        }
      })
      delete arguments['1'].recycle
      delete arguments['1'].return

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
            // todo: type check
            return {...a, childComponent: component.getConstructor()}
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
          let newState = reducer(shallowImmutable(state), action)
          emit('newState', [thisComponent, newState, action])
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

  function generateDOMStream (refsSubjects, prefix = '') {
    return function domSelector (selector) {
      selector = prefix + selector
      const api = {
        on: function getEvent (event, all) {
          if (!refsSubjects[selector]) {
            refsSubjects[selector] = {}
          }

          if (!refsSubjects[selector][event]) {
            refsSubjects[selector][event] = new Subject()
          }

          return refsSubjects[selector][event].switch().share()
            .map(val => (val.value !== undefined) ? val.value : val.event)
        }
      }
      return api
    }
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

export function createReactElement (createElementHandler, args) {
  const constructor = args['0']
  const props = args['1'] || {}

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

export function shallowImmutable (data) {
  if (Array.isArray(data)) {
    return data.map(i => i)
  } else if (typeof data === 'object') {
    return {...data}
  }
  return data
}
