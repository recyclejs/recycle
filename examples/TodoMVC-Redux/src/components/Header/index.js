import React, { PropTypes } from 'react'
import TodoTextInput from '../TodoTextInput'

function Header (props) {
  return {
    propTypes: {
      addTodo: PropTypes.func.isRequired
    },

    actions (sources) {
      return [
        sources.select(TodoTextInput)
          .onAnyAction(props.addTodo)
      ]
    },

    view (props) {
      return (
        <header className='header'>
          <h1>todos</h1>
          <TodoTextInput newTodo placeholder='What needs to be done?' />
        </header>
      )
    }
  }
}

export default Header
