# Testing

```javascript
import { inspectObservable, applyReducer } from 'recyclejs/testutils'
```

`inspectObservable` and `applyReducer` are helper functions that makes it easy to test Recycle components.

For demonstration purposes, we will use `ClickCounter` component:

```javascript
import React from 'react'

function ClickCounter () {
  return {
    initialState: {
      timesClicked: 0
    },

    actions (sources) {
      return [
        sources.select('button')
          .on('click')
          .mapTo({ type: 'butonClicked'})
      ]
    },

    reducers (sources) {
      return [
        sources.actions
          .filterByType('butonClicked')
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
```
## Testing Observables
The following unit tests are made using [Jest](https://facebook.github.io/jest/), 
but since helper functions for testing Observables are returning promises, 
it will work with any framework that supports it.

```javascript
import ClickCounter from './ClickCounter'
import { inspectObservable, applyReducer } from 'recyclejs/testutils'

describe('ClickCounter Actions', function () {
  const on = inspectObservable(ClickCounter().actions)

  it('should dispatch butonClicked', function () {
    return on.select('button', 'click')
      .then(res => expect(res).toEqual({ type: 'butonClicked' }))
  })
})

describe('ClickCounter Reducers', function () {
  const on = inspectObservable(ClickCounter().reducers)

  it('should increment counter', function () {
    const initialState = {
      timesClicked: 0
    }

    const nextState = {
      timesClicked: 1
    }

    return on.actions({ type: 'butonClicked'})
      .then(res => applyReducer(res, initialState))
      .then(state => expect(state).toEqual(nextState))
  })
})
```

## Testing Views
Testing views in Recycle is no different from testing classic React component.
In this example, we are using [react-test-renderer](https://www.npmjs.com/package/react-test-renderer):

```javascript
import ClickCounter from './ClickCounter'
import React from 'react'
import renderer from 'react-test-renderer'

describe('TodoList View', function () {
  it('should have correct structure', function () {
    const props = { }
    const state = { timesClicked: 5 }
    const component = renderer.create(ClickCounter().view(props, state))

    const expected = renderer.create(
      <div>
        <span>Times clicked: 5</span>
        <button>Click me</button>
      </div>
    )

    expect(component.toJSON()).toEqual(expected.toJSON())
  })
})
```

## TodoMVC Example
For more complicated components, check how tests are defined for [TodoList](https://github.com/recyclejs/recycle/tree/master/examples/TodoMVC/components/TodoList)
and [Todo](https://github.com/recyclejs/recycle/tree/master/examples/TodoMVC/components/Todo) components of a [TodoMVC application](https://github.com/recyclejs/recycle/tree/master/examples/TodoMVC).