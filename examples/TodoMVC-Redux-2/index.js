import React from 'react'
import ReactDOM from 'react-dom'
import { Router, Route, hashHistory } from 'react-router'
import 'todomvc-common/base.css'
import 'todomvc-app-css/index.css'
import Recycle from '../../src/index'
import recycleRedux from '../../src/plugins/redux'
import TodoList from './containers/TodoList/index'
import { createStore } from 'redux'
import { updateLocalStorage, getFromLocalStorage } from './utils'

function reducer (state, action) {
  switch (action.type) {
    case 'RECYCLE_REDUCER':
      return action.payload
    default:
      return state
  }
}

const store = createStore(reducer, {
  todos: {
    list: getFromLocalStorage()
  }
})

store.subscribe(() => {
  updateLocalStorage(store.getState())
})

const TodoListReact = Recycle(recycleRedux(store))(TodoList)

ReactDOM.render((
  <Router history={hashHistory}>
    <Route path='/' filter='' component={TodoListReact} />
    <Route path='/completed' filter='completed' component={TodoListReact} />
    <Route path='/active' filter='active' component={TodoListReact} />
  </Router>
), document.getElementById('app'))
