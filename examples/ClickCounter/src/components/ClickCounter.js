import React from 'react'

function ClickCounter () {
  return {
    initialState: {
      timesClicked: 0
    },

    actions (sources) {
      return [
        sources.select('button')
          .on('click')
          .mapTo({ type: 'buttonClicked' })
      ]
    },

    reducers (sources) {
      return [
        sources.actions
          .filterByType('buttonClicked')
          .reducer(function (state) {
            state.timesClicked++
            return state
          })
      ]
    },

    view (props, state) {
      return (
        <div>
          <span>Times clicked: {state.timesClicked}</span>
          <button>Click me</button>
        </div>
      )
    }
  }
}

export default ClickCounter
