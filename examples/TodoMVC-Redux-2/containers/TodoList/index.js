import { toggleAll, deleteCompleted, insertTodo } from './reducers'
import { objToArr } from '../../utils'
import TodoList from '../../components/TodoList/index'
import React from 'react'

export default function TodoListContainer () {
  return {
    storePath: 'todos.list',

    dispatch (childrenActions) {
      return [
        childrenActions
          .filterByType('toggleAll')
          .reducer(toggleAll),

        childrenActions
          .filterByType('deleteCompleted')
          .reducer(deleteCompleted),

        childrenActions
          .filterByType('insertTodo')
          .reducer(insertTodo)
      ]
    },

    view (props, state) {
      return <TodoList todos={objToArr(state)} filter={props.route.filter} />
    }
  }
}
