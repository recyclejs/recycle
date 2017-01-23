import React from 'react'
import ClickCounter from './ClickCounter'
import { Observable } from 'rxjs/Rx'

function MultipleClickCounters () {
  return {
    initialState: {
      childButtonClicked: 0,
      seconds: 0
    },

    reducers (sources) {
      return [
        sources.select(ClickCounter)
          .on('buttonClicked')
          .reducer(function (state) {
            state.childButtonClicked++
            return state
          }),

        Observable.interval(1000)
          .reducer(function (state) {
            state.seconds++
            return state
          })
      ]
    },

    view (props, state) {
      return (
        <div>
          <div><ClickCounter key='first' /></div>
          <div><ClickCounter key='second' /></div>
          <div>Total child button clicks: {state.childButtonClicked}</div>
          <div>Seconds passed: {state.seconds}</div>
        </div>
      )
    }
  }
}

export default MultipleClickCounters
