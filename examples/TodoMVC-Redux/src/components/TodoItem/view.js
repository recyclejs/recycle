import React from 'react'
import classnames from 'classnames'
import TodoTextInput from '../TodoTextInput'

function view ({ todo, editing, editTodo }) {
  let element
  if (editing) {
    element = (
      <TodoTextInput text={todo.text}
        onSave={editTodo}
        editing={editing} />
    )
  } else {
    element = (
      <div className='view'>
        <input
          return={todo.id}
          className='toggle'
          type='checkbox'
          checked={todo.completed} />
        <label>
          {todo.text}
        </label>
        <button
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
