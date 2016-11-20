import Todo from '../../containers/Todo/index'

export default function view (jsx, props, state) {
  let completed = props.todos.filter(todo => todo.completed).length
  let active = props.todos.length - completed

  return (
    <div className='todoapp'>
      <header className='header'>
        <h1>todos</h1>
        <input
          className='new-todo'
          type='text'
          value={state.inputVal}
          placeholder='What needs to be done?'
          name='newTodo' />
      </header>

      <section className='main' style={{ 'display': props.todos.length ? '' : 'none' }}>
        <input className='toggle-all' type='checkbox' defaultChecked={active === 0} />
        <ul className='todo-list'>
          {
            props.todos
              .filter(todoProps => !(props.filter === 'active' && todoProps.completed))
              .filter(todoProps => !(props.filter === 'completed' && !todoProps.completed))
              .map(props => (
                <Todo
                  id={props.id}
                  title={props.title}
                  completed={props.completed}
                  key={props.id}
                />
              ))
          }
        </ul>
      </section>

      <footer className='footer' style={{ 'display': props.todos.length ? '' : 'none' }}>
        <span className='todo-count'>
          <strong>{active}</strong>
          <span>{' item' + (active !== 1 ? 's' : '') + ' left'}</span>
        </span>
        <ul className='filters'>
          <li><a href='#/' className={(props.filter === '') ? 'selected' : ''}>All</a></li>
          <li><a href='#/active' className={(props.filter === 'active') ? 'selected' : ''}>Active</a></li>
          <li><a href='#/completed' className={(props.filter === 'completed') ? 'selected' : ''}>Completed</a></li>
        </ul>
        {completed > 0 ? (
          <button className='clear-completed'>Clear completed ({completed}) </button>
        ) : ''}
      </footer>
    </div>
  )
}
