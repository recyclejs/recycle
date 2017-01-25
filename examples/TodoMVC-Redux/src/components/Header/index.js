import React from 'react'
import TodoTextInput from '../TodoTextInput'

function Header (props) {
  return {
    actions (sources) {
      return [
        sources.select(TodoTextInput)
          .allActions()
      ]
    },

    view (props) {
      return (
        <header className='header'>
          <h1>todos</h1>
          <TodoTextInput newTodo onSave={props.addTodo} placeholder='What needs to be done?' />
        </header>
      )
    }
  }
}

export default Header
