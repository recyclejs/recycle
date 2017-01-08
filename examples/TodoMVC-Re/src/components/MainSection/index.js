import { PropTypes } from 'react'
import view from './view'
import TodoItem from '../TodoItem'
import Footer from '../Footer'
import { SHOW_ALL, SHOW_ACTIVE, SHOW_COMPLETED } from '../../constants/TodoFilters'
import { TOGGLE_ALL, CLEAR_COMPLETED, TODO_FILTER } from '../../constants/Selectors'

export default function MainSection (props) {
  return {
    propTypes: {
      todos: PropTypes.array.isRequired,
      actions: PropTypes.object.isRequired
    },

    initialState: { filter: SHOW_ALL },

    actions (sources) {
      return [
        sources.select(TOGGLE_ALL)
          .on('change')
          .map(props.actions.completeAll),

        sources.childrenActions
          .filterByComponent(TodoItem),

        sources.childrenActions
          .filterByComponent(Footer)
          .filterByType(CLEAR_COMPLETED)
          .map(props.actions.clearCompleted)
      ]
    },

    reducers (sources) {
      return [
        sources.childrenActions
          .filterByComponent(Footer)
          .filterByType(TODO_FILTER)
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
