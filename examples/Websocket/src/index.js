import React from 'react'
import ReactDOM from 'react-dom'
import WebsocketEcho from './components/WebsocketEcho'
import WebsocketDriver from './drivers/websocket'

// RECYCLE DEFINED USING DEFAULT ADAPTER
import Recycle from 'recyclejs'

// RECYCLE DEFINED USING CUSTOM ADAPTER
// import Rx from 'rxjs/Rx'
// import createRecycle from 'recyclejs/react'
// const Recycle = createRecycle(React, Rx)

ReactDOM.render((
  <Recycle root={WebsocketEcho} drivers={WebsocketDriver} />
), document.getElementById('root'))
