import 'todomvc-common/base.css'
import 'todomvc-app-css/index.css'
import createRecycle from '../../src/index'
import adapter, { ReactDOM, jsx } from '../../src/adapter/react-rxjs'
import createStore from '../../src/plugins/store'
import { Router, Route, hashHistory } from 'react-router'
import TodoList from './containers/TodoList/index'
import { updateLocalStorage, getFromLocalStorage } from './utils'

const recycle = createRecycle({
  adapter,
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
