import React from 'react'
import recycle from 'recycle'
import { toggleTodo } from '../actions'
import TodoList from '../components/TodoList'

const getVisibleTodos = (todos, filter) => {
  switch (filter) {
    case 'SHOW_ALL':
      return todos
    case 'SHOW_COMPLETED':
      return todos.filter(t => t.completed)
    case 'SHOW_ACTIVE':
      return todos.filter(t => !t.completed)
    default:
      throw new Error('Unknown filter: ' + filter)
  }
}

const VisibleTodoList = recycle({
  dispatch (sources) {
    return sources.select(TodoList)
      .addListener('onTodoClick')
      .map(toggleTodo)
  },

  update (sources) {
    return sources.store
      .reducer((state, store) => store)
  },

  view (props, state) {
    return <TodoList todos={getVisibleTodos(state.todos, state.visibilityFilter)} />
  }
})

export default VisibleTodoList
