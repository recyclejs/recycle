import React from 'react'
import Header from '../../components/Header'
import MainSection from '../../components/MainSection'
import * as actions from '../../actions'
import { ADD_TODO, DELETE_TODO, EDIT_TODO, COMPLETE_TODO, COMPLETE_ALL, CLEAR_COMPLETED } from '../../constants/ActionTypes'
import { addTodo, deleteTodo, editTodo, completeTodo, completeAll, clearCompleted } from './reducers'

const App = () => ({
  container: true,
  storePath: 'todos',
  initialState: [
    {
      text: 'Use Redux',
      completed: false,
      id: 0
    }
  ],

  actions (sources) {
    return [
      sources.select(Header)
        .on(ADD_TODO)
        .reducer(addTodo),

      sources.select(MainSection)
        .on(DELETE_TODO)
        .reducer(deleteTodo),

      sources.select(MainSection)
        .on(EDIT_TODO)
        .reducer(editTodo),

      sources.select(MainSection)
        .on(COMPLETE_TODO)
        .reducer(completeTodo),

      sources.select(MainSection)
        .on(COMPLETE_ALL)
        .reducer(completeAll),

      sources.select(MainSection)
        .on(CLEAR_COMPLETED)
        .reducer(clearCompleted)
    ]
  },

  view (props, todos) {
    return (
      <div>
        <Header addTodo={actions.addTodo} />
        <MainSection todos={todos} actions={actions} />
      </div>
    )
  }
})

export default App
