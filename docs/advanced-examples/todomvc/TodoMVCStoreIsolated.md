## Modifying Parts of the State
In the previous example of a [TodoMVC implementation with store](TodoMVCStore.md),
*TodoList* and *Todo* containers both had access to the store, more specifically to a list of todo items.

This was good enough for a TodoMVC, but as your app grows more complex, 
you'll probably want to manage parts of the state independently.

For this example, it would be better if every *Todo* container can access only a specific item in a todo list.

For example, if this is our current state:

```JSON
todos: {
  list: [
    {id: 0, title: 'first todo', completed: false},
    {id: 1, title: 'second todo', completed: true}
  ] 
}
```

for a todo with the `id:1`, it would be best if the state that container is modifying is just an object:

```JSON
{id: 1, title: 'first todo', completed: false}
```  

and not the whole list array.

## Todo Container storePath
So, rather than defining a *Todo* container's `storePath` property as `'todos'`,
for the item with the `id:1` its path should point at `'todos.list[1]'`.

But, what if a todo item with the `id:0` is deleted and thereby removed from an array? 
In that case, store path `'todos.list[1]'` would now point to an `undefined` property.

So, to isolate a part of a state, we must first ensure that container's `storePath` points to an object which is uniquely defined. 

To meet this requirement, we can define our state in the following way:

```JSON
todos: {
  list: {
    '0': {id: 0, title: 'first todo', completed: false},
    '1': {id: 1, title: 'second todo', completed: true}
  }
}
```

and now our *Todo* container component can be defined as follows:

```javascript
function TodoContainer (props) {
  return {
    storePath: `todos.list.${props.id}`,

    reducers (sources) {
      return [
        sources.childrenActions
          .filterByType('destroy')
          .reducer(deleteTodo),

        sources.childrenActions
          .filterByType('titleChanged')
          .reducer(editTodo),

        sources.childrenActions
          .filterByType('toggle')
          .reducer(toggleTodo)
      ]
    },

    view (props, state) {
      return <Todo title={state.title} completed={state.completed} />
    }
  }
}
```

## Todo Container Reducers
Let's now update reducers of the *Todo* container.

* `editTodo` reducer:

  Previous version:

  ```javascript
  function editTodo (state, action) {
    let todo = state.list.find(todo => todo.id === action.id)
    todo.title = action.title

    return state
  }
  ```

  New version:

  ```javascript
  function editTodo (state, action) {
    state.title = action.payload
    return state
  }
  ```
* `toggleTodo` reducer:

  Previous version:

  ```javascript
  function toggleTodo (state, action) {
    let todo = state.list.find(todo => todo.id === action.id)
    todo.completed = !todo.completed

    return state
  }
  ```

  New version:

  ```javascript
  function toggleTodo (state) {
    state.completed = !state.completed
    return state
  }
  ```
* `deleteTodo` reducer:

  Previous version:

  ```javascript
  function deleteTodo (state, action) {
    state.list = state.list
      .filter(todo => !(todo.id === action.id))

    return state
  }
  ```

  New version:

  ```javascript
  function deleteTodo (state) {
    return false
  }
  ```

As you can see, container component can't actually delete an object which it is modifying,
but if returned `false` it will be removed by the store plugin. 

## Complete Example
For a complete example with routing and localstorage support check [here](https://github.com/recyclejs/recycle/tree/master/examples/TodoMVC-Store-2).