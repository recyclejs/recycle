import createRecycle from '../../src/index'
import reactRxjs from '../../src/adapter/react-rxjs'
import TodoList from './TodoList/index'
import 'todomvc-common/base.css'
import 'todomvc-app-css/index.css'

const recycle = createRecycle({ adapter: reactRxjs })

// Wrapping Recycle component in React component
// so it can be used inside React Router
export default recycle.toReact(TodoList)

// If you are not using React Router
// you can render it directly to the DOM
// recycle.render(TodoList, document.getElementById('app'))
