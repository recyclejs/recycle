import 'todomvc-common/base.css'
import 'todomvc-app-css/index.css'
import createRecycle from '../../src/index'
import reactRxjs, { ReactDOM, jsx } from '../../src/adapter/react-rxjs'
import TodoList from './components/TodoList/index'
import { Router, Route, hashHistory } from 'react-router'

const recycle = createRecycle({ adapter: reactRxjs })

const TodoListReact = recycle.toReact(TodoList)

ReactDOM.render((
  <Router history={hashHistory}>
    <Route path='/' filter='' component={TodoListReact} />
    <Route path='/completed' filter='completed' component={TodoListReact} />
    <Route path='/active' filter='active' component={TodoListReact} />
  </Router>
), document.getElementById('app'))
