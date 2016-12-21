import React from 'react'
import ReactDOM from 'react-dom'
import Rx from 'rxjs/Rx'
import createRecycle from '../../src/index'
import WebSocketPlugin from './websocket-plugin'

function WebSocketEcho () {
  return {
    initialState: {
      inputVal: '',
      response: '',
      status: ''
    },

    actions (sources) {
      const input = sources.DOM.select('input')

      return [
        input
          .events('input')
          .map(e => ({ type: 'inputVal', payload: e.target.value })),

        input
          .events('keydown')
          .filter(e => e.keyCode === 13)
          .mapToLatest(sources.state)
          .map(state => ({ type: 'send', payload: state.inputVal }))
      ]
    },

    reducers (sources) {
      return [
        sources.actions
          .filterByType('inputVal')
          .reducer((state, action) => {
            state.inputVal = action.payload
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

const recycle = createRecycle({
  adapter: [React, ReactDOM, Rx],
  plugins: [
    WebSocketPlugin
  ]
})

recycle.render(WebSocketEcho, document.getElementById('app'))
