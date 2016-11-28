import React from 'react'
import ReactDOM from 'react-dom'
import { Subject } from 'rxjs/Subject'
import { Observable } from 'rxjs/Observable'
import 'rxjs/add/observable/merge'
import 'rxjs/add/observable/fromEvent'
import 'rxjs/add/operator/withLatestFrom'
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/mapTo'
import 'rxjs/add/operator/do'
import 'rxjs/add/operator/share'
import 'rxjs/add/operator/switch'
import 'rxjs/add/operator/filter'
import 'rxjs/add/operator/merge'

export default {
  BaseComponent: React.Component,
  createElement: React.createElement,
  findDOMNode: ReactDOM.findDOMNode,
  render: ReactDOM.render,
  Observable,
  Subject
}

export const jsx = React.createElement

export {
  React,
  ReactDOM,
  Observable,
  Subject
}
