/* global WebSocket */

export default function (recycle, { Subject }) {
  const response$ = new Subject()
  const status$ = new Subject()

  const websocket = new WebSocket('wss://echo.websocket.org/')
  websocket.onclose = function (evt) {
    status$.next('Connection closed.')
  }
  websocket.onopen = function (evt) {
    status$.next('Connected to wss://echo.websocket.org')
  }
  websocket.onmessage = function (evt) {
    response$.next(evt.data)
  }
  websocket.onerror = function (evt) {
    response$.next('Error: ' + evt.data)
  }

  recycle.on('componentInit', (component) => {
    component.setSource('websocketResponse', response$)
    component.setSource('websocketStatus', status$)
  })

  recycle.on('action', (action, component) => {
    if (action.type === 'send') {
      websocket.send(action.payload)
    }
  })
}
