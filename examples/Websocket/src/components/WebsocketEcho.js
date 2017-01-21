import React from 'react'

export default function WebSocketEcho () {
  return {
    initialState: {
      inputVal: '',
      response: '',
      status: ''
    },

    actions (sources) {
      return sources.select('input')
        .on('keyDown')
        .filter(e => e.keyCode === 13)
        .mapToLatest(sources.state)
        .map(state => ({ type: 'send', payload: state.inputVal }))
    },

    reducers (sources) {
      return [
        sources.select('input')
          .on('change')
          .reducer((state, e) => {
            state.inputVal = e.target.value
            return state
          }),

        sources.websocketResponse
          .reducer((state, data) => {
            state.response = data
            return state
          }),

        sources.websocketStatus
          .reducer((state, data) => {
            state.status = data
            return state
          })
      ]
    },

    view (props, state) {
      return (
        <div>
          <h2>Websocket Echo Test</h2>
          <div>Send: <input value={state.inputVal} type='text' /></div>
          <br />
          <div>Status: {state.status}</div>
          <div>Response: {state.response}</div>
        </div>
      )
    }
  }
}


