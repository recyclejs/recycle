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
In the previous example, a component is updating its state based on actions on DOM elements.
But for a larger application, listening on component nodes is not enough. 
What if we want to react on some actions from child components as well? 

In React, we would probably pass our callback function as property from parent to 
its children which would then be responsible for the execution of that callback.

But why should any component be responsible for executing someone else's methods?

Rather than being responsible for a parent's methods,
every component can describe its behavior by defining it as a stream. 

In Recycle, this stream is called `actions` and it's a form of a "*component API*".
So if a parent wants to make use of children actions for updating its own state, 
it can bind listeners to it, the same way as for any other node.

Suppose, a child component `ClickCounter` is dispatching `{type: 'buttonClicked'}` action:

```javascript
function actions (sources) {
  return [
    sources.select('button')
      .on('click')
      .mapTo({ type: 'buttonClicked' })
  ]
}
```

The same way a `div` element can be listened to by using: `select('div').on('click')`,
a parent component can do the same for `ClickCounter`:

```javascript
select(ClickCounter)
  .on('buttonClicked')
```

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
        sources.select(ClickCounter)
          .on('buttonClicked')
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

## TodoMVC
For a more complex example of parent-child relationship, check out [TodoMVC](https://github.com/recyclejs/recycle/tree/master/examples/TodoMVC)
implementation in Recycle. 
Application is composed of *TodoList* (parent) and *Todo* (child) components.