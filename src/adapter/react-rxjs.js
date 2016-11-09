import React from 'react'
import ReactDOM from 'react-dom'
import { Subject } from 'rxjs/Subject'
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/merge'
import 'rxjs/add/operator/do'
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/mapTo'
import 'rxjs/add/operator/share'
import 'rxjs/add/operator/switch'
import 'rxjs/add/operator/switchMap'
import 'rxjs/add/operator/filter'
import 'rxjs/add/operator/merge'
import 'rxjs/add/operator/scan'
import 'rxjs/add/operator/startWith'

export default {
  BaseComponent: React.Component,
  createElement: React.createElement,
  findDOMNode: ReactDOM.findDOMNode,
  render: ReactDOM.render,
  Observable,
  Subject,
}
