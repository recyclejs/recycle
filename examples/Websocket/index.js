import createRecycle from '../../src/index'
import adapter from '../../src/adapter/react-rxjs'
import WebSocketPlugin from './websocket-plugin'

function WebSocketEcho () {
  return {
    initialState: {
      inputVal: '',
      response: '',
      status: ''
    },

    actions (sources, getProp, getState) {
      const input = sources.DOM.select('input')

      return [
        input
          .events('input')
          .map(e => ({ type: 'inputVal', payload: e.target.value })),

        input
          .events('keydown')
          .filter(e => e.keyCode === 13)
          .map(e => ({ type: 'send', payload: getState('inputVal') }))
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

    view (jsx, props, state) {
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
  adapter: adapter,
  plugins: [
    WebSocketPlugin
  ]
})

recycle.render(WebSocketEcho, document.getElementById('app'))
