import { PropTypes } from 'react'
import view from './view'
import TodoTextInput from '../TodoTextInput'
import { TODO_DELETE, TODO_LABEL, TODO_TOGGLE } from '../../constants/Selectors'

export default function TodoItem (props) {
  return {
    propTypes: {
      todo: PropTypes.object.isRequired,
      editTodo: PropTypes.func.isRequired,
      deleteTodo: PropTypes.func.isRequired,
      completeTodo: PropTypes.func.isRequired
    },

    initialState: {
      editing: false
    },

    actions (sources) {
      return [
        sources.select(TODO_DELETE)
          .on('click')
          .mapTo(props.deleteTodo(props.todo.id)),

        sources.select(TODO_TOGGLE)
          .on('change')
          .mapTo(props.completeTodo(props.todo.id)),

        sources.childrenActions
          .filterByComponent(TodoTextInput)
          .map(a => props.editTodo(props.todo.id, a.value))
      ]
    },

    reducers (sources) {
      return [
        sources.select(TODO_LABEL)
          .on('doubleClick')
          .reducer(function (state) {
            state.editing = true
            return state
          }),

        sources.childrenActions
          .filterByComponent(TodoTextInput)
          .reducer(function (state) {
            state.editing = false
            return state
          })
      ]
    },

    view (props, state) {
      return view({
        todo: props.todo,
        editing: state.editing
      })
    }
  }
}
