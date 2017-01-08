import React from 'react'
import Header from '../../components/Header'
import MainSection from '../../components/MainSection'
import * as actions from '../../actions'
import { ADD_TODO, DELETE_TODO, EDIT_TODO, COMPLETE_TODO, COMPLETE_ALL, CLEAR_COMPLETED } from '../../constants/ActionTypes'
import { addTodo, deleteTodo, editTodo, completeTodo, completeAll, clearCompleted } from './reducers'

export default function App () {
  return {
    reducerPath: 'todos',

    dispatch (childrenActions) {
      return [
        childrenActions
          .filterByType(ADD_TODO)
          .reducer(addTodo),

        childrenActions
          .filterByType(DELETE_TODO)
          .reducer(deleteTodo),

        childrenActions
          .filterByType(EDIT_TODO)
          .reducer(editTodo),

        childrenActions
          .filterByType(COMPLETE_TODO)
          .reducer(completeTodo),

        childrenActions
          .filterByType(COMPLETE_ALL)
          .reducer(completeAll),

        childrenActions
          .filterByType(CLEAR_COMPLETED)
          .reducer(clearCompleted)

        //  for chaining async operations like ajax:
        //
        //  childrenActions
        //    .filterByType(ADD_TODO)
        //    .switchMap(todo =>
        //      Observable.ajax({ url: '/addtodo', method: 'POST', body: todo })
        //        .reducer(addTodo)
        //        .catch(errorAction)
        //    )
      ]
    },

    view (props, state) {
      return (
        <div>
          <Header addTodo={actions.addTodo} />
          <MainSection todos={state.todos} actions={actions} />
        </div>
      )
    }
  }
}
