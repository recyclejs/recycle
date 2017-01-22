# Drivers

Recycle *Driver* is a module which interacts with all components in the Recycle tree.

It has the ability to: 
 - read component definition property (`initialState`, `actions`, `view`...)
 - change or add a component definition property
 - subscribe to or provide additional streams sources

So basically, it has full control over all components.

But, most often, a driver is used for managing side effects.

## Managing Side Effects
Suppose we need to write a Chat application. 
We would probably start by defining a component structure and its actions.
It would be a simple component with some kind of input field and an area for displaying messages.

The component itself should not be too complicated, 
but where should we write our logic for communicating with the network?

A component should not care about the way messages are delivered to the server or whether it uses WebSockets, Ajax or something else. 
Its implementation should be straightforward - describing conditions when a component should send an action (sending a message) and how should the component state be changed when a message is received.

Recieving a message is a component **input** operation, so it should be a part of `sources` object (available in component actions and reducers). 

Sending a message is a component **output** operation, so it should be described in `actions`.

Providing component input and listening for its output can be easily accomplished with the use of drivers.

## Simple WebSocket Driver
To demonstrate how drivers are created, we can start by creating a simple WebSocket example - a component which sends a message and displays responses from the server. This component should also notify its connection status to the user. For our server, we can use [WebSocket Echo](http://www.websocket.org/echo.html).

### Sending messages
A component **actions** serves a role of the "component API" which driver will use as an input for sending messages.
This component will dispatch a single action in a form of: `{type:'send', payload: text}`
when *Enter* key is triggered:

```javascript
actions (sources) {
  return sources.select('input')
    .on('keyDown')
    .filter(e => e.keyCode === 13)
    .mapToLatest(sources.state)
    .map(state => ({ type: 'send', payload: state.inputVal }))
}
```

Recycle Driver is implemented as a function which recieves `recycle` object.

We can then use `recycle.on('action')` event,
check its type and send it to the network.

```javascript
function WebSocketDriver (recycle) {
  recycle.on('action', (action, component) => {
    if (action.type === 'send') {
      websocket.send(action.payload)
    }
  })
}
```

### Recieving message
To change a component state, driver must provide a source.
Our first source will be a stream which will provide messages recieved from a WebSocket.

In [RxJS](https://github.com/ReactiveX/rxjs), a stream is created using `Subject()`,
and for every message we will add it in a stream using `stream.next(message)`:

```javascript
function WebSocketDriver (recycle, { Subject }) {
  const response$ = new Subject()
  const websocket = new WebSocket('ws://echo.websocket.org/')
  
  websocket.onmessage = function (evt) {
    response$.next(evt.data)
  }

  recycle.on('componentInit', (component) => {
    component.setSource('websocketResponse', response$)
  })
}
```

Since we injected `websocketResponse` stream on the `componentInit` event, 
our source will be available before a component is rendered.

This source is added in `sources` object which is passed in `actions` and `reducers` functions:

```javascript
reducers (sources) {
  return [
    sources.websocketResponse
      .reducer((state, data) => {
        state.response = data
        return state
      })
  ]
}
```

### Complete Example

For a complete example check [here](https://github.com/recyclejs/recycle/tree/master/examples/Websocket).