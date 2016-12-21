import React from 'react'
import ReactDOM from 'react-dom'
import Recycle from '../../src/index'
import WrapMultipleCounters from './components/WrapMultipleCounters'

ReactDOM.render((
  <Recycle root={WrapMultipleCounters} />
), document.getElementById('app'))
