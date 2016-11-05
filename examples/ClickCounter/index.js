import createRecycle from '../../src/index'
import ReactRxJS from '../../src/adapter/react-rxjs'
import React from 'react'
import ReactDOM from 'react-dom'
import WrapMultipleCounters from './WrapMultipleCounters'

let recycle = createRecycle({
  adapter: ReactRxJS
})

recycle.render(WrapMultipleCounters, document.getElementById('app'))