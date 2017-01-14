## Changing State
In this example, we are going to create a simple stateful component with a button 
and a message indicating how many times that button has been clicked.

### View
We can start by defining a view:

```javascript
import React from 'react'

function view (props, state) {
  return (
    <div>
      <span>Times clicked: {state.timesClicked}</span>
      <button>Click me</button>
    </div>
  )
}

export default view
```

### Reducers
To update our component we need to change its state, which is done by defining a `reducer`:

```javascript
function reducers (sources) {
  return [
    sources.DOM.select('button')
      .events('click')
      .reducer(function (state) {
        state.timesClicked++
        return state
      })
  ]
}

export default reducers
```

### Defining a Recycle component
We now have all the ingredients for defining our component: 

```javascript
import view from './view'
import reducers from './reducers'

function ClickCounter () {
  return {
    initialState: {
      timesClicked: 0
    },
    reducers,
    view
  }
}

export default ClickCounter
```

or if you prefer writing it all in a single function:

```javascript
import React from 'react'

function SingleCounter () {
  return {
    initialState: {
      timesClicked: 0
    },

    reducers (sources) {
      return [
        sources.DOM.select('button')
          .events('click')
          .reducer(function (state) {
            state.timesClicked++
            return state
          })
      ]
    },

    view(props, state) {
      return (
        <div>
          <span>Times clicked: {state.timesClicked}</span>
          <button>Click me</button>
        </div>
      )
    }
  }
}
```
