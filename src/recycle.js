export default function ({
  Component,
  createElement,
  findDOMNode,
  Observable,
  Subject,
  additionalSources,
  createComponentHook,
}) {
  let rootComponent

  function createComponent(constructor, props, parent) {
    const key = (props) ? props.key : null
    const domNodes = {}
    const children = new Map()
    const childActions = makeSubject()
    const componentUpdate = makeSubject()
    const updateState = makeSubject()
    let ReactComponent
    let componentName
    let timesRendered = 0
    let state = null
    let recycleProps

    const componentSources = {
      ...additionalSources,
      DOM: generateDOMSource(domNodes),
      componentUpdate: componentUpdate.stream.share(),
      childrenActions: childActions.stream.switch().share(),
      actions: makeSubject().stream.share(),
    }

    function createReactComponent() {
      recycleProps = (createComponentHook) ? createComponentHook(constructor, props) : constructor(props)
      const {
        view,
        actions,
        reducers,
        initialState,
        shouldComponentUpdate,
        propTypes,
        displayName,
      } = recycleProps

      componentName = displayName || constructor.name
      state = initialState

      if (actions) {
        const componentActions = actions(componentSources, props)
        Observable.merge(...forceArray(componentActions))
          .filter(action => action)
          .subscribe(componentSources.actions)
      }

      let state$ = updateState.stream.share()
      if (reducers) {
        state$ = Observable.merge(...forceArray(reducers(componentSources, props)))
          .startWith(initialState)
          .scan((currentState, { reducer, action }) => reducer(currentState, action))
          .merge(updateState.stream)
          .share()
      }

      class ReactClass extends Component {

        componentDidMount() {
          this.stateSubsription = state$.subscribe((newState) => {
            if (newState) {
              this.setState(newState)
            } else {
              this.forceUpdate()
            }
          })
          updateChildActions()
        }

        shouldComponentUpdate(nextProps, nextState) {
          if (shouldComponentUpdate) {
            return shouldComponentUpdate(nextProps, nextState, props, state)
          }
          return true
        }

        componentDidUpdate() {
          state = this.state
          componentUpdate.observer.next(state)
          const el = findDOMNode(this)
          updateDomStreams(domNodes, el)
        }

        componentWillUnmount() {
          this.stateSubsription.unsubscribe()
          parent.removeChild(thisComponent)
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

    function removeChild(component) {
      const components = children.get(component.getConstructor())
      delete components[component.getKey()]
      children.set(component.getConstructor(), components)
    }

    const thisComponent = {
      updateChildActions,
      getChildren,
      removeChild,
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

  function forceArray(arr) {
    if (!Array.isArray(arr)) return [arr]
    return arr
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
    forceArray,
    mergeChildrenActions,
    registerComponent,
    isReactComponent,
    createReactElement,
  }
}
