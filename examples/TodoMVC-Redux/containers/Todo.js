import Todo from '../components/Todo/index'
import React from 'react'

export default function TodoContainer (props) {
  return {
    dispatch (childrenActions) {
      return [
        childrenActions
          .filterByType('toggle')
          .map(action => ({ type: 'toggleTodo', id: action.id })),

        childrenActions
          .filterByType('destroy')
          .map(action => ({ type: 'deleteTodo', id: action.id })),

        childrenActions
          .filterByType('titleChanged')
          .map(action => ({ type: 'editTodo', id: action.id, title: action.title }))
      ]
    },

    view (props, state) {
      const todo = state.list.find(todo => todo.id === props.id)
      if (!todo) {
        return null
      }
      return <Todo title={todo.title} id={todo.id} completed={todo.completed} />
    }
  }
}
