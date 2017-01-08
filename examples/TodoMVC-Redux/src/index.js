import React from 'react'
import { render } from 'react-dom'
import { createStore } from 'redux'
import 'todomvc-app-css/index.css'
import Recycle from 'recyclejs'
import recycleRedux from 'recyclejs/plugins/redux'

// "Redux-way" of defining reducers
import rootReducer from './reducers'
import App from './containers/App'

// Alternative way using special recycle actions
// import App from './containers/App-Alternative'
//
// function rootReducer (state, action) {
//   if (action.type === 'RECYCLE_REDUCER')
//     return action.payload
//
//   return state
// }

const initialState = {
  todos: [
    {
      text: 'Use Redux',
      completed: false,
      id: 0
    }
  ]
}
const store = recycleRedux(
  createStore(rootReducer, initialState)
)

const ReactApp = Recycle(store)(App)
render(<ReactApp />, document.getElementById('root'))
