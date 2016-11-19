import 'todomvc-common/base.css'
import 'todomvc-app-css/index.css'
import createRecycle from '../../src/index'
import reactRxjs from '../../src/adapter/react-rxjs'
import createStore from '../../src/middleware/store'
import TodoList from './containers/TodoList/index'

const store = createStore({
  initialState: {
    todos: {
      list: {}
    }
  }
})

const recycle = createRecycle({
  adapter: reactRxjs,
  middleware: [store]
})

recycle.render(TodoList, document.getElementById('app'))
