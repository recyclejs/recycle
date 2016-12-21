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
In ClickCounter example, a component is updating its state based on actions on DOM elements.
But for a larger application, listening on component DOM elements is not enough. 
What if we want to react on some actions from child components as well? 

In React, we would probably pass our callback functions as props from parent to its children which would then be responsible for the execution of that callback.

In Recycle, we have another option. 
Instead of passing functions as params, 
parent component can use `sources.childrenActions` for creating an action that uses children actions as its source:

```javascript
function actions (sources) {
  return [
    sources.childrenActions
      .filterByType('buttonClicked')
      .mapTo({ type: 'childButtonClicked' })
  ]
}
```

## Multiple Counters Example
We can now create a component that is tracking how many times any of its child components button was clicked.

To accomplish this, we need to define a reducer which will update a component state every time `childButtonClicked` action is dispatched:

```javascript
reducers (sources) {
  return [
    sources.actions
      .filterByType('childButtonClicked')
      .reducer(function increment (state) {
        state.childButtonClicked++
        return state
      })
  ]
}
```

Lastly, we need to display our counter inside a view:

```javascript
function view (props, state) {
  return (
    <div>
      <div><ClickCounter key='first' /></div>
      <div><ClickCounter key='second' /></div>
      <div>Total child button clicks: {state.childButtonClicked}</div>
    </div>
  )
}
```

## Complete Example
For a complete example check [here](https://github.com/recyclejs/recycle/tree/master/examples/ClickCounter).

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
