import React from 'react'
import TodoItem from '../TodoItem'
import Footer from '../Footer'
import { TOGGLE_ALL } from '../../constants/Selectors'

function view ({children, todos, actions, filter}) {
  const renderToggleAll = () => {
    if (todos.length > 0) {
      return <input
        recycle={TOGGLE_ALL}
        className='toggle-all'
        type='checkbox'
        checked={todos.completed === todos.length} />
    }
  }

  const renderFooter = () => {
    if (todos.length) {
      return <Footer
        completedCount={todos.completed}
        activeCount={todos.length - todos.completed}
        filter={filter}
              />
    }
  }

  return (
    <section className='main'>
      {renderToggleAll()}
      <ul className='todo-list'>
        {todos.filtered.map(todo =>
          <TodoItem key={todo.id} todo={todo} {...actions} />
        )}
      </ul>
      {renderFooter()}
    </section>
  )
}

export default view
