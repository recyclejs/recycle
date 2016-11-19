import { destroy, setTitle, toggleTodo } from './reducers'
import Todo from '../../components/Todo/index'

export default function TodoContainer (props) {
  return {
    storePath: `todos.list[${props.id}]`,

    reducers (sources) {
      return [
        sources.childrenActions
          .filterByType('destroy')
          .reducer(destroy),

        sources.childrenActions
          .filterByType('titleChanged')
          .reducer(setTitle),

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
