import 'todomvc-common/base.css'
import 'todomvc-app-css/index.css'
import createRecycle from '../../src/index'
import reactRxjs from '../../src/adapter/react-rxjs'
import TodoList from './components/TodoList/index'

const recycle = createRecycle({ adapter: reactRxjs })

recycle.render(TodoList, document.getElementById('app'))
