import { deleteTodo, editTodo, toggleTodo } from './reducers'
import Todo from '../../components/Todo/index'

export default function TodoContainer (props) {
  return {
    storePath: `todos.list.${props.id}`,

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
      return <Todo title={state.title} completed={state.completed} />
    }
  }
}
