import React from 'react'
import ReactDOM from 'react-dom'
import MultipleClickCounters from './components/MultipleClickCounters'

// RECYCLE DEFINED USING DEFAULT ADAPTER
// import Recycle from 'recyclejs'

// RECYCLE DEFINED USING CUSTOM ADAPTER
import Rx from 'rxjs/Rx'
import createRecycle from 'recyclejs/react'
const Recycle = createRecycle(React, Rx)

ReactDOM.render((
  <Recycle root={MultipleClickCounters} />
), document.getElementById('root'))
