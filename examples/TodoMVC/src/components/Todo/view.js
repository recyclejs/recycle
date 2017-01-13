import React from 'react'
import classNames from 'classnames'

export default function view ({ completed, title, editing, inputVal }) {
  return (
    <li className={'todoRoot ' + classNames({ completed, editing })}>
      <div className='view'>
        <input className='toggle' type='checkbox' checked={completed} />
        <label className='label'>{title}</label>
        <button className='destroy' />
      </div>
      <input ref='edit' className='edit' type='text' value={inputVal} />
    </li>
  )
}

export function componentDidUpdate ({refs, state, prevState}) {
  if (!prevState.editing && state.editing) {
    const node = refs.edit
    node.focus()
    node.select()
  }
}
