import React from 'react'
import recycle from 'recycle/component'
import Rx from 'rxjs'
import { setVisibilityFilter } from '../actions'

const FilterLink = recycle(React, Rx)({
  dispatch (sources) {
    return [
      sources.select('a')
        .addListener('onClick')
        .map(e => e.preventDefault())
        .withLatestFrom(sources.props)
        .map(([e, props]) => setVisibilityFilter(props.filter))
    ]
  },

  update (sources) {
    return [
      sources.store
        .reducer((state, store) => store)
    ]
  },

  view (props, state) {
    if (props.filter === state.visibilityFilter) {
      return <span>{props.children}</span>
    }

    return <a href="#">{props.children}</a>
  }
})

export default FilterLink
