import React from 'react'
import ReactDOM from 'react-dom'
import { Router, Route, hashHistory } from 'react-router'
import 'todomvc-common/base.css'
import 'todomvc-app-css/index.css'
import TodoList from './components/TodoList'

// RECYCLE DEFINED USING DEFAULT ADAPTER
// import Recycle from 'recyclejs'

// RECYCLE DEFINED USING CUSTOM ADAPTER
import Rx from 'rxjs/Rx'
import streamAdapter from 'recyclejs/adapter/rxjs'
import componentAdapter, { createRecycle } from 'recyclejs/adapter/react'
const Recycle = createRecycle(componentAdapter(React), streamAdapter(Rx))

const TodoListReact = Recycle()(TodoList)

ReactDOM.render((
  <Router history={hashHistory}>
    <Route path='/' filter='' component={TodoListReact} />
    <Route path='/completed' filter='completed' component={TodoListReact} />
    <Route path='/active' filter='active' component={TodoListReact} />
  </Router>
), document.getElementById('root'))
