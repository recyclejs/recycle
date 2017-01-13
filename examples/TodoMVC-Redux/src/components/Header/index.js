import React from 'react'
import TodoTextInput from '../TodoTextInput'

export default function Header (props) {
  return {
    actions (sources) {
      return [
        sources.childrenActions
          .filterByComponent(TodoTextInput)
          .map(a => a.value.trim())
          .map(props.addTodo)
      ]
    },

    view () {
      return (
        <header className='header'>
          <h1>todos</h1>
          <TodoTextInput newTodo placeholder='What needs to be done?' />
        </header>
      )
    }
  }
}
