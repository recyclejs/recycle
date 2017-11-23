import React from 'react'
import recycle from 'recycle'
import { reducer } from 'recycle/lib/customRxOperators' // optional
import Rx from 'rxjs'

const Timer = recycle({
  initialState: {
    secondsElapsed: 0,
    counter: 0
  },

  update (sources) {
    return [
      sources.select('button')
        .addListener('onClick')
        .reducer(function (state) {
          return {
            ...state,
            counter: state.counter + 1
          }
        }),

      Rx.Observable.interval(1000)
        // if you don't want to use custom Rx operator
        // you can use "let"
        .let(reducer(function (state) {
          return {
            ...state,
            secondsElapsed: state.secondsElapsed + 1
          }
        }))
    ]
  },

  view (props, state) {
    return (
      <div>
        <div>Seconds Elapsed: {state.secondsElapsed}</div>
        <div>Times Clicked: {state.counter}</div>
        <button>Click Me</button>
      </div>
    )
  }
})

export default Timer
