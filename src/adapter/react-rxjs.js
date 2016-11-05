import React from 'react'
import ReactDOM from 'react-dom'
import { Observable, Subject } from 'rxjs'

Observable.prototype.reducer = function reducer(reducer) {
  if (arguments.length > 1) {
    return this.switchMap(action => {
      let reducers = []
      for (let i = 0; i < arguments.length; i++) {
        reducers.push({ reducer: arguments[i], action })
      }
      return Observable.of(...reducers)
    })
  }
  return this.map(action => ({ reducer, action }))
}

Observable.prototype.filterByType = function filterByType(type) {
  return this.filter(action => action.type === type)
}

export default function () {
  return {
    createClass: React.createClass,
    createElement: React.createElement,
    findDOMNode: ReactDOM.findDOMNode,
    render: ReactDOM.render,
    Observable,
    Subject
  }
}

export {
  React,
  ReactDOM,
  Observable,
  Subject
}