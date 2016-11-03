import React from 'react'
import ReactDOM from 'react-dom'
import { Observable, makeSubject, mergeArray } from './rxjs'

export default function recycleComponent(constructor, componentKey, parent) {

  let ReactComponent
  let actions$
  let componentName
  let childActions = makeSubject()
  let componentLifecycle = makeSubject()
  let childrenComponents = []
  let savedChildren = new Map()
  let timesRendered = 0
  let domNodes = {}
  let inErrorState = false

  function createReactComponent() {
    let {
      view, 
      actions, 
      reducers, 
      initialState, 
      shouldComponentUpdate, 
      propTypes, 
      defaultProps, 
      displayName
    } = constructor()

    componentName = displayName || constructor.name

    return React.createClass({
      propTypes: propTypes || null,
      displayName: componentName,

      getDefaultProps() {
        return defaultProps || null
      },

      getInitialState() {
        return initialState || null
      },

      componentDidUpdate() {
        let el = ReactDOM.findDOMNode(this)
        updateDomStreams(domNodes, el)
        componentLifecycle.observer.next({ type: 'componentUpdated', state: this.state })
      },

      componentDidMount() {
        
        let componentSources = generateSources(domNodes, childActions, componentLifecycle)

        if (actions) {
          let componentActions = actions(componentSources, this.props)
          actions$ = createActionsStream(componentActions)
          actions$.subscribe(componentSources.actions)
        }

        if (reducers) {
          let componentReducers = reducers(componentSources, this.props)
          let state$ = createStateStream(componentReducers, initialState, componentLifecycle.observer.next)

          state$.subscribe((state) => {
            this.setState(state)
          })

          updateChildActions()
        }

        componentLifecycle.observer.next({ type: 'componentMounted', state: this.state })
      },

      render() {
        timesRendered++
        return view(this.state, this.props, jsxHandler)
      },

      shouldComponentUpdate(nextProps, nextState) {
        if (shouldComponentUpdate) {
          return shouldComponentUpdate(nextProps, nextState, this.props, this.state)
        }
        return true
      }
    })
  }

  function jsxHandler() {
    if (typeof arguments['0'] == 'function') {

      let constructor = arguments['0']
      let props = arguments['1'] || {}
      let key = props.key

      if (isReactComponent(constructor))
        return createReactElement(arguments, jsxHandler)

      let child = getChild(constructor, key, savedChildren)
      if (child) {
        if (!inErrorState && timesRendered === 1) {
          inErrorState = true
          
          if (!child.getKey())
            throw new Error(`Recycle component '${child.getName()}' called multiple times without the key property`)
          else
            throw new Error(`Recycle component '${child.getName()}' called multiple times with the same key property '${child.getKey()}'`)
        }

        return React.createElement(child.getReactComponent(), props)
      }

      let newComponent = recycleComponent(constructor, key, thisComponent)
      registerComponent(newComponent, savedChildren)
      return React.createElement(newComponent.getReactComponent(), props)

    }
    return React.createElement.apply(React, arguments)
  }

  function addChild(component) {
    childrenComponents.push(component);
  }


  function updateChildActions() {
    if (parent)
      parent.updateChildActions()
    
    let newActions = mergeChildrenActions(childrenComponents)
    if (newActions)
      childActions.observer.next(newActions)
  }

  const getActions = () => {
    return actions$;
  }

  const getReactComponent = () => {
    return ReactComponent;
  }
  
  const getName = () => {
    return componentName;
  }
  
  const getKey = () => {
    return componentKey;
  }
  
  const getConstructor = () => {
    return constructor;
  }

  const thisComponent =  {
    updateChildActions,
    addChild,
    getActions,
    getReactComponent,
    getName,
    getKey,
    getConstructor,
  }

  if (parent) {
    parent.addChild(thisComponent)
  }

  ReactComponent = createReactComponent()

  return thisComponent;
}

export function prepareDomNode(domNodes, selector, event) {
  if (!domNodes[selector])
    domNodes[selector] = {}
  
  if (!domNodes[selector][event])
    domNodes[selector][event] = makeSubject()
}

export function getDomStream(domNodes, selector, event) {
  return domNodes[selector][event].stream.switch().share()
}

export function updateDomStreams(domNodes, el) {
  for (let selector in domNodes) {
    for (let event in domNodes[selector]) {
      let domEl = el.querySelectorAll(selector)
      domNodes[selector][event].observer.next(Observable.fromEvent(domEl, event))
    }
  }
}

export function createStateStream(componentReducers, initialState, notify) {
  if (!Array.isArray(componentReducers))
      componentReducers = [componentReducers]

  return mergeArray(componentReducers)
    .startWith(initialState)
    .scan((state, {reducer, action}) => {
      notify({ type: 'willCallReducer', action, reducer})
      return reducer(state, action)
    })
    .share()
}

export function createActionsStream(componentActions) {
  if (!Array.isArray(componentActions))
    componentActions = [componentActions]

  return mergeArray(componentActions).filter(action => action)
}

export function getChild(fn, key, savedChildren) {
  if (!savedChildren.has(fn))
    return false

  return savedChildren.get(fn)[key]
}
  
export function registerComponent(newComponent, savedChildren) {
  let constructor = newComponent.getConstructor()
  let key = newComponent.getKey()
  let name = newComponent.getName()

  let obj = savedChildren.get(constructor) || {}

  if (obj[key])
    throw Error(`Could not register recycle component '${name}'. Key '${key}' is already in use.`)
  
  obj[key] = newComponent
  savedChildren.set(constructor, obj)
}

export function isReactComponent(constructor) {
  return (constructor.prototype.render) ? true : false
}

export function createReactElement(args, jsx) {
  let constructor = args['0']
  let props = args['1'] || {}

  let originalRender = constructor.prototype.render
  constructor.prototype.render = function() {
    return originalRender.call(this, this.props._recycleRenderHandler)
  }
  
  props._recycleRenderHandler = jsx
  
  let newArgs = []
  for (let i=0; i < args.length || i < 2; i++) {
    if (i === 0)
      newArgs.push(constructor)
    else if (i === 1)
      newArgs.push(props)
    else if (i > 1)
      newArgs.push(args[i])
  }

  return React.createElement.apply(React, newArgs)
}

export function mergeChildrenActions(childrenComponents) {
  if (!childrenComponents.length)
    return false

  return mergeArray(
    childrenComponents
      .filter(component => component.getActions())
      .map(component => component.getActions())
  )
}

export function generateSources(domNodes, childActions, componentLifecycle) {
  return {
    DOM: (selector) => ({
      events: (event) => {
        prepareDomNode(domNodes, selector, event)
        return getDomStream(domNodes, selector, event)
      }
    }),
    componentLifecycle: componentLifecycle.stream,
    childrenActions: childActions.stream.switch().share(),
    actions: makeSubject().stream
  }
}