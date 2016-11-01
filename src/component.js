import React from 'react'
import ReactDOM from 'react-dom'
import { Observable, makeSubject, mergeArray } from './rxjs'

export default function recycleComponent(constructor, parent) {

  let ReactComponent
  let actions$
  let childActions = makeSubject()
  let componentLifecycle = makeSubject()
  let childrenComponents = []
  let savedChildren = new Map()
  let timesRendered = 0
  let domSelectors = {}

  const updateChildActions = () => {
    if (parent)
      parent.updateChildActions()
    
    generateNewActions(childrenComponents, childActions.observer.next)
  }

  const generateSources = (domSelectors) => {
    return {
      DOM: (selector) => ({
        events: (event) => getDomObservable(domSelectors, selector, event)
      }),
      componentLifecycle: componentLifecycle.stream,
      childrenActions: childActions.stream.switch().share(),
      actions: makeSubject().stream
    }
  }

  const jsx = function() {
    if (typeof arguments['0'] == 'function') {

      let constructor = arguments['0']
      let props = arguments['1'] || {}
      let key = props.key

      if (isReactClass(constructor))
        return getReactElement(arguments, jsx)

      validateChild(constructor, key, savedChildren, timesRendered)

      if (getChild(constructor, key, savedChildren))
        return React.createElement(getChild(constructor, key, savedChildren).getReactComponent(), props)

      updateChild(constructor, key, recycleComponent(constructor, thisComponent), savedChildren)
      
      return React.createElement(getChild(constructor, key, savedChildren).getReactComponent(), props)
    }
    return React.createElement.apply(React, arguments)
  }

  const render = ({view, actions, reducers, initialState, shouldComponentUpdate, propTypes, defaultProps, displayName}) => {

    ReactComponent = class extends React.Component {
      constructor(props) {
        super(props);
        this.state = initialState
      }

      componentDidUpdate() {
        let el = ReactDOM.findDOMNode(this)
        updateDomObservables(domSelectors, el)
        componentLifecycle.observer.next({ type: 'componentUpdated', state: this.state })
      }

      componentDidMount() {
        
        let componentSources = generateSources(domSelectors)

        if (actions) {
          let componentActions = actions(componentSources, this.props)
          if (!Array.isArray(componentActions))
            componentActions = [componentActions]

          actions$ = mergeArray(componentActions).filter(action => action)
          actions$.subscribe(componentSources.actions)
        }

        if (reducers) {
          let componentReducers = reducers(componentSources, this.props)
          let state$ = getStateStream(componentReducers, initialState, componentLifecycle)

          state$.subscribe((state) => {
            this.setState(state)
          })

          updateChildActions()
        }

        componentLifecycle.observer.next({ type: 'componentMounted', state: this.state })
      }

      render() {
        timesRendered++
        return view(this.state, this.props, jsx)
      }

      shouldComponentUpdate(nextProps, nextState) {
        if (shouldComponentUpdate) {
          return shouldComponentUpdate(nextProps, nextState, this.props, this.state)
        }
        return true
      }
    }

    if (propTypes)
      ReactComponent.propTypes = propTypes
    
    if (defaultProps)
      ReactComponent.defaultProps = defaultProps

    ReactComponent.displayName = displayName || constructor.name
  }

  const addChild = (c) => {
    childrenComponents.push(c);
  }

  const getActionsStream = () => {
    return actions$;
  }

  const getReactComponent = () => {
    return ReactComponent;
  }

  const thisComponent =  {
    render,
    updateChildActions,
    addChild,
    getActionsStream,
    getReactComponent,
  }

  if (parent) {
    parent.addChild(thisComponent)
  }

  render(constructor())

  return thisComponent;
}

function getDomObservable(domSelectors, selector, event) {
  if (domSelectors[selector] && domSelectors[selector][event])
    return domSelectors[selector][event].stream.switch().share()

  if (!domSelectors[selector])
    domSelectors[selector] = {}

  domSelectors[selector][event] = makeSubject()

  return domSelectors[selector][event].stream.switch().share()
}

function updateDomObservables(domSelectors, el) {
  for (let selector in domSelectors) {
    for (let event in domSelectors[selector]) {
      let domEl = el.querySelectorAll(selector)
      domSelectors[selector][event].observer.next(Observable.fromEvent(domEl, event))
    }
  }
}

function getStateStream(componentReducers, initialState, componentLifecycle) {
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

function getChild(fn, key, savedChildren) {
  if (!savedChildren.has(fn))
    return false

  return savedChildren.get(fn)[key]
}
  
function updateChild(fn, key, val, savedChildren) {
  let obj = savedChildren.get(fn) || {}
  
  if (obj[key])
    throw Error(`Could not register recycle component '${fn.name}'. Key '${key}' is already in use.`)
  
  obj[key] = val

  savedChildren.set(fn, obj)
}

function isReactClass(component) {
  return (component.prototype.render)
}

function getReactElement(args, jsx) {
  let constructor = args['0']
  let props = args['1'] || {}

  let originalRender = constructor.prototype.render
  constructor.prototype.render = function() {
    return originalRender.call(this, this.props._renderHandler)
  }
  
  props._renderHandler = jsx
  return React.createElement.apply(React, args)
}

function generateNewActions(childrenComponents, next) {
  if (!childrenComponents.length)
    return

  next(mergeArray(
    childrenComponents
      .filter(component => component.getActionsStream())
      .map(component => component.getActionsStream())
  ))
}

let inErrorState = false
function validateChild(constructor, key, savedChildren, timesRendered) {
  if (!inErrorState && getChild(constructor, key, savedChildren) && timesRendered === 1) {
    inErrorState = true
    if (!key)
      throw new Error(`Recycle component '${constructor.name}' called multiple times without the key property`)
    else
      throw new Error(`Recycle component '${constructor.name}' called multiple times with the same key property '${key}'`)
  }
}