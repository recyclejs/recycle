import React from 'react'
import recycle, { registerReducer } from 'recycle'
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
        .let(registerReducer((state) => {
          state.counter += 1
          return state
        })),

      Rx.Observable.interval(1000)
        .let(registerReducer((state) => {
          state.secondsElapsed += 1
          return state
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
