export default function ({
  createClass,
  createElement,
  findDOMNode,
  Observable,
  Subject,
  storeReducers,
  initialStoreState,
  additionalSources,
}) {
  const containerActions = []
  const storeActions = makeSubject()
  const storeActionsStream = storeActions.stream.switch().share()
  let rootComponent
  let storeState = initialStoreState
  let storeState$

  if (storeReducers) {
    storeState$ = createStateStream(storeReducers(storeActionsStream), initialStoreState)
    storeState$.subscribe((newState) => {
      storeState = newState
    })
  }

  function createComponent(constructor, key, parent) {
    const childActions = makeSubject()
    const componentLC = makeSubject()
    const childrenComponents = []
    const savedChildren = new Map()
    const domNodes = {}
    let reactComponent
    let actions$
    let componentName
    let timesRendered = 0
    let inErrorState = false
    let componentState = null

    const componentSources = {
      ...additionalSources,
      DOM: generateDOMSource(domNodes),
      componentLifecycle: componentLC.stream,
      childrenActions: childActions.stream.switch().share(),
      actions: makeSubject().stream,
    }

    function createReactComponent() {
      const {
        wrap,
        mapStateToProps,
        view,
        actions,
        reducers,
        initialState,
        shouldComponentUpdate,
        propTypes,
        defaultProps,
        displayName,
      } = constructor()

      if (wrap) {
        if (view) throw new Error('Container components can not have a view')
      }

      componentName = displayName || constructor.name

      return createClass({
        displayName: componentName,

        propTypes: propTypes || null,

        getDefaultProps() {
          return defaultProps || null
        },

        getInitialState() {
          return initialState || null
        },

        componentDidMount() {
          let componentActions

          if (wrap) {
            componentActions = (actions) ?
              actions(componentSources.childrenActions, this.props) :
              componentSources.childrenActions

            if (storeState$) {
              // todo: unsubscribe, shouldComponentUpdate check
              storeState$.subscribe(() => {
                this.forceUpdate()
              })
            }
            registerContainerActions(componentActions)
          } else if (actions) {
            componentActions = actions(componentSources, this.props)
          }

          if (componentActions) {
            actions$ = createActionsStream(componentActions)
            actions$.subscribe(componentSources.actions)
          }

          if (reducers) {
            const componentReducers = reducers(componentSources, this.props)
            const state$ = createStateStream(componentReducers, initialState, componentLC.observer.next)

            state$.subscribe((state) => {
              if (state) {
                this.setState(state)
              } else {
                this.forceUpdate()
              }
            })
          }

          updateChildActions()
          componentLC.observer.next({ type: 'componentMounted', state: this.state })
        },

        shouldComponentUpdate(nextProps, nextState) {
          if (shouldComponentUpdate) {
            return shouldComponentUpdate(nextProps, nextState, this.props, this.state)
          }
          return true
        },

        componentDidUpdate() {
          const el = findDOMNode(this)
          updateDomStreams(domNodes, el)
          componentState = this.state
          componentLC.observer.next({ type: 'componentUpdated', state: this.state })
        },


        render() {
          timesRendered++

          if (wrap) {
            const props = this.props

            if (mapStateToProps) {
              this.calcProps = mapStateToProps(storeState, props)
            }

            return jsxHandler(wrap, this.calcProps)
          }

          return view(this.state, this.props, jsxHandler)
        },
      })
    }

    function jsxHandler() {
      if (typeof arguments['0'] === 'function') {
        const component = arguments['0']
        const props = arguments['1'] || {}
        const componentKey = props.key
        delete props.key

        if (isReactComponent(component)) {
          return createReactElement(createElement, arguments, jsxHandler)
        }

        const child = (savedChildren.has(component)) ? savedChildren.get(component)[componentKey] : false

        if (child) {
          if (!inErrorState && timesRendered === 1) {
            inErrorState = true

            if (!child.getKey()) {
              throw new Error(`Recycle component '${child.getName()}' called multiple times without the key property`)
            } else {
              throw new Error(`Recycle component '${child.getName()}' called multiple times with the same key property '${child.getKey()}'`)
            }
          }

          return createElement(child.getReactComponent(), props)
        }

        const newComponent = createComponent(component, componentKey, thisComponent)
        registerComponent(newComponent, savedChildren)
        return createElement(newComponent.getReactComponent(), props)
      }
      return createElement.apply(this, arguments)
    }

    function addChild(component) {
      childrenComponents.push(component)
    }

    function updateChildActions() {
      if (parent) {
        parent.updateChildActions()
      }

      const newActions = mergeChildrenActions(childrenComponents)

      if (newActions) {
        childActions.observer.next(newActions)
      }
    }

    const getActions = () => actions$
    const getReactComponent = () => reactComponent
    const getName = () => componentName
    const getKey = () => key
    const getConstructor = () => constructor
    const getChildren = () => childrenComponents
    const getState = () => componentState

    const thisComponent = {
      updateChildActions,
      addChild,
      getActions,
      getReactComponent,
      getName,
      getKey,
      getChildren,
      getState,
      getConstructor,
    }

    if (parent) {
      parent.addChild(thisComponent)
    } else {
      if (rootComponent) {
        throw new Error('rootComponent already set')
      }
      rootComponent = thisComponent
    }

    reactComponent = createReactComponent()

    return thisComponent
  }

  function registerContainerActions(actionStream) {
    containerActions.push(actionStream)
    storeActions.observer.next(Observable.merge(...containerActions))
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

  function registerComponent(newComponent, savedChildren) {
    const constructor = newComponent.getConstructor()
    const key = newComponent.getKey()
    const name = newComponent.getName()

    const obj = savedChildren.get(constructor) || {}

    if (obj[key]) throw Error(`Could not register recycle component '${name}'. Key '${key}' is already in use.`)

    obj[key] = newComponent
    savedChildren.set(constructor, obj)
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
      return originalRender.call(this, this.props._recycleRenderHandler)
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

  function getRootComponent() {
    return rootComponent
  }

  return {
    createComponent,
    getRootComponent,
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
