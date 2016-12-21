import React from 'react'
import ReactDOM from 'react-dom'
import Rx from 'rxjs/Rx'
import createRecycle from '../../src/index'
import WrapMultipleCounters from './components/WrapMultipleCounters'

const recycle = createRecycle({
  adapter: [React, ReactDOM, Rx]
})

recycle.render(WrapMultipleCounters, document.getElementById('app'))
