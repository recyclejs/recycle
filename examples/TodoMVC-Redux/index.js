import React from 'react'
import ReactDOM from 'react-dom'
import { Router, Route, hashHistory } from 'react-router'
import 'todomvc-common/base.css'
import 'todomvc-app-css/index.css'
import Recycle from '../../src/index'
import TodoList from './containers/TodoList'
import recycleRedux from '../../src/plugins/redux'
import { updateLocalStorage, getFromLocalStorage } from './utils'
import { createStore } from 'redux'
import todos from './reducers/todos'

const store = createStore(todos, {
  list: getFromLocalStorage()
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
