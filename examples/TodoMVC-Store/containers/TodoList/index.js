import { toggleAll, deleteCompleted, insertTodo } from './reducers'
import { objToArr } from '../../utils'
import TodoList from '../../components/TodoList/index'

export default function TodoListContainer () {
  return {
    storePath: 'todos.list',

    reducers (sources) {
      return [
        sources.childrenActions
          .filterByType('toggleAll')
          .reducer(toggleAll),

        sources.childrenActions
          .filterByType('deleteCompleted')
          .reducer(deleteCompleted),

        sources.childrenActions
          .filterByType('insertTodo')
          .reducer(insertTodo)
      ]
    },

    view (jsx, props, state) {
      return <TodoList todos={objToArr(state)} filter={props.route.filter} />
    }
  }
}
