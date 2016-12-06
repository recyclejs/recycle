## Recycle Plugins
Suppose we need to write a Chat application. 
This time a "request-response" type of communication like an ajax request from a previous example would not suffice. 
Even if we write our WebSocket logic in actions of our component, 
we will end up with a much more complex component than it should be.

A chat component should not care about the way messages are delivered to the server 
or whether it uses WebSockets or not. 
Its implementation should be straightforward - describing conditions when a component should send an action 
(sending a message) and how should the component state be changed when a message is received.

Component connection to the "outside world" is in `sources` (available in component `actions` and `reducers`). 
So if we choose not to write any communication logic in the component itself, 
it is evident that we need to create a source. 

A source is representing a "read" operation of a component, 
but our component also has a "write" operation: sending messages in a form of dispatching actions.

For writing our communication logic we need both "read" (providing sources) 
and "write" (listening to component actions) operations of a component. 
In Recycle, this can be done - with plugins.

## Simple WebSocket Plugin
To demonstrate how plugins are created, 
we can start by creating a simple WebSocket example - a component which sends a message 
and displays responses from the server. 
This component should also notify its connection status to the user. 
For our server, we can use [WebSocket Echo](http://www.websocket.org/echo.html).

Our component is again just a combination of actions, reducers and view. 

### View
```javascript
function view (jsx, props, state) {
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
```

### Actions
```javascript
function actions (sources) {
  const input = sources.DOM.select('input')

  return [
    input
      .events('input')
      .map(e => ({ type: 'inputVal', payload: e.target.value })),

    input
      .events('keydown')
      .filter(e => e.keyCode === 13)
      .latestFrom(sources.state)
      .map(state => ({ type: 'send', payload: state.inputVal }))
  ]
}
```

### Reducers
Besides using `sources.actions` as a source for our reducers, 
we are also using two sources created with a plugin: `sources.websocketResponse` and `sources.websocketStatus`:

```javascript
function reducers (sources) {
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
}
```
## Plugin Implementation

Plugins are applied in `createRecycle` function:

```javascript
const recycle = createRecycle({
  adapter: adapter,
  plugins: [
    WebSocketPlugin
  ]
})
``` 

 and its core implementation is as follows:

```javascript
function WebSocketPlugin (recycle, adapter) {

  ...

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
``` 

That is all of the Recycle API you need for creating a plugin which provides additional sources to a component. 
As you can see, we are listening to all components created in recycle instance (in this example only one component) and adding sources as observables - one for receiving WebSocket responses, 
the other for displaying connection status if a connection is lost. 

The rest of the implementation logic has to do with RxJS for creating Observables and WebSocket API:

```javascript
function WebSocketPlugin (recycle, adapter) {

  const response$ = new adapter.Subject()
  const status$ = new adapter.Subject()

  const websocket = new WebSocket('ws://echo.websocket.org/')
  websocket.onclose = function (evt) {
    status$.next('Connection closed.')
  }
  websocket.onopen = function (evt) {
    status$.next('Connected to ws://echo.websocket.org')
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
``` 

### Complete Example
For a complete example check [here](https://github.com/recyclejs/recycle/tree/master/examples/Websocket).
