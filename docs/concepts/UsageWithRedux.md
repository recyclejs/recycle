# Usage With Redux

As your apps are getting more complex,
it's often useful to use some kind of state management tools.
The most popular library for that purpose is - [Redux](http://redux.js.org).

This is why in Recycle, bindings for Redux are provided with the official *Redux driver*.

Also, since Recycle is using Observables for defining actions,
there is no need for Redux middlewares like 
[redux-thunk](https://github.com/gaearon/redux-thunk), 
[redux-saga](https://github.com/redux-saga/redux-saga) or 
[redux-observables](https://redux-observable.js.org/).
All async operations are already handled in container components.

## Driver Initialization
In addition to `Recycle`, `React` and `createStore`, 
first make sure to import *Redux Driver* located in `recyclejs/drivers/redux`.

After creating Redux store, 
pass it in `reduxDriver` function and add it as Recycle driver:

```javascript
import React from 'react'
import ReactDOM from 'react-dom'
import { createStore } from 'redux'
import Recycle from 'recyclejs'
import reduxDriver from 'recyclejs/drivers/redux'

function rootReducer (state, action) {
  switch (action.type) {
    case 'ADD_TODO':
      return [ 
        { text: action.payload },
        ...state
      ]
    default:
      return state
  }
}

const store = createStore(rootReducer)

ReactDOM.render(
  <Recycle root={App} drivers={[reduxDriver(store)]} />, 
  document.getElementById('root')
)
```

## Recycle Container
If you are familiar with Redux, you'll probably be aware of the idea of separating presentational and container components. If not, you can learn about it [here](http://redux.js.org/docs/basics/UsageWithReact.html#presentational-and-container-components).

Unlike React, Recycle container component is very similar to a presentational component. The only difference is a `container` property which must be set to `true`:

```javascript
import { ADD_TODO } from '../../constants/ActionTypes'

function ContainerComponent () {
  return {
    container: true,

    actions (sources) {
      return [
        sources.select(Header)
          .on(ADD_TODO)
          .map(val => ({ type: ADD_TODO, payload: val }))
      ]
    },

    view (props, state) {
      return (
        <div>
          <Header />
          <MainSection todos={state.todos} />
        </div>
      )
    }
  }
}
```

If an action occurs in the container component,
it will be dispatched in the Redux store.

## Reducers in Containers
If you prefer defining Redux reducers inside container components, 
you also have the option of using `reducer` operator inside `actions` stream:

```javascript
actions (sources) {
  return [
    sources.select(Header)
      .on(ADD_TODO)
      .reducer(function (state, action) {
        return [ 
          { text: action.payload },
          ...state
        ]
      })
  ]
}
```

This way, a container will always dispatch already calculated state in the form: 
`{type: 'RECYCLE_REDUCER', payload: newState}`.
So rather than using switch/case for every action,
your root reducer passed in Redux store can look something like this:

```javascript
function rootReducer (state, action) {
  switch (action.type) {
    case 'RECYCLE_REDUCER':
      return action.payload
    default:
      return state
  }
}
```

### Isolating State
If you decide to use `RECYCLE_REDUCER` action type,
you can also manage only independent parts of the state.

So if your application state is getting more complex:

```javascript
todos: {
  list: [
    {id: 0, title: 'first todo', completed: false},
    {id: 1, title: 'second todo', completed: true}
  ]
},
somethingElse: {
  property: true
},
```

But you only wish to modify `todos.list` part of it,
you can use `storePath` property:

```javascript
import { ADD_TODO } from '../../constants/ActionTypes'
import { addTodo } from './reducers'

function ContainerComponent () {
  return {
    container: true,

    storePath: 'todos.list',

    actions (sources) {
      return [
        sources.select(Header)
          .on(ADD_TODO)
          .reducer(addTodo)
      ]
    },

    view (props, state) {
      return (
        <div>
          <Header />
          <MainSection todos={state.todos} />
        </div>
      )
    }
  }
}
```
So, even though application state is a complex object,
`addTodo` reducer will receive just an array of todo items.
When calculated, dispatched action `RECYCLE_REDUCER` will merge this array in the complete state.

## TodoMVC Redux Example
Example of using Redux with Recycle: [TodoMVC Redux](https://github.com/recyclejs/recycle/tree/master/examples/TodoMVC-Redux)