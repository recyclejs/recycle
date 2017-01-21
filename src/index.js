import React from 'react'
import { Subject } from 'rxjs/Subject'
import { Observable } from 'rxjs/Observable'
import 'rxjs/add/observable/merge'
import 'rxjs/add/operator/withLatestFrom'
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/take'
import 'rxjs/add/operator/mapTo'
import 'rxjs/add/operator/do'
import 'rxjs/add/operator/share'
import 'rxjs/add/operator/switch'
import 'rxjs/add/operator/filter'
import 'rxjs/add/operator/merge'

import streamAdapter from './adapter/rxjs'
import createRecycle from './react'

export default createRecycle(React, streamAdapter({ Observable, Subject }))

export {
  Observable,
  Subject,
  React
}
