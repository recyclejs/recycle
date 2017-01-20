export default function (componentAdapter, streamAdapter) {
  const { React, getEventHandler } = componentAdapter
  const { Subject, Observable } = streamAdapter

  const events = {}
  let createElement = React.createElement
  let BaseComponent = React.Component
  let rootComponent

  function createComponent (constructor, props, parent) {
    const key = (props) ? props.key : null
    const children = new Map()
    const childrenActions = new Subject()
    const injectedState = new Subject()
    const propsReference = new Subject()
    const stateReference = new Subject()
    const registeredNodeStreams = []
    let currentNodeStreams = []
    let stateStream
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
      select: registerNodeStream(registeredNodeStreams, 'tag'),
      selectClass: registerNodeStream(registeredNodeStreams, 'class'),
      selectId: registerNodeStream(registeredNodeStreams, 'id'),
      childrenActions: childrenActions.switch().share(),
      actions: new Subject(),
      props: propsReference.share(),
      state: stateReference.share()
    }

    function updateNodeStreams () {
      registeredNodeStreams.forEach(regRef => {
        const streams = currentNodeStreams
                .filter(ref => ref.selector === regRef.selector)
                .filter(ref => ref.selectorType === regRef.selectorType)
                .filter(ref => ref.event === regRef.event)
                .map(ref => ref.stream)

        if (streams.length) {
          regRef.stream.next((streams.length === 1) ? streams[0] : Observable.merge(...streams))
        }
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
          this.state = { recycleState: config.initialState }
          state = this.state.recycleState
        }

        componentDidMount () {
          this.stateSubsription = stateStream.subscribe(newVal => {
            this.setState({
              recycleState: shallowImmutable(newVal.state)
            })
          })

          updateChildrenActions()
          updateNodeStreams()
          updateStatePropsReference()

          emit('componentDidMount', thisComponent)

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
          updateNodeStreams()
          updateStatePropsReference()
          if (config.componentDidUpdate) {
            const params = {
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
          currentNodeStreams = []
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
      let selectors = getNodeSelectors(arguments['0'], arguments['1'])
      let returnValue = (arguments['1']) ? arguments['1'].return : undefined

      if (arguments['1'] && arguments['1'].return !== undefined) {
        delete arguments['1'].return
      }

      const setNodeStream = (child) => {
        selectors.forEach(({ selectorType, selector }) => {
          registeredNodeStreams
            .filter(ref => ref.selector === selector)
            .filter(ref => ref.selectorType === selectorType)
            .forEach(registredRef => {
              let ref = {
                selector,
                selectorType,
                event: registredRef.event
              }
              if (child) {
                ref.stream = child.getActions()
                  .filter(a => a.type === ref.event)
                  .map(event => ({ event }))
              } else if (typeof arguments['1'][ref.event] === 'function') {
                ref.stream = new Subject()
                let customFunction = arguments['1'][ref.event]
                arguments['1'][ref.event] = function () {
                  let event = customFunction.apply(this, arguments)
                  ref.stream.next({ event, returnValue })
                }
              } else {
                ref.stream = new Subject()
                const reactEvent = getEventHandler(ref.event) || ref.event
                arguments['1'][reactEvent] = function () {
                  let event = arguments['0']
                  ref.stream.next({ event, returnValue })
                }
              }
              currentNodeStreams.push(ref)
            })
        })
      }

      if (typeof arguments['0'] === 'function') {
        const childConstructor = arguments['0']
        const childProps = arguments['1'] || {}

        if (isReactComponent(childConstructor)) {
          setNodeStream()
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
          setNodeStream(child)
          return createElement(child.getReactComponent(), childProps)
        }

        const newComponent = createComponent(childConstructor, childProps, thisComponent)
        registerComponent(newComponent, children)
        setNodeStream(newComponent)
        return createElement(newComponent.getReactComponent(), childProps)
      }
      setNodeStream()
      return createElement.apply(this, arguments)
    }

    function updateChildrenActions () {
      if (parent) {
        parent.updateChildrenActions()
      }

      const newActions = Observable.merge(
        ...forceArray(getChildren())
          .filter(component => component.getActions())
          .map(component => component.getActions())
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
        .filter(e => {
          if (!e || !e.reducer) {
            console.error('Could not change state, missing reducer function.')
            return false
          }
          return true
        })
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
      getSources: () => componentSources,
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

    if (config.actions) {
      // todo: error for unsupported actions
      let act = config.actions(componentSources)
      if (act) {
        Observable.merge(...forceArray(act))
          .filter(action => action)
          .subscribe(componentSources.actions)
      }
    }
    stateStream = getStateStream().merge(injectedState)

    emit('sourcesReady', thisComponent)
    return thisComponent
  }

  function registerNodeStream (registeredNodeStreams, selectorType) {
    return selector => {
      return {
        on: event => {
          const foundRefs = registeredNodeStreams
            .filter(ref => ref.selector === selector)
            .filter(ref => ref.selectorType === selectorType)
            .filter(ref => ref.event === event)

          let ref = foundRefs[0]

          if (!ref) {
            ref = {
              selector,
              selectorType,
              event,
              stream: new Subject()
            }
            registeredNodeStreams.push(ref)
          }

          return ref.stream.switch().share()
            .map(val => (val.value !== undefined) ? val.value : val.event)
        }
      }
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

  function applyDrivers (driversArr) {
    if (!Array.isArray(driversArr)) {
      throw new Error('Drivers must be defined in an array.')
    }

    const drivers = {}
    api.getDriver = name => drivers[name]

    driversArr.map((m) => {
      const instance = m(api, componentAdapter, streamAdapter)
      const name = (instance && instance.name) ? instance.name : 'driver-' + Math.random()
      drivers[name] = instance
      return false
    })
  }

  const api = {
    on: addListener,
    unbind: removeListener,
    createComponent,
    applyDrivers,
    getComponentStructure: () => getComponentStructure(rootComponent),
    getRootComponent: () => rootComponent,
    getAllComponents: () => getAllComponents(rootComponent)
  }

  return api
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

function getNodeSelectors (nodeName, attrs) {
  let selectors = []

  let tag = (typeof nodeName === 'string') ? nodeName : undefined
  let id = (attrs) ? attrs.id : undefined
  let className = (attrs) ? attrs.className : undefined
  let functionSelector = (typeof nodeName === 'function') ? nodeName : undefined

  if (tag) {
    selectors.push({ selector: tag, selectorType: 'tag' })
  }

  if (functionSelector) {
    selectors.push({ selector: functionSelector, selectorType: 'tag' })
  }

  if (className) {
    let classes = className.split(' ').map(classNcame => ({ selector: className, selectorType: 'class' }))
    selectors = selectors.concat(classes)
  }
  if (id) {
    selectors.push({ selector: id, selectorType: 'id' })
  }

  return selectors
}
