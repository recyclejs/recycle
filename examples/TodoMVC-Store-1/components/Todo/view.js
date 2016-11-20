import classNames from 'classnames'

export default function view (jsx, props, state) {
  return (
    <li className={'todoRoot ' + classNames({ completed: props.completed, editing: state.editing })}>
      <div className='view'>
        <input className='toggle' type='checkbox' checked={props.completed} />
        <label>{props.title}</label>
        <button className='destroy' />
      </div>
      <input className='edit' type='text' value={state.inputVal} />
    </li>
  )
}

export function componentDidUpdate ({select, state, prevState}) {
  if (!prevState.editing && state.editing) {
    const node = select('input.edit')
    node.focus()
    node.select()
  }
}
