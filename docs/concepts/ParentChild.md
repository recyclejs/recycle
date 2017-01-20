## Calling Child Components
Calling a child component in Recycle is done in a similar way as with React:

```javascript
function view () {
  return (
    <div>
      <div><ClickCounter /></div>
    </div>
  )
}
```

The only difference is that for the same component which is called multiple times (even if it's not inside an array iterator), 
a unique key property must be provided:

```javascript
function view () {
  return (
    <div>
      <div><ClickCounter key='first' /></div>
      <div><ClickCounter key='second' /></div>
    </div>
  )
}
```

## Parent Child Actions
In previous example, a component is updating its state based on actions on DOM elements.
But for a larger application, listening on component nodes is not enough. 
What if we want to react on some actions from child components as well? 

In React, we would probably pass our callback function as property from parent to 
its children which would then be responsible for the execution of that callback.

But why should any component be responsible for executing someone else's methods?

Rather than being responsible for a parent's methods,
every component can describe its behavior by defining it as a stream. 

In Recycle, this stream is called `actions` and it's a form of a "*component API*".
So if a parent wants to use this stream for updating its own state, 
it can subscribe to it.

Suppose, a child component `ClickCounter` is dispatching `{type: 'buttonClicked'}` action:

```javascript
function actions (sources) {
  return [
    sources.selectTag('button')
      .on('click')
      .mapTo({ type: 'buttonClicked' })
  ]
}
```

then, this action will be avaiable in parent's `sources.childrenActions`.

We can now create a component that is tracking how many times any of its child components button was clicked:

```javascript
import React from 'react'
import ClickCounter from './ClickCounter'

function MultipleClickCounters () {
  return {
    initialState: {
      childButtonClicked: 0
    },

    reducers (sources) {
      return [
        sources.childrenActions
          .filterByType('buttonClicked')
          .reducer(function (state) {
            state.childButtonClicked++
            return state
          })
      ]
    },

    view (props, state) {
      return (
        <div>
          <div><ClickCounter key='first' /></div>
          <div><ClickCounter key='second' /></div>
          <div>Total child button clicks: {state.childButtonClicked}</div>
        </div>
      )
    }
  }
}

export default ClickCounter
```

## Indentical Child Components Actions
If, for some reason, multiple components are using the same action type, 
but for a different kind of actions and you can't differentiate them by any other property you can use `filterByConstructor` operator:

```javascript
function actions (sources) {
  return [
    sources.childrenActions
      .filterByType('buttonClicked')
      .filterByConstructor(ClickCounter)
      .mapTo({ type: 'childButtonClicked' }),
    
    sources.childrenActions
      .filterByType('buttonClicked')
      .filterByConstructor(SomeOtherComponent)
      .mapTo({ type: 'someOtherAction' })
  ]
}
```
