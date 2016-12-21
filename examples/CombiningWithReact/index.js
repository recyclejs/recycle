import React from 'react'
import ReactDOM from 'react-dom'
import Recycle from '../../src/index'
import CounterWithReact from './components/CounterWithReact'

ReactDOM.render((
  <Recycle root={CounterWithReact} />
), document.getElementById('app'))
