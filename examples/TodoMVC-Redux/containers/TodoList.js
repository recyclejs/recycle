import TodoList from '../components/TodoList/index'
import React from 'react'

export default function TodoListContainer () {
  return {
    dispatch (childrenActions) {
      return childrenActions
    },

    view (props, state) {
      return <TodoList todos={state.list} filter={props.route.filter} />
    }
  }
}
