import React from 'react'
import classnames from 'classnames'
import TodoTextInput from '../TodoTextInput'
import { TODO_DELETE, TODO_LABEL, TODO_TOGGLE } from '../../constants/Selectors'

function view ({ todo, editing }) {
  let element
  if (editing) {
    element = (
      <TodoTextInput text={todo.text}
        editing={editing} />
    )
  } else {
    element = (
      <div className='view'>
        <input recycle={TODO_TOGGLE}
          return={todo.id}
          className='toggle'
          type='checkbox'
          checked={todo.completed} />
        <label recycle={TODO_LABEL} >
          {todo.text}
        </label>
        <button recycle={TODO_DELETE}
          return={todo.id}
          className='destroy' />
      </div>
    )
  }

  return (
    <li className={classnames({
      completed: todo.completed,
      editing: editing
    })}>
      {element}
    </li>
  )
}

export default view
