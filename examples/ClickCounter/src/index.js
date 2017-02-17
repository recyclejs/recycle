import React from 'react'
import ReactDOM from 'react-dom'
import MultipleClickCounters from './components/MultipleClickCounters'

// RECYCLE DEFINED USING DEFAULT ADAPTER
// import Recycle from 'recyclejs'

// RECYCLE DEFINED USING CUSTOM ADAPTER
import Rx from 'rxjs/Rx'


import RecycleT from 'recyclejs/recycle'
import streamAdapter from 'recyclejs/adapter/rxjs'
import reactDriver from 'recyclejs/drivers/react'


const recycle = RecycleT(streamAdapter(Rx))
recycle.use(reactDriver(React))
const AppReact = recycle.createComponent(MultipleClickCounters).get('ReactComponent')
console.log(AppReact)