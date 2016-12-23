import TodoList from '../components/TodoList/index'
import React from 'react'

export default function TodoListContainer () {
  return {
    dispatch (childrenActions) {
      return [
        childrenActions
          .filterByType('toggleAll'),

        childrenActions
          .filterByType('deleteCompleted'),

        childrenActions
          .filterByType('insertTodo')
      ]
    },

    view (props, state) {
      return <TodoList todos={state.list} filter={props.route.filter} />
    }
  }
}
