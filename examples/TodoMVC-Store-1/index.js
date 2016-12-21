import React from 'react'
import ReactDOM from 'react-dom'
import Rx from 'rxjs/Rx'
import 'todomvc-common/base.css'
import 'todomvc-app-css/index.css'
import createRecycle from '../../src/index'
import createStore from '../../src/plugins/store'
import { Router, Route, hashHistory } from 'react-router'
import TodoList from './containers/TodoList/index'
import { updateLocalStorage, getFromLocalStorage } from './utils'

const recycle = createRecycle({
  adapter: [React, ReactDOM, Rx],
  plugins: [
    createStore({
      initialState: {
        todos: {
          list: getFromLocalStorage()
        }
      },
      onUpdate: updateLocalStorage
    })
  ]
})

const TodoListReact = recycle.toReact(TodoList)

ReactDOM.render((
  <Router history={hashHistory}>
    <Route path='/' filter='' component={TodoListReact} />
    <Route path='/completed' filter='completed' component={TodoListReact} />
    <Route path='/active' filter='active' component={TodoListReact} />
  </Router>
), document.getElementById('app'))
