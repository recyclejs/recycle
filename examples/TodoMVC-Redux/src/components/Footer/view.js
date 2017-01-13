import React from 'react'
import classnames from 'classnames'
import { TODO_FILTER, CLEAR_COMPLETED } from '../../constants/Selectors'

function view ({ activeCount, completedCount, filter }) {
  function renderFilterLink (filterKey, title) {
    return (
      <a recycle={TODO_FILTER}
        return={filterKey}
        className={classnames({ selected: filterKey === filter.selected })}
        style={{ cursor: 'pointer' }}
         >
        {title}
      </a>
    )
  }

  function clearButton () {
    if (completedCount > 0) {
      return (
        <button recycle={CLEAR_COMPLETED} className='clear-completed'>
          Clear completed
        </button>
      )
    }
  }

  const itemWord = activeCount === 1 ? 'item' : 'items'

  return (
    <footer className='footer'>
      <span className='todo-count'>
        <strong>{activeCount || 'No'}</strong> {itemWord} left
      </span>
      <ul className='filters'>
        {Object.keys(filter.titles).map(filterKey =>
          <li key={filterKey}>
            {renderFilterLink(filterKey, filter.titles[filterKey])}
          </li>
        )}
      </ul>
      {clearButton()}
    </footer>
  )
}

export default view
