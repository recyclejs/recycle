import Recycle from './recycle'
import React from 'react'
import ReactDOM from 'react-dom'
import {Observable, Subject} from 'rxjs'
import {reducer, filterByType} from './observable'

Observable.prototype.filterByType = filterByType
Observable.prototype.reducer = reducer

export default function createRecycle() {

  let recycle = Recycle({
    createClass: React.createClass, 
    createElement: React.createElement, 
    findDOMNode: ReactDOM.findDOMNode,
    Observable,
    Subject
  })

  let key = 0
  function createReactElement(constructor, props) {
    return React.createElement(recycle.Component(constructor, key++).getReactComponent(), props)
  }

  function render(Component, target) {
    return ReactDOM.render(createReactElement(Component), target)
  }

  return {
    render,
    createReactElement
  }
}

export {
  React,
  ReactDOM,
  Observable
}