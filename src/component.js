import React from 'react'
import ReactDOM from 'react-dom'
import { Observable, makeSubject, mergeArray } from './rxjs'

// todo export react propTypes
function isReactClass(component) {
  return (component.prototype.render)
}

function recycleComponent(constructor, parent) {

  let reactComponent
  let actions$
  let childActions = makeSubject()
  let componentLifecycle = makeSubject()
  let childrenComponents = []
  let savedChildren = new Map()
  let timesRendered = 0
  let inErrorState = false

  const updateChildActions = () => {
    if (!childrenComponents.length)
      return

    childActions.observer.next(mergeArray(
      childrenComponents
        .filter(component => component.getActionsStream())
        .map(component => component.getActionsStream())
    ))
  }

  const jsx = function(tag, props) {
    if (typeof tag == 'function') {

      if (isReactClass(tag)) {
        let originalRender = tag.prototype.render
        tag.prototype.render = function() {
          return originalRender.call(this, this.props._renderHandler)
        }
        
        if (!props)
          props = {}

        props._renderHandler = jsx
        return React.createElement.apply(React, arguments)
      }

      let key = (props) ? props.key : null

      if (!inErrorState && getSaved(tag, key) && timesRendered == 1) {
        inErrorState = true
        if (!key)
          throw new Error(`Recycle component '${tag.name}' called multiple times without the key property`)
        else
          throw new Error(`Recycle component '${tag.name}' called multiple times with the same key property '${key}'`)
      }

      if (getSaved(tag, key))
        return React.createElement(getSaved(tag, key).getReactComponent(), props)

      setSaved(tag, key, recycleComponent(tag, thisComponent))
      
      return React.createElement(getSaved(tag, key).getReactComponent(), props)
    }
    return React.createElement.apply(React, arguments)
  }

  const render = ({view, actions, reducers, initialState, shouldComponentUpdate, propTypes, defaultProps, displayName}) => {

    class ReactComponent extends React.Component {
      constructor(props) {
        super(props);
        
        this.domSelectors = {}
        this.state = initialState
      }

      componentDidUpdate() {
        let el = ReactDOM.findDOMNode(this)
        updateDomObservables(this.domSelectors, el)
        componentLifecycle.observer.next({ type: 'componentUpdated', state: this.state })
      }

      componentDidMount() {
        
        let componentSources = {
          DOM: (selector) => ({
            events: (event) => getDomObservable(this.domSelectors, selector, event)
          }),
          componentLifecycle: componentLifecycle.stream,
          childrenActions: childActions.stream.switch().share(),
          actions: makeSubject().stream
        }

        if (actions) {
          let componentActions = actions(componentSources, this.props)
          if (!Array.isArray(componentActions))
            componentActions = [componentActions]

          actions$ = mergeArray(componentActions).filter(action => action)
          actions$.subscribe(componentSources.actions)
        }

        if (reducers) {
          let componentReducers = reducers(componentSources, this.props)
          if (!Array.isArray(componentReducers))
            componentReducers = [componentReducers]

          let state$ = mergeArray(componentReducers)
            .startWith(initialState)
            .scan((state, {reducer, action}) => {
              componentLifecycle.observer.next({ type: 'willCallReducer', action, reducer})
              return reducer(state, action)
            })
            .share()

          state$.subscribe((state) => {
            this.setState(state)
          })

          if (parent)
            parent.updateChildActions()

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

    reactComponent = ReactComponent
  }

  const renderContainer = () => {

  }

  const addChild = (c) => {
    childrenComponents.push(c);
  }

  const getSaved = (fn, key) => {
    if (!savedChildren.has(fn))
      return false

    return savedChildren.get(fn)[key]
  }
  
  const setSaved = (fn, key, val) => {
    
    let obj = savedChildren.get(fn) || {}
    
    if (obj[key])
      throw Error(`Could not register recycle component '${fn.name}'. Key '${key}' is already in use.`)
    
    obj[key] = val

    savedChildren.set(fn, obj)
  }

  const getActionsStream = () => {
    return actions$;
  }

  const getReactComponent = () => {
    return reactComponent;
  }

  render(constructor())

  const thisComponent =  {
    render,
    renderContainer,
    updateChildActions,
    addChild,
    getActionsStream,
    getReactComponent,
  }

  if (parent) {
    parent.addChild(thisComponent)
  }

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

export default recycleComponent