import { PropTypes } from 'react'
import view from './view'
import TodoTextInput from '../TodoTextInput'

const TodoItem = () => ({
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
        .mapToLatest(sources.props)
        .map(props => props.deleteTodo(props.todo.id)),

      sources.selectClass('toggle')
        .on('change')
        .mapToLatest(sources.props)
        .map(props => props.completeTodo(props.todo.id)),

      sources.select(TodoTextInput)
        .allActions()
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
        .allActions()
        .reducer(function (state) {
          state.editing = false
          return state
        })
    ]
  },

  view (props, state) {
    return view({
      todo: props.todo,
      editing: state.editing,
      editTodo: (text) => props.editTodo(props.todo.id, text)
    })
  }
})

export default TodoItem
