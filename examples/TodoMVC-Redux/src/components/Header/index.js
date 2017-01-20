import React from 'react'
import TodoTextInput from '../TodoTextInput'
import { TEXT_INPUT } from '../../constants/ActionTypes'

export default function Header (props) {
  return {
    actions (sources) {
      return [
        sources.select(TodoTextInput)
          .on(TEXT_INPUT)
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
