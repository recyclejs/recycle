import React from 'react'
import ReactDOM from 'react-dom'
import Rx from 'rxjs/Rx'
import createRecycle from '../../src/index'
import CounterWithReact from './components/CounterWithReact'

const recycle = createRecycle({
  adapter: [React, ReactDOM, Rx]
})
recycle.render(CounterWithReact, document.getElementById('app'))
