import React from 'react'
import ReactDOM from 'react-dom'
import { Router, Route, hashHistory } from 'react-router'
import 'todomvc-common/base.css'
import 'todomvc-app-css/index.css'
import Recycle from '../../src/index'
import createStore from '../../src/plugins/store'
import TodoList from './containers/TodoList/index'
import { updateLocalStorage, getFromLocalStorage } from './utils'

const storePlugin = createStore({
  initialState: {
    todos: {
      list: getFromLocalStorage()
    }
  },
  onUpdate: updateLocalStorage
})

const TodoListReact = Recycle({
  root: TodoList,
  plugins: [storePlugin]
})

ReactDOM.render((
  <Router history={hashHistory}>
    <Route path='/' filter='' component={TodoListReact} />
    <Route path='/completed' filter='completed' component={TodoListReact} />
    <Route path='/active' filter='active' component={TodoListReact} />
  </Router>
), document.getElementById('app'))
