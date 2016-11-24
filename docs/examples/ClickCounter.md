## Click Counter
In this example we are going to create a simple stateful component with one button 
and a message indicating how many times that button has been clicked.

### View
We can start by defining a view:

```javascript
function view (jsx, props, state) {
  return (
    <div>
      <span>Times clicked: {state.timesClicked}</span>
      <button>Click me</button>
    </div>
  )
}
```

### Actions
In Recycle all actions are defined separately, keeping the view "clean" (without `onClick`, `keyUp` and similar event handlers).

Since we need to listen for click events on a button element, we can use `sources.DOM` for selectig a DOM element and return an action `{ type: 'buttonClicked' }` every time that button is clicked:

```javascript
function actions (sources) {
  const button = sources.DOM.select('button')

  return [
    button.events('click')
      .mapTo({ type: 'buttonClicked' })
  ]
}
```

### Reducers
To update our component we need to change its state, which is done by defining a `reducer`:

```javascript
function reducers (sources) {
  return [
    sources.actions
      .filterByType('buttonClicked')
      .reducer(function (state) {
        state.timesClicked++
        return state
      })
  ]
}
```

### Defining a Recycle component
We now have all the ingredients for defining our component: 

```javascript
function ClickCounter () {
  return {
    initialState: {
      timesClicked: 0
    },
    actions,
    reducers,
    view
  }
}
```

or if you prefer writing all in a single function:

```javascript
function SingleCounter () {
  return {
    initialState: {
      timesClicked: 0
    },

    actions(sources) {
      const button = sources.DOM.select('button')

      return [
        button.events('click')
          .mapTo({ type: 'buttonClicked' })
      ]
    },

    reducers(sources) {
      return [
        sources.actions
          .filterByType('buttonClicked')
          .reducer(function (state) {
            state.timesClicked++
            return state
          })
      ]
    },

    view(jsx, props, state) {
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
