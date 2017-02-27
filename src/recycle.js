export default function (streamAdapter) {
  const { Subject, Observable } = streamAdapter

  const events = {}
  const recycleProps = {}
  let rootComponent

  function createComponent (constructor, props, parent, componentDefinition) {
    const key = (props) ? props.key : null
    const children = new Set()
    const childrenActions = new Subject()
    const injectedState = new Subject()
    const privateProps = {}
    if (!componentDefinition) {
      componentDefinition = (typeof constructor === 'function') ? constructor(props) : constructor
    }
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

    function addChild (component) {
      children.add(component)
    }

    function removeChild (component) {
      if (!component) {
        return
      }
      children.delete(component)
    }

    function getChildren () {
      return [...children]
    }

    function getInternalStateStream () {
      const reducers = [
        componentSources.actions
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
          let newState = reducer(shallowClone(state), action)
          emit('newState', [thisComponent, newState, action])
          replaceState(newState)
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
      getSources: () => componentSources,
      getName: () => componentName,
      getKey: () => key,
      getActions: () => componentSources.actions,
      getConstructor: () => constructor,

      // state
      getState: () => state,
      setState,
      replaceState,
      getStateStream: () => stateStream,

      // props
      getProps: () => props,
      replaceProps,

      // parent/child
      getParent: () => parent,
      updateChildrenActions,
      getChildren,
      addChild,
      removeChild
    }

    if (!parent) {
      if (rootComponent) throw new Error('rootComponent already set')
      rootComponent = thisComponent
      emit('initialize')
    } else {
      parent.addChild(thisComponent)
    }

    emit('componentInit', thisComponent)

    if (componentDefinition.actions) {
      // todo: error for unsupported actions
      let act = componentDefinition.actions(componentSources)
      if (act) {
        Observable.merge(...forceArray(act))
          .filter(action => action)
          .subscribe(a => {
            emit('componentAction', [a, thisComponent])
            emit('action', a)
            componentSources.actions.next(a)
          })
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
      events[event].forEach(function (cb) {
        if (Array.isArray(payload)) {
          cb(...payload)
        } else {
          cb(payload)
        }
      })
    }

    const event$ = event + '$'
    if (api[event$]) {
      api[event$].next(payload)
    }
  }

  function use (driversArr) {
    if (!Array.isArray(driversArr)) {
      driversArr = []
      if (arguments.length) {
        for (let i = 0; i < arguments.length; i++) {
          driversArr.push(arguments[i])
        }
      }
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

  function get (prop) {
    return recycleProps[prop]
  }

  function set (prop, val) {
    recycleProps[prop] = val
  }

  function feedMatchedComponents (config) {
    if (typeof config !== 'object') {
      throw new Error('Could not match components. Missing config object')
    }

    api.on('componentInit', function (c) {
      Object.keys(config).forEach(sourceName => {
        const sourceTypes = c.get('sourceTypes')
        if (sourceTypes && sourceTypes[sourceName]) {
          c.setSource(sourceName, config[sourceName])
        }
      })
    })
  }

  function feedAllComponents (sourceName, feedWith) {
    api.on('componentInit', function (c) {
      c.setSource(sourceName, feedWith)
    })
  }

  function getAllComponents () {
    const children = []

    function ch (c) {
      children.push(...c.getChildren())
      c.getChildren().forEach(function (child) {
        ch(child)
      })
    }
    ch(rootComponent)

    return children
  }

  const api = {
    on: addListener,
    get,
    set,
    unbind: removeListener,
    createComponent,
    use,
    emit,
    getRootComponent: () => rootComponent,
    feedMatchedComponents,
    feedAllComponents,
    getAllComponents,
    componentInit$: new Subject(),
    action$: new Subject()
  }

  return api
}

export function forceArray (arr) {
  if (!Array.isArray(arr)) return [arr]
  return arr
}

export function shallowClone (data) {
  if (Array.isArray(data)) {
    return data.map(i => i)
  } else if (typeof data === 'object') {
    return {...data}
  }
  return data
}
