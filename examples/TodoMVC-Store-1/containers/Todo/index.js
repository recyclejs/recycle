import { deleteTodo, editTodo, toggleTodo } from './reducers'
import Todo from '../../components/Todo/index'

export default function TodoContainer (props) {
  return {
    storePath: `todos`,

    reducers (sources) {
      return [
        sources.childrenActions
          .filterByType('destroy')
          .reducer(deleteTodo),

        sources.childrenActions
          .filterByType('titleChanged')
          .reducer(editTodo),

        sources.childrenActions
          .filterByType('toggle')
          .reducer(toggleTodo)
      ]
    },

    view (jsx, props, state) {
      const todo = state.list.find(todo => todo.id === props.id)
      if (!todo) {
        return null
      }
      return <Todo title={todo.title} id={todo.id} completed={todo.completed} />
    }
  }
}
