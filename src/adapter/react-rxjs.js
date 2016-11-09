import React from 'react'
import ReactDOM from 'react-dom'
import { Observable, Subject } from 'rxjs'

Observable.prototype.reducer = function reducer(reducerFn) {
  if (arguments.length > 1) {
    return this.switchMap((action) => {
      const reducers = []
      for (let i = 0; i < arguments.length; i++) {
        reducers.push({ reducer: arguments[i], action })
      }
      return Observable.of(...reducers)
    })
  }
  return this.map(action => ({ reducer: reducerFn, action }))
}

Observable.prototype.filterByType = function filterByType(type) {
  return this.filter(action => action.type === type)
}

export default function (api) {
  /*api.registerHook('createComponent', () => {})
  api.setDependencies({
    Component: React.Component,
    createElement: React.createElement,
    findDOMNode: ReactDOM.findDOMNode,
    render: ReactDOM.render,
    Observable,
    Subject,
  })*/

  return {
    Component: React.Component,
    createElement: React.createElement,
    findDOMNode: ReactDOM.findDOMNode,
    render: ReactDOM.render,
    Observable,
    Subject,
  }
}

export {
  React,
  ReactDOM,
  Observable,
  Subject,
}
