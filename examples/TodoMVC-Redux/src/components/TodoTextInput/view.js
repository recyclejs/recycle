import React from 'react'
import classnames from 'classnames'

function view ({ editing, isNewTodo, inputVal, placeholder }) {
  return (
    <input
      className={
        classnames({
          edit: editing,
          'new-todo': isNewTodo
        })
      }
      value={inputVal}
      type='text'
      placeholder={placeholder}
      autoFocus='true' />
  )
}

export default view
