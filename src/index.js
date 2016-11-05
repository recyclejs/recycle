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
    Subject,
  })
  
  function createReactElement(constructor, props) {
    return React.createElement(recycle.Component(constructor).getReactComponent(), props)
  }

  function render(Component, target) {
    return ReactDOM.render(createReactElement(Component), target)
  }

  let key = 0
  function createReactClass(constructor, jsx) {
    return React.createClass({
      render() {
        key++
        let props = Object.assign({}, {key}, this.props)
        return jsx(constructor, props)
      }
    })
  }

  return {
    render,
    createReactClass,
    createReactElement
  }
}

export {
  React,
  ReactDOM,
  Observable
}