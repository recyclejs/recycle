import React from 'react'
import TodoTextInput from '../TodoTextInput'
import { TEXT_INPUT } from '../../constants/ActionTypes'

const Header = () => ({
  actions (sources) {
    return [
      sources.select(TodoTextInput)
        .on(TEXT_INPUT)
        .withLatestFrom(sources.props, (a, props) => {
          return props.addTodo(a.value.trim())
        })
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
})

export default Header
