import React from 'react'
import ReactDOM from 'react-dom'
import WebsocketEcho from './components/WebsocketEcho'
import WebsocketDriver from './drivers/websocket'

// RECYCLE DEFINED USING DEFAULT ADAPTER
// import Recycle from 'recyclejs'

// RECYCLE DEFINED USING CUSTOM ADAPTER
import Rx from 'rxjs/Rx'
import streamAdapter from 'recyclejs/adapter/rxjs'
import componentAdapter, { createRecycle } from 'recyclejs/adapter/react'
const Recycle = createRecycle(componentAdapter(React), streamAdapter(Rx))

ReactDOM.render((
  <Recycle root={WebsocketEcho} drivers={[WebsocketDriver]} />
), document.getElementById('root'))
