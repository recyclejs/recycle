import React from 'react'
import { render } from 'react-dom'
import { createStore } from 'redux'
import 'todomvc-app-css/index.css'
import reduxDriver from 'recyclejs/drivers/redux'

// RECYCLE DEFINED USING DEFAULT ADAPTER
// import Recycle from 'recyclejs'

// RECYCLE DEFINED USING CUSTOM ADAPTER
import Rx from 'rxjs/Rx'
import createRecycle from 'recyclejs/react'
const Recycle = createRecycle(React, Rx)

// 'REDUX-WAY' FOR DEFINING REDUCERS
import rootReducer from './reducers'
import App from './containers/App'

// ALTERNATIVE USING SPECIAL RECYCLE ACTIONS
// import App from './containers/App-Alternative'

// function rootReducer (state, action) {
//   switch (action.type) {
//     case 'RECYCLE_REDUCER':
//       return action.payload
//     default:
//       return state
//   }
// }

const store = reduxDriver(createStore(rootReducer))

render(<Recycle root={App} drivers={[store]} />, document.getElementById('root'))
