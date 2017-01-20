# Stateful Component
In this example, we are going to create a simple stateful component with a button 
and a message indicating how many times that button has been clicked.

Since this is a component which state is going to change,
we will define it as a stream.

In Recycle, this is done in a `reducers` function.

## Node Selection
All streams are defined by first specifying its source.

So, for selecting a component node, we can use one of the following:
- `sources.select` - selecting node(s) by its `recycle` attribute
- `sources.selectClass` - selecting node(s) by its class name 
- `sources.selectId` - selecting node(s) by its id
- `sources.selectTag` - selecting node(s) by its tag name

Although this may resemble [query selectors](https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector), 
Recycle uses React's inline event handlers and doesn't rely on the DOM. 
Selection is isolated per component and no child nodes can ever be accessed.

For this example, our source is a `click` event on a `button` node.

We can then use `selectTag` and specify its event using `on` method:

```javascript
sources.selectTag('button')
  .on('click')
```

All event names are the same as [in React](https://facebook.github.io/react/docs/events.html) but specified as string:
- `onClick` -> `on('click')`
- `onChange` -> `on('change')`
- `onDoubleClick` -> `on('doubleClick')`
- etc.

## Defining State Stream
For actually changing a component state, we can use `reducer` operator:

```javascript
sources.selectTag('button')
  .on('click')
  .reducer(function (state) {
    state.timesClicked++
    return state
  })
```

## Complete Component
We can now define our component as a function with `reducers`, `initialState` and `view` properties:

```javascript
import React from 'react'

function ClickCounter () {
  return {
    initialState: {
      timesClicked: 0
    },

    reducers (sources) {
      return [
        sources.selectTag('button')
          .on('click')
          .reducer(function (state) {
            state.timesClicked++
            return state
          })
      ]
    },

    view (props, state) {
      return (
        <div>
          <span>Times clicked: {state.timesClicked}</span>
          <button>Click me</button>
        </div>
      )
    }
  }
}

export default ClickCounter
```
