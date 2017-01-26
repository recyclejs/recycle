import { PropTypes } from 'react'
import view from './view'
import TodoItem from '../TodoItem'
import Footer from '../Footer'
import { SHOW_ALL, SHOW_ACTIVE, SHOW_COMPLETED } from '../../constants/TodoFilters'

const MainSection = (props) => ({
  propTypes: {
    todos: PropTypes.array.isRequired,
    actions: PropTypes.object.isRequired
  },

  initialState: { filter: SHOW_ALL },

  actions (sources) {
    return [
      sources.select(TodoItem)
        .allActions(),

      sources.select(Footer)
        .allActions(),

      sources.selectClass('toggle-all')
        .on('change')
        .map(props.actions.completeAll)
    ]
  },

  reducers (sources) {
    return [
      sources.select(Footer)
        .on('TODO_FILTER')
        .reducer(function (state, action) {
          state.filter = action.filter
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
      filter: state.filter,
      onClearCompleted: props.actions.clearCompleted,
      onShow: (filter) => ({ type: 'TODO_FILTER', filter })
    })
  }
})

export default MainSection
