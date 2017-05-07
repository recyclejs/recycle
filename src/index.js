import React from 'react'
import component from './component'
import { Subject } from 'rxjs/Subject'
import { BehaviorSubject } from 'rxjs/BehaviorSubject'
import { Observable } from 'rxjs/Observable'
import 'rxjs/add/observable/merge'
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/mapTo'
import 'rxjs/add/operator/do'
import 'rxjs/add/operator/filter'
import 'rxjs/add/operator/switch'

const Rx = {
  Subject,
  Observable,
  BehaviorSubject
}

const recycle = component(React, Rx)
export { reducer } from './customRxOperators'
export default recycle
