import createRecycle from '../../src/index'
import React from 'react'
import ReactDOM from 'react-dom'
import WrapMultipleCounters from './WrapMultipleCounters'

let recycle = createRecycle()
recycle.render(WrapMultipleCounters, document.getElementById('app'))