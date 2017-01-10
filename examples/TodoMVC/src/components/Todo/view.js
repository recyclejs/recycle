import React from 'react'
import classNames from 'classnames'

export default function view ({ completed, title, editing, inputVal }) {
  return (
    <li className={'todoRoot ' + classNames({ completed, editing })}>
      <div className='view'>
        <input recycle='toggle' className='toggle' type='checkbox' checked={completed} />
        <label recycle='label'>{title}</label>
        <button recycle='destroy' className='destroy' />
      </div>
      <input recycle='edit' className='edit' type='text' value={inputVal} />
    </li>
  )
}

export function componentDidUpdate ({select, state, prevState}) {
  if (!prevState.editing && state.editing) {
    const node = select('edit')
    node.focus()
    node.select()
  }
}
