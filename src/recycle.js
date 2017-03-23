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
          emit({
            event: 'newState',
            params: [thisComponent, newState, action]
          })
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
      if (rootComponent) {
        return createComponent(constructor, props, rootComponent, componentDefinition, beforeInit)
      }
      rootComponent = thisComponent
      emit({
        event: 'initialize'
      })
    } else {
      parent.addChild(thisComponent)
    }

    if (beforeInit && typeof beforeInit === 'function') {
      beforeInit(thisComponent)
    }

    emit({
      event: 'componentInit',
      component: thisComponent
    })

    if (componentDefinition.actions) {
      let act = componentDefinition.actions(componentSources)
      if (act) {
        Observable.merge(...forceArray(act))
          .filter(action => action)
          .subscribe(a => {
            emit({
              event: 'action',
              component: thisComponent,
              params: a
            })
            componentSources.actions.next(a)
          })
      }
    }

    stateStream = getInternalStateStream().merge(injectedState)

    emit({
      event: 'sourcesReady',
      component: thisComponent
    })

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

  function emit (data) {
    let event = data.event
    let payload = data.params || data.component

    if (events[event]) {
      events[event].forEach(function (cb) {
        if (Array.isArray(payload)) {
          cb(...payload)
        } else {
          cb(payload)
        }
      })
    }
  }

  function applyDriver (driver) {
    return driver(api, streamAdapter)
  }

  function applyModule (module) {
    const rootComponent = module.root

    if (module.view) {
      module.view.forEach(c => {
        if (c.sources) {
          api.feedMatchedComponents(c.sources, c.component)
        }
      })
    }

    if (module.store) {
      module.store.forEach(c => {
        if (c.sources) {
          api.feedMatchedComponents(c.sources, c.component)
        }
        api.createComponent(c.component, false, false, false, function (createdComponent) {
          createdComponent.setPrivate('modifyStore', c.modify)
        })
      })
    }

    if (module.effects) {
      module.effects.forEach(c => {
        if (c.sources) {
          api.feedMatchedComponents(c.sources, c.component)
        }
        api.createComponent(c.component)
      })
    }
    return rootComponent
  }

  function get (prop) {
    return recycleProps[prop]
  }

  function set (prop, val, force) {
    if (!force && recycleProps[prop] !== undefined) {
      throw Error(`${prop} already exists`)
    }
    recycleProps[prop] = val
  }

  function feedMatchedComponents (feedSources, matchConstructor) {
    if (typeof feedSources !== 'object') {
      throw new Error('Could not match components. Missing feed source object')
    }

    api.on('componentInit', function (c) {
      const cInterface = c.get('interface')

      if (!cInterface) {
        return
      }
      if (matchConstructor && c.getConstructor() !== matchConstructor) {
        return
      }

      Object.keys(cInterface).forEach(requiredSourceName => {
        let expectedType = cInterface[requiredSourceName]
        let source = feedSources[requiredSourceName]

        if (source === undefined) {
          throw new Error(`Source \`${requiredSourceName}\` is required in \`${c.getName()}\`, but its value is \`undefined\`.`)
        }

        if (expectedType !== getType(source)) {
          throw new Error(`Invalid source \`${requiredSourceName}\` of type \`${getType(source)}\` supplied to \`${c.getName()}\`, expected \`${expectedType}\`.`)
        }

        c.setSource(requiredSourceName, source)
      })
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

  function getType (test) {
    if (test instanceof Observable) {
      return 'observable'
    }
    if (Array.isArray(test)) {
      return 'array'
    }
    return typeof test
  }

  const api = {
    on: addListener,
    get,
    set,
    unbind: removeListener,
    createComponent,
    applyDriver,
    applyModule,
    emit,
    getRootComponent: () => rootComponent,
    feedMatchedComponents,
    getAllComponents
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
