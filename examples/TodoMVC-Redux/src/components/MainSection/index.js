import { PropTypes } from 'react'
import view from './view'
import TodoItem from '../TodoItem'
import Footer from '../Footer'
import { SHOW_ALL, SHOW_ACTIVE, SHOW_COMPLETED } from '../../constants/TodoFilters'
import { CLEAR_COMPLETED, TODO_FILTER, EDIT_TODO, DELETE_TODO, COMPLETE_TODO } from '../../constants/ActionTypes'

export default function MainSection (props) {
  return {
    propTypes: {
      todos: PropTypes.array.isRequired,
      actions: PropTypes.object.isRequired
    },

    initialState: { filter: SHOW_ALL },

    actions (sources) {
      return [
        sources.select(TodoItem)
          .on(EDIT_TODO),

        sources.select(TodoItem)
          .on(DELETE_TODO),

        sources.select(TodoItem)
          .on(COMPLETE_TODO),

        sources.selectClass('toggle-all')
          .on('change')
          .map(props.actions.completeAll),

        sources.select(Footer)
          .on(CLEAR_COMPLETED)
          .map(props.actions.clearCompleted)
      ]
    },

    reducers (sources) {
      return [
        sources.select(Footer)
          .on(TODO_FILTER)
          .reducer(function (state, action) {
            state.filter = action.value
            return state
          })
      ]
    },

    view (props, state) {
      const todoFilters = {
        [SHOW_ALL]: () => true,
        [SHOW_ACTIVE]: todo => !todo.completed,
        [SHOW_COMPLETED]: todo => todo.completed
      }

      return view({
        todos: {
          length: props.todos.length,
          filtered: props.todos.filter(todoFilters[state.filter]),
          completed: props.todos.filter(todo => todo.completed).length
        },
        actions: props.actions,
        filter: state.filter
      })
    }
  }
}
