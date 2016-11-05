import Recycle from './recycle'
import React from 'react'
import ReactDOM from 'react-dom'
import {Observable, Subject} from 'rxjs'
import {reducer, filterByType} from './observable'

Observable.prototype.filterByType = filterByType
Observable.prototype.reducer = reducer

export default function (constructor, props) {

  let { Component } = Recycle({
    createClass: React.createClass, 
    createElement: React.createElement, 
    findDOMNode: ReactDOM.findDOMNode,
    Observable,
    Subject
  })

  return React.createElement(Component(constructor).getReactComponent(), props)
}

export {
  React,
  ReactDOM,
  Observable
}