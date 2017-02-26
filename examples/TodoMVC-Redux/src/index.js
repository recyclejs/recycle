import React from 'react'
import Rx from 'rxjs/Rx'
import createRecycle from 'recyclejs/react'
import { render } from 'react-dom'
import { createStore } from 'redux'
import 'todomvc-app-css/index.css'
import reduxDriver from 'recyclejs/drivers/redux'

// 'REDUX-WAY' FOR DEFINING REDUCERS
import rootReducer from './reducers'
import App from './containers/App'

/*
// ALTERNATIVE USING SPECIAL RECYCLE ACTIONS
import App from './containers/App-Alternative'

function rootReducer (state, action) {
  switch (action.type) {
    case 'RECYCLE_REDUCER':
      return action.newState
    default:
      return state
  }
}
*/

// creating recycle instance
const recycle = createRecycle(React, Rx)

// applying drivers
recycle.use(reduxDriver(createStore(rootReducer)))

// creating root react component
const AppReact = recycle.createReactComponent(App)

// rendering
render(<AppReact />, document.getElementById('root'))
