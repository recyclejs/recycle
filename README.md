[![Join the chat at https://gitter.im/recyclejs](https://img.shields.io/gitter/room/nwjs/nw.js.svg?style=flat-square)](https://gitter.im/recyclejs?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![npm version](https://img.shields.io/npm/v/recycle.svg?style=flat-square)](https://www.npmjs.com/package/recycle)
[![npm downloads](https://img.shields.io/npm/dm/recycle.svg?style=flat-square)](https://www.npmjs.com/package/recycle)

# Recycle
Convert functional/reactive object description into React component.

You don't need another UI framework if you want to use [RxJS](https://github.com/ReactiveX/rxjs).

## Installation
```bash
npm install --save recycle
```

## Example
[**Webpackbin example**](https://www.webpackbin.com/bins/-KiHSPOMjmY9tz4qYnbv)

```javascript
import { reducer } from 'recycle'

const Timer = recycle({
  initialState: {
    secondsElapsed: 0,
    counter: 0
  },
 
  update (sources) {
    return [
      sources.select('button')
        .addListener('onClick')
        .let(reducer(function (state) {
          state.counter++
          return state
        })),
      
      Rx.Observable.interval(1000)
        .let(reducer(function (state) {
          state.secondsElapsed++
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
```

You can also listen on child component events and define custom event handlers.
Just make sure you specify what should be returned:

```javascript
import CustomButton from './CustomButton'

const Timer = recycle({
  initialState: {
    counter: 0
  },
 
  update (sources) {
    return [
      sources.select(CustomButton)
        .addListener('customOnClick')
        .let(reducer(function (state, returnedValue) {
          state.counter = state.counter + returnedValue
          return state
        }))
    ]
  },
 
  view (props, state) {
    return (
      <div>
        <div>Times Clicked: {state.counter}</div>
        <CustomButton customOnClick={e => e.something}>Click Me</CustomButton>
      </div>
    )
  }
})
```

## Replacing Redux Connect
If you are using Redux,
Recycle component can also be used as a container (an alternative to Redux `connect`).

The advantage of this approach is that you have full control over component rerendering (components will not be "forceUpdated" magically).

Also, you can listen to a specific part of the state and update your component only if that property is changed.

```javascript
export default recycle({
  dispatch (sources) {
    return [
      sources.select('div')
        .addListener('onClick')
        .mapTo({ type: 'REDUX_ACTION_TYPE', text: 'hello from recycle' })
    ]
  },

  update (sources) {
    return [
      sources.store
        .let(reducer(function (state, store) {
          return store
        }))

      /** 
      * Example of a subscription on a specific store property
      * with distinctUntilChanged() component will be updated only when that property is changed
      *
      * sources.store
      *   .map(s => s.specificProperty)
      *   .distinctUntilChanged()
      *   .let(reducer(function (state, specificProperty) {
      *     state.something = specificProperty
      *     return state
      *   }))
      */
    ]
  },

  view (props, state) {
    return <div>Number of todos: {store.todos.length}</div>
  }
})
```

## Effects
If you don't need to update a component local state or dispatch Redux action,
but you still need to react to some kind of async operation, you can use `effects`.

Recycle will subscribe to this stream but it will not use it.
It is intended for making side effects (like calling callback functions passed from a parent component)

```javascript
const Timer = recycle({
 
  effects (sources) {
    return [
      sources.select('input')
        .addListener('onKeyPress')
        .withLatestFrom(sources.props)
        .map(([e, props]) => {
          props.callParentFunction(e.target.value)
        })
    ]
  },
 
  view (props) {
    return (
      <input placeholder={props.defaultValue}></input>
    )
  }
})
```

## API
Component description object accepts following properties:

```javascript
{
  propTypes: { name: PropTypes.string },
  displayName: 'ComponentName',
  initialState: {},
  dispatch: function(sources) { return Observable },
  update: function(sources) { return Observable },
  effects: function(sources) { return Observable },
  view: function(props, state) { return JSX }
}
```

In `update`, `dispatch` and `effects` functions, you can use the following sources:

```javascript
/**
*   sources.select
*
*   select node by tag name or child component
*/
sources.select('tag')
  .addListener('event')

sources.select(ChildComponent)
  .addListener('event')

/**
*   sources.selectClass
*
*   select node by class name
*/
sources.selectClass('classname')
  .addListener('event')

/**
*   sources.selectId
*
*   select node by its id
*/
sources.selectId('node-id')
  .addListener('event')

/**
*   sources.store
*
*   If you are using redux (component is inside Provider)
*   sources.store will emit its state changes
*/
  sources.store
    .let(reducer(...))

/**
*   sources.state
*
*   Stream of current local component state
*/
  sources.select('input')
    .addListener('onKeyPress')
    .filter(e => e.key === 'Enter')
    .withLatestFrom(sources.state)
    .map(([e, state]) => state.someStateValue)
    .map(someStateValue => using(someStateValue))

/**
*   sources.props
*
*   Stream of current local component props
*/
  sources.select('input')
    .addListener('onKeyPress')
    .filter(e => e.key === 'Enter')
    .withLatestFrom(sources.props)
    .map(([e, props]) => props.somePropsValue)
    .map(somePropsValue => using(somePropsValue))

/**
*   sources.lifecycle
*
*   Stream of component lifecycle events
*/
  sources.lifecycle
    .filter(e => e === 'componentDidMount')
    .do(something)
```

## FAQ

### Why would I use it?
- Greater separation of concerns between component presentation and component logic
- You don't need classes so each part of a component can be defined and tested separately.
- Component description is more consistent.
  There is no custom `handleClick` events or `this.setState` statements that you need to worry about.
- The State is calculated the same way as for redux store: `state = reducer(state, action)`.
- Redux container looks like a normal component and it's more clear what it does.
- Easy to use in an existing React application (choose components which you wish to convert).

### Why would I NOT use it?
- Observables are not your thing.
- You need more control over component lifecycle (like `shouldComponentUpdate`)

### What is this? jQuery?
No.

Although it resembles [query selectors](https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector), Recycle uses React’s inline event handlers and doesn’t rely on the DOM. Since selection is isolated per component, no child nodes can ever be accessed.

### Can I use CSS selectors?
No.

Since Recycle doesn't query over your nodes, selectors like `div .class` will not work.

### How does it then find selected nodes?
It works by monkeypatching `React.createElement`.
Before a component is rendered, for each element,
if a select query is matched, recycle sets inline event listener.

Each time event handler dispatches an event,
it calls `selectedNode.rxSubject.next(e)`

### Can I use it with React Native?
Yes.

Recycle creates classical React component which can be safely used in React Native.
