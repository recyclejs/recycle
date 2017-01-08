import { PropTypes } from 'react'
import view from './view'
import { SHOW_ALL, SHOW_COMPLETED, SHOW_ACTIVE } from '../../constants/TodoFilters'
import { TODO_FILTER, CLEAR_COMPLETED } from '../../constants/Selectors'

export default function Footer (props) {
  return {
    propTypes: {
      completedCount: PropTypes.number.isRequired,
      activeCount: PropTypes.number.isRequired,
      filter: PropTypes.string.isRequired
    },

    actions (sources) {
      return [
        sources.select(CLEAR_COMPLETED)
          .on('click'),

        sources.select(TODO_FILTER)
          .on('click')
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
  }
}
