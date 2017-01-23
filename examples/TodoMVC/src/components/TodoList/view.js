import React from 'react'
import Todo from '../Todo'

export default function view ({ todos, inputVal, filter }) {
  let completed = todos.filter(todo => todo.completed).length
  let active = todos.length - completed

  return (
    <div className='todoapp'>
      <header className='header'>
        <h1>todos</h1>
        <input
          className='new-todo'
          type='text'
          value={inputVal}
          placeholder='What needs to be done?'
          name='newTodo' />
      </header>

      <section className='main' style={{ 'display': todos.length ? '' : 'none' }}>
        <input className='toggle-all' type='checkbox' defaultChecked={active === 0} />
        <ul className='todo-list'>
          {
            todos
              .filter(todoProps => !(filter === 'active' && todoProps.completed))
              .filter(todoProps => !(filter === 'completed' && !todoProps.completed))
              .map(props => (
                <Todo
                  keyFun={function () {}}
                  id={props.id}
                  title={props.title}
                  completed={props.completed}
                  key={props.id}
                />
              ))
          }
        </ul>
      </section>

      <footer className='footer' style={{ 'display': todos.length ? '' : 'none' }}>
        <span className='todo-count'>
          <strong>{active}</strong>
          <span>{' item' + (active !== 1 ? 's' : '') + ' left'}</span>
        </span>
        <ul className='filters'>
          <li><a href='#/' className={(filter === '') ? 'selected' : ''}>All</a></li>
          <li><a href='#/active' className={(filter === 'active') ? 'selected' : ''}>Active</a></li>
          <li><a href='#/completed' className={(filter === 'completed') ? 'selected' : ''}>Completed</a></li>
        </ul>
        {completed > 0 ? (
          <button className='clear-completed'>Clear completed ({completed}) </button>
        ) : ''}
      </footer>
    </div>
  )
}
