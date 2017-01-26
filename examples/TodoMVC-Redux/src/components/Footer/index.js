import { PropTypes } from 'react'
import view from './view'
import { SHOW_ALL, SHOW_COMPLETED, SHOW_ACTIVE } from '../../constants/TodoFilters'

const Footer = (props) => ({
  propTypes: {
    completedCount: PropTypes.number.isRequired,
    activeCount: PropTypes.number.isRequired,
    filter: PropTypes.string.isRequired,
    onClearCompleted: PropTypes.func.isRequired,
    onShow: PropTypes.func.isRequired
  },

  actions (sources) {
    return [
      sources.selectClass('clear-completed')
        .on('click')
        .map(props.onClearCompleted),

      sources.selectClass('filter-link')
        .on('click')
        .map(props.onShow)
    ]
  },

  view (props) {
    const FILTER_TITLES = {
      [SHOW_ALL]: 'All',
      [SHOW_ACTIVE]: 'Active',
      [SHOW_COMPLETED]: 'Completed'
    }

    return view({
      activeCount: props.activeCount,
      completedCount: props.completedCount,
      filter: {
        selected: props.filter,
        titles: FILTER_TITLES
      }
    })
  }
})

export default Footer
