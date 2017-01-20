import { PropTypes } from 'react'
import view from './view'
import TodoTextInput from '../TodoTextInput'
import { TEXT_INPUT } from '../../constants/ActionTypes'

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
        sources.selectClass('destroy')
          .on('click')
          .mapTo(props.deleteTodo(props.todo.id)),

        sources.selectClass('toggle')
          .on('change')
          .mapTo(props.completeTodo(props.todo.id)),

        sources.select(TodoTextInput)
          .on(TEXT_INPUT)
          .map(a => props.editTodo(props.todo.id, a.value))
      ]
    },

    reducers (sources) {
      return [
        sources.select('label')
          .on('doubleClick')
          .reducer(function (state) {
            state.editing = true
            return state
          }),

        sources.select(TodoTextInput)
          .on(TEXT_INPUT)
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
