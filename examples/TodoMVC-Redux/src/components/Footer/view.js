import React from 'react'
import classnames from 'classnames'

function view ({ activeCount, completedCount, filter }) {
  function renderFilterLink (filterKey, title) {
    let selected = filterKey === filter.selected
    return (
      <a return={filterKey}
        className={classnames({ 'filter-link': true, selected })}
        style={{ cursor: 'pointer' }}
         >
        {title}
      </a>
    )
  }

  function clearButton () {
    if (completedCount > 0) {
      return (
        <button className='clear-completed'>
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
