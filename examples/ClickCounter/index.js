import Recycle from '../../src/index'
import React from 'react'
import ReactDOM from 'react-dom'
import WrapMultipleCounters from './WrapMultipleCounters'

let RootComponent = Recycle(React, ReactDOM)(WrapMultipleCounters)

ReactDOM.render(React.createElement(RootComponent), document.getElementById('app'))