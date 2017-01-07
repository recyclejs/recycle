import { deleteTodo, editTodo, toggleTodo } from './reducers'
import Todo from '../../components/Todo/index'
import React from 'react'

export default function TodoContainer (props) {
  return {
    storePath: `todos.list.${props.id}`,

    dispatch (childrenActions) {
      return [
        childrenActions
          .filterByType('destroy')
          .reducer(deleteTodo),

        childrenActions
          .filterByType('titleChanged')
          .reducer(editTodo),

        childrenActions
          .filterByType('toggle')
          .reducer(toggleTodo)
      ]
    },

    view (props, state) {
      return <Todo title={state.title} completed={state.completed} />
    }
  }
}
