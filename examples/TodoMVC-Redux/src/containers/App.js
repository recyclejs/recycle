import React from 'react'
import Header from '../components/Header'
import MainSection from '../components/MainSection'
import * as actions from '../actions'
import * as actionTypes from '../constants/ActionTypes'

export default function App () {
  return {
    dispatch ({childrenActions}) {
      // dispatch actions from child components
      // accept only actions defined in ActionTypes
      return childrenActions.filter(a => actionTypes[a.type])
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
