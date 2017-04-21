# Recycle
Create React component using [RxJS](https://github.com/ReactiveX/rxjs).

## Installation
```bash
npm install --save recycle
```

## Example
Rather than defining state as an object which will later be overwritten (using `this.setState()`),
you can define it more declaratively:

```javascript
const Timer = recycle({
  initialState: {
    secondsElapsed: 0,
    counter: 0
  },
 
  update(sources) {
    return [
      sources.select('button')
        .addListener('onClick')
        .reducer(state => ({
          counter: state.counter + 1
        })),
      
      Rx.Observable.interval(1000)
        .reducer(state => ({
          secondsElapsed: state.secondsElapsed + 1
        }))
    ]
  },
 
  view(props, state) {
    return (
      <div>
        <div>Seconds Elapsed: {state.secondsElapsed}</div>
        <div>Times Clicked: {state.counter}</div>
        <button>Click Me</button>
      </div>
    )
  }
})
```

[Webpackbin example](https://www.webpackbin.com/bins/-KiHSPOMjmY9tz4qYnbv)

You can also use custom event handlers.
Just make sure you specify what should be returned:

```javascript
const Timer = recycle({
  initialState: {
    secondsElapsed: 0,
    counter: 0
  },
 
  update(sources) {
    return [
      sources.select('button')
        .addListener('onClick')
        .reducer((state, returnedValue) => ({
          counter: state.counter + returnedValue // returnedValue = 5
        })),
      
      Rx.Observable.interval(1000)
        .reducer(state => ({
          secondsElapsed: state.secondsElapsed + 1
        }))
    ]
  },
 
  view(props, state) {
    return (
      <div>
        <div>Seconds Elapsed: {state.secondsElapsed}</div>
        <div>Times Clicked: {state.counter}</div>
        <button onClick={e => 5}>Click Me</button>
      </div>
    )
  }
})
```

## Replacing Redux Connect
If you are using Redux (and store object is defined in context),
Recycle component can also be used as a container (an alternative to Redux `connect`).

```javascript
export default recycle({
  dispatch (sources) {
    return [
      sources.select('div')
        .addListener('onClick')
        .mapTo({ type: 'ADD_TODO', text: 'hello from recycle' })
    ]
  },

  update (sources) {
    return [
      sources.store
        .reducer(function (state, store) {
          return {
            counter: store.todos.length
          }
        })
    ]
  },

  view (props, state) {
    return <div><br />Hello{state.counter}</div>
  }
})
```

## What is this? jQuery?
No.

Although it resembles [query selectors](https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector), Recycle uses React’s inline event handlers and doesn’t rely on the DOM. Since selection is isolated per component, no child nodes can ever be accessed.

## How does it then find selected nodes?
It works by monkeypatching `React.createElement`.
Before component is rendered, for each element,
if a select query is matched, recycle sets inline event listener.

Each time event handler dispatches an event,
it calls `selectedNode.rxSubject.next(e)`

## Can I use it with React Native?
Yes.

Recycle creates classical React component which can be safely used in React Native.

## Previous Version
Recycle v2.0 is much smaller library from its predecessor.
It is focussed only on making React components use RxJS for defining component state and handling events.

If you are interested in previous version, check [here](https://github.com/recyclejs/recycle/tree/v1.0)