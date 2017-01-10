import React from 'react'
import { render } from 'react-dom'
import { createStore } from 'redux'
import 'todomvc-app-css/index.css'
import Recycle from 'recyclejs'
import recycleRedux from 'recyclejs/plugins/redux'

// "Redux-way" of defining reducers
// import rootReducer from './reducers'
// import App from './containers/App'

// Alternative way using special recycle actions
import App from './containers/App-Alternative'

function rootReducer (state, action) {
  switch (action.type) {
    case 'RECYCLE_REDUCER':
      return action.payload
    default:
      return state
  }
}

const store = recycleRedux(createStore(rootReducer))

render(<Recycle root={App} plugins={[store]} />, document.getElementById('root'))
