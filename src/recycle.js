export default function (streamAdapter) {
  const { Subject, Observable } = streamAdapter

  const events = {}
  let rootComponent

  function createComponent (constructor, props, parent) {
    const key = (props) ? props.key : null
    const children = new Map()
    const childrenActions = new Subject()
    const injectedState = new Subject()
    const componentDefinition = constructor(props)
    const privateProps = {}
    const componentName = componentDefinition.displayName || constructor.name
    let stateStream

    let state = null

    const componentSources = {
      childrenActions: childrenActions.switch().share(),
      actions: new Subject()
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

    function removeChild (component) {
      if (!component) {
        return
      }

      const components = children.get(component.getConstructor())
      delete components[component.getKey()]
      children.set(component.getConstructor(), components)
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

    function getInternalStateStream () {
      const reducers = [
        componentSources.actions
          .do(a => emit('action', [a, thisComponent]))
          .filter(() => false)
      ]

      if (componentDefinition.reducers) {
        reducers.push(...forceArray(componentDefinition.reducers(componentSources)))
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

    function setState (newState, action) {
      injectedState.next({
        state: newState
      })
    }

    function replaceState (newState) {
      state = newState
    }

    function replaceProps (newProps) {
      props = newProps
    }

    function get (prop) {
      return componentDefinition[prop]
    }

    function set (prop, val) {
      componentDefinition[prop] = val
    }

    function getPrivate (prop) {
      return privateProps[prop]
    }

    function setPrivate (prop, val) {
      privateProps[prop] = val
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
      // getters/setters
      get,
      set,
      getPrivate,
      setPrivate,
      getSource,
      setSource,

      // actions
      getActions: () => componentSources.actions,
      updateChildrenActions,

      // state
      getState: () => state,
      setState,
      replaceState,
      getStateStream: () => stateStream,

      // props
      getProps: () => props,
      replaceProps,

      // children
      getChildren,
      getChildrenMap: () => children,
      removeChild,

      // special getters
      getSources: () => componentSources,
      getName: () => componentName,
      getKey: () => key,
      getConstructor: () => constructor,
      getParent: () => parent,
      getByConstructor
    }

    if (!parent) {
      if (rootComponent) throw new Error('rootComponent already set')
      rootComponent = thisComponent
      emit('initialize')
    }

    emit('componentInit', thisComponent)

    if (componentDefinition.actions) {
      // todo: error for unsupported actions
      let act = componentDefinition.actions(componentSources)
      if (act) {
        Observable.merge(...forceArray(act))
          .filter(action => action)
          .subscribe(componentSources.actions)
      }
    }

    stateStream = getInternalStateStream().merge(injectedState)
    emit('sourcesReady', thisComponent)
    return thisComponent
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

  function use (driversArr) {
    if (!Array.isArray(driversArr)) {
      driversArr = [driversArr]
    }

    const drivers = {}
    api.getDriver = name => drivers[name]

    driversArr.map((m) => {
      const instance = m(api, streamAdapter)
      const name = (instance && instance.name) ? instance.name : 'driver-' + Math.random()
      drivers[name] = instance
      return false
    })
  }

  const api = {
    on: addListener,
    unbind: removeListener,
    createComponent,
    use,
    emit,
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
