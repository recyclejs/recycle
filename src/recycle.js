export default function ({
  Component,
  createElement,
  findDOMNode,
  Observable,
  Subject,
  additionalSources,
}) {
  let rootComponent

  function createComponent(constructor, props, parent) {
    const key = (props) ? props.key : null
    const domNodes = {}
    const children = new Map()
    const childActions = makeSubject()
    const componentLC = makeSubject()
    const updateState = makeSubject()
    let ReactComponent
    let componentName
    let timesRendered = 0
    let state = null

    const componentSources = {
      ...additionalSources,
      DOM: generateDOMSource(domNodes),
      componentLifecycle: componentLC.stream,
      childrenActions: childActions.stream.switch().share(),
      actions: makeSubject().stream,
    }

    function createReactComponent() {
      const {
        view,
        actions,
        reducers,
        initialState,
        shouldComponentUpdate,
        propTypes,
        displayName,
      } = constructor(props)

      componentName = displayName || constructor.name
      state = initialState

      class ReactClass extends Component {

        componentDidMount() {
          if (actions) {
            const componentActions = actions(componentSources, props)
            createActionsStream(componentActions).subscribe(componentSources.actions)
          }

          if (reducers) {
            const componentReducers = reducers(componentSources, props)
            const state$ = createStateStream(componentReducers, initialState, componentLC.observer.next)

            state$
              .merge(updateState.stream)
              .subscribe((newState) => {
                state = newState
                componentLC.observer.next({ type: 'componentUpdated', state })

                if (newState) {
                  this.setState(newState)
                } else {
                  this.forceUpdate()
                }
              })
          }

          updateChildActions()
        }

        shouldComponentUpdate(nextProps, nextState) {
          if (shouldComponentUpdate) {
            return shouldComponentUpdate(nextProps, nextState, props, state)
          }
          return true
        }

        componentDidUpdate() {
          const el = findDOMNode(this)
          updateDomStreams(domNodes, el)
        }

        componentWillUnmount() {
          console.log("unmount")
        }

        render() {
          timesRendered++
          if (!view) return null
          return view(state, props, jsxHandler)
        }
      }

      ReactClass.displayName = componentName
      ReactClass.propTypes = propTypes || null

      return ReactClass
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

      const newActions = mergeChildrenActions(getChildren())

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

    const thisComponent = {
      updateChildActions,
      getChildren,
      getActions: () => componentSources.actions,
      getReactComponent: () => ReactComponent,
      getName: () => componentName,
      getKey: () => key,
      getState: () => state,
      getConstructor: () => constructor,
    }

    if (!parent) {
      if (rootComponent) throw new Error('rootComponent already set')
      rootComponent = thisComponent
    }

    ReactComponent = createReactComponent()

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

  function createStateStream(componentReducers, initialState, notify) {
    if (!Array.isArray(componentReducers)) {
      componentReducers = [componentReducers]
    }

    return Observable.merge(...componentReducers)
      .startWith(initialState)
      .scan((state, { reducer, action }) => {
        if (notify) notify({ type: 'willCallReducer', action, reducer })
        return reducer(state, action)
      })
      .share()
  }

  function createActionsStream(componentActions) {
    if (!Array.isArray(componentActions)) {
      componentActions = [componentActions]
    }
    return Observable.merge(...componentActions).filter(action => action)
  }

  function mergeChildrenActions(childrenComponents) {
    if (!childrenComponents.length) return false

    return Observable.merge(...childrenComponents
        .filter(component => component.getActions())
        .map(component => component.getActions())
    )
  }

  function registerComponent(newComponent, children) {
    const constructor = newComponent.getConstructor()
    const key = newComponent.getKey()
    const name = newComponent.getName()

    const obj = children.get(constructor) || {}

    if (obj[key]) throw Error(`Could not register recycle component '${name}'. Key '${key}' is already in use.`)

    obj[key] = newComponent
    children.set(constructor, obj)
  }

  function isReactComponent(constructor) {
    if (constructor.prototype.render) {
      return true
    }
    return false
  }

  function createReactElement(createElementHandler, args, jsx) {
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

  function getComponentStructure() {
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

  return {
    createComponent,
    getComponentStructure,
    makeSubject,
    generateDOMSource,
    updateDomStreams,
    createStateStream,
    createActionsStream,
    mergeChildrenActions,
    registerComponent,
    isReactComponent,
    createReactElement,
  }
}
