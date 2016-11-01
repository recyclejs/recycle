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
  let domSelectors = {}
  let inErrorState = false

  function jsxHandler() {
    if (typeof arguments['0'] == 'function') {

      let constructor = arguments['0']
      let props = arguments['1'] || {}
      let key = props.key

      if (isReactClass(constructor))
        return getReactElement(arguments, jsxHandler)

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
        updateDomObservables(domSelectors, el)
        componentLifecycle.observer.next({ type: 'componentUpdated', state: this.state })
      },

      componentDidMount() {
        
        let componentSources = generateSources(domSelectors, childActions, componentLifecycle)

        if (actions) {
          let componentActions = actions(componentSources, this.props)
          actions$ = createActionsStream(componentActions)
          actions$.subscribe(componentSources.actions)
        }

        if (reducers) {
          let componentReducers = reducers(componentSources, this.props)
          let state$ = createStateStream(componentReducers, initialState, componentLifecycle)

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

  function addChild(c) {
    childrenComponents.push(c);
  }

  function updateChildActions() {
    if (parent)
      parent.updateChildActions()
    
    generateNewActions(childrenComponents, childActions.observer.next)
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

export function getDomObservable(domSelectors, selector, event) {
  if (domSelectors[selector] && domSelectors[selector][event])
    return domSelectors[selector][event].stream.switch().share()

  if (!domSelectors[selector])
    domSelectors[selector] = {}

  domSelectors[selector][event] = makeSubject()

  return domSelectors[selector][event].stream.switch().share()
}

export function updateDomObservables(domSelectors, el) {
  for (let selector in domSelectors) {
    for (let event in domSelectors[selector]) {
      let domEl = el.querySelectorAll(selector)
      domSelectors[selector][event].observer.next(Observable.fromEvent(domEl, event))
    }
  }
}

export function createStateStream(componentReducers, initialState, componentLifecycle) {
  if (!Array.isArray(componentReducers))
      componentReducers = [componentReducers]

  return mergeArray(componentReducers)
    .startWith(initialState)
    .scan((state, {reducer, action}) => {
      componentLifecycle.observer.next({ type: 'willCallReducer', action, reducer})
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

export function isReactClass(constructor) {
  return (constructor.prototype.render)
}

export function getReactElement(args, jsx) {
  let constructor = args['0']
  let props = args['1'] || {}

  let originalRender = constructor.prototype.render
  constructor.prototype.render = function() {
    return originalRender.call(this, this.props._renderHandler)
  }
  
  props._renderHandler = jsx
  return React.createElement.apply(React, args)
}

export function generateNewActions(childrenComponents, next) {
  if (!childrenComponents.length)
    return

  next(mergeArray(
    childrenComponents
      .filter(component => component.getActions())
      .map(component => component.getActions())
  ))
}

export function generateSources(domSelectors, childActions, componentLifecycle) {
  return {
    DOM: (selector) => ({
      events: (event) => getDomObservable(domSelectors, selector, event)
    }),
    componentLifecycle: componentLifecycle.stream,
    childrenActions: childActions.stream.switch().share(),
    actions: makeSubject().stream
  }
}