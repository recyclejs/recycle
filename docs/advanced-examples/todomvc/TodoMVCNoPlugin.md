## TodoMVC

It's time to test Recycle with a bit more complex app - Implementation of a [TodoMVC](http://todomvc.com/). 

Like most of the TodoMVC implementations, this one will consist of two main components: *Todo* and *TodoList*.

## Todo

Let's start by defining what should our Todo look like in JSON format:

```JSON
{id: 2, title: 'first todo', completed: false}
```

It is obvious now that `ìd`, `title` and `completed` should be our component props. 

But, because this component is not static, we also need to use an internal state as well. 
Its dynamic operations are: changing into editing mode and reacting on the input field in that mode. 
From this information we can define our `initialState`:

```javascript
initialState: {
  editing: false,
  inputVal: ''
}
```

### View
Props and state are all the data we need for defining a Todo component view:

```javascript
function view (jsx, props, state) {
  return (
    <li className={'todoRoot ' + classNames({ completed: props.completed, editing: state.editing })}>
      <div className='view'>
        <input className='toggle' type='checkbox' checked={props.completed} />
        <label>{props.title}</label>
        <button className='destroy' />
      </div>
      <input className='edit' type='text' value={state.inputVal} />
    </li>
  )
}
```

One additional operation that can't be accomplished by rerendering our view (on props or state change) is -
focusing and selecting Todo's input field when switching to editing mode. 
For this, we can use `componentDidUpdate` hook:

```javascript
function componentDidUpdate ({select, state, prevState}) {
  if (!prevState.editing && state.editing) {
    const node = select('input.edit')
    node.focus()
    node.select()
  }
}
```

### Actions

We can start our actions part of a component by selecting DOM elements which we need to observe for changes: 

```javascript
function actions (sources) {
  const toggleCheckbox = sources.DOM.select('.toggle')
  const destroyIcon = sources.DOM.select('.destroy')
  const editInput = sources.DOM.select('.edit')
  const todoLabel = sources.DOM.select('label')
}
```

Defining component actions:
* `type: 'destroy'` with todo id when user clicks on `destroyIcon`

  ```javascript
  destroyIcon
    .events('click')
    .mapToLatest(sources.props)
    .map(props => ({ type: 'destroy', id: props.id }))
  ```
* `type: 'toggle'` with todo id when user changes checkbox input on `toggleCheckbox`

  ```javascript
  toggleCheckbox
    .events('change')
    .mapToLatest(sources.props)
    .map(props => ({ type: 'toggle', id: props.id }))
  ```
* `type: 'startEdit'` when user double clicks on `todoLabel`

  ```javascript
  todoLabel
    .events('dblclick')
    .mapTo({ type: 'startEdit' })
  ```
* `type: 'inputVal'` with current value on user input (in editing mode)

  ```javascript
  editInput
    .events('input')
    .map(ev => ({ type: 'inputVal', value: ev.target.value }))
  ```
* `type: 'titleChanged'` with todo id and current `inputVal` when ENTER_KEY is entered on input field (in editing mode)

  ```javascript
  editInput
    .events('keyup')
    .filter(ev => ev.keyCode === ENTER_KEY)
    .mapToLatest(sources.props, sources.state)
    .map(({props, state}) => ({ type: 'titleChanged', id: props.id, title: state.inputVal }))
  ```
* `type: 'cancelEdit'` when ESC_KEY is entered on input field (in editing mode)

  ```javascript
  editInput
    .events('keyup')
    .filter(ev => ev.keyCode === ESC_KEY)
    .map(() => ({ type: 'cancelEdit' })),
  ```
* `type: 'inputVal'` with current todo title on `'startEdit'` and `'cancelEdit'` 
  (using already defined actions as our sources)

  ```javascript
  sources.actions
    .filterByType('cancelEdit')
    .mapToLatest(sources.props)
    .map(props => ({ type: 'inputVal', value: props.title })),

  sources.actions
    .filterByType('startEdit')
    .mapToLatest(sources.props)
    .map(props => ({ type: 'inputVal', value: props.title }))
  ```

### Reducers
Reducers are used for changing a component state. 
This means we need to update `editing` and `inputVal` state properties using component actions as our source.

Defining component reducers:
* on `type: 'startEdit'` set `editing = true`:

  ```javascript
  sources.actions
    .filterByType('startEdit')
    .reducer(state => {
      state.editing = true
      return state
    })
  ```
* on `type: 'cancelEdit'` set `editing = false`:

  ```javascript
  sources.actions
    .filterByType('cancelEdit')
    .reducer(state => {
      state.editing = false
      return state
    })
  ```
* on `type: 'titleChanged'` set `editing = false`:

  ```javascript
  sources.actions
    .filterByType('titleChanged')
    .reducer(state => {
      state.editing = false
      return state
    })
  ```
* on `type: 'inputVal'` set `inputVal = action.value`:

  ```javascript
  sources.actions
    .filterByType('inputVal')
    .reducer((state, action) => {
      state.inputVal = action.value
      return state
    })
  ```

## TodoList
Root component of a TodoMVC app is called  *TodoList*. 
Its dynamic features are: an input field for adding new todo item 
and a list of todo items:

```JSON
initialState: {
  inputVal: '',
  list: []
}
```

### View

To keep this guide as simple as possible, we will focus only on the header and the main section of a view:

```javascript
function view (jsx, props, state) {
  return (
    <header className='header'>
      <h1>todos</h1>
      <input
        className='new-todo'
        type='text'
        value={state.inputVal}
        placeholder='What needs to be done?'
        name='newTodo' />
    </header>

    ...

    <ul className='todo-list'>
      {
        state.list
          .map(props => (
            <Todo
              id={props.id}
              title={props.title}
              completed={props.completed}
              key={props.id}
            />
          ))
      }
    </ul>
  )
}
```

### Actions
Selecting DOM elements which we need to observe for changes: 

```javascript
function actions (sources) {
  const newTodoInput = sources.DOM.select('.new-todo')
  const toggleAll = sources.DOM.select('.toggle-all')
  const clearCompleted = sources.DOM.select('.clear-completed')
}
```

Defining component actions:
* `type: 'toggleTodo'` with todo id when child component dispatches `type: 'toggle'` action

  ```javascript
  sources.childrenActions
    .filterByType('toggle')
    .map(action => ({ type: 'toggleTodo', id: action.id }))
  ```
* `type: 'deleteTodo'` with todo id when child component dispatches `type: 'destroy'` action

  ```javascript
  sources.childrenActions
    .filterByType('destroy')
    .map(action => ({ type: 'deleteTodo', id: action.id }))
  ```
* `type: 'editTodo'` with todo id when child component dispatches `type: 'titleChanged'` action

  ```javascript
  sources.childrenActions
    .filterByType('titleChanged')
    .map(action => ({ type: 'editTodo', id: action.id }))
  ```
* `type: 'inputVal'` with current value on user input

  ```javascript
  newTodoInput
    .events('input')
    .map(e => ({ type: 'inputVal', payload: e.target.value }))
  ```
* `type: 'insertTodo'` with current value when ENTER_KEY is entered on input field

  ```javascript
  newTodoInput
    .events('keydown')
    .filter(e => e.keyCode === ENTER_KEY)
    .map(e => e.target.value)
    .filter(val => val.length > 0)
    .map(val => ({ type: 'insertTodo', payload: val }))
  ```
* `type: 'inputVal'` with empty string (clearing input field) when todo is inserted

  ```javascript
  sources.actions
    .filterByType('insertTodo')
    .mapTo({ type: 'inputVal', payload: '' })
  ```
* `type: 'inputVal'` with empty string (clearing input field) when ESC_KEY is entered on input field

  ```javascript
  newTodoInput
    .events('keydown')
    .filter(e => e.keyCode === ESC_KEY)
    .mapTo({ type: 'inputVal', payload: '' })
  ```
* `type: 'toggleAll'` when toggleAll is clicked

  ```javascript
  toggleAll
    .events('click')
    .mapTo({ type: 'toggleAll' })
  ```
* `type: 'deleteCompleted'` when clearCompleted is clicked

  ```javascript
  clearCompleted
    .events('click')
    .mapTo({ type: 'deleteCompleted' })
  ```

  ### Reducers

  Defining component reducers:
* on `type: 'inputVal'` apply `inputVal` reducer

  ```javascript
  sources.actions
    .filterByType('inputVal')
    .reducer(function inputVal (state, action) {
      state.inputVal = action.payload

      return state
    })
  ```
* on `type: 'editTodo'` apply `editTodo` reducer

  ```javascript
  sources.actions
    .filterByType('editTodo')
    .reducer(function editTodo (state, action) {
      let todo = state.list.find(todo => todo.id === action.id)
      todo.title = action.title

      return state
    })
  ```
* on `type: 'deleteTodo'` apply `deleteTodo` reducer

  ```javascript
  sources.actions
    .filterByType('deleteTodo')
    .reducer(function deleteTodo (state, action) {
      state.list = state.list
        .filter(todo => !(todo.id === action.id))

      return state
    })
  ```
* on `type: 'toggleTodo'` apply `toggleTodo` reducer

  ```javascript
  sources.actions
    .filterByType('toggleTodo')
    .reducer(function toggleTodo (state, action) {
      let todo = state.list.find(todo => todo.id === action.id)
      todo.completed = !todo.completed

      return state
    })
  ```
* on `type: 'toggleAll'` apply `toggleAll` reducer

  ```javascript
  sources.actions
    .filterByType('toggleAll')
    .reducer(function toggleAll (state, action) {
      let amountCompleted = state.list
        .filter(todoData => todoData.completed)
        .length

      let amountActive = state.list.length - amountCompleted

      state.list.forEach(todo => {
        todo.completed = (amountActive)
      })

      return state
    })
  ```
* on `type: 'deleteCompleted'` apply `deleteCompleted` reducer

  ```javascript
  sources.actions
    .filterByType('deleteCompleted')
    .reducer(function deleteCompleted (state, action) {
      state.list = state.list
        .filter(todo => todo.completed === false)

      return state
    })
  ```
* on `type: 'insertTodo'` apply `insertTodo` reducer

  ```javascript
  sources.actions
    .filterByType('insertTodo')
    .reducer(function insertTodo (state, action) {
      let lastId = state.list.length > 0
      ? state.list[state.list.length - 1].id : 0

      state.list.push({
        id: lastId + 1,
        title: action.payload,
        completed: false
      })

      return state
    })
  ```

## Complete Example
For a complete example with routing and localstorage support check [here](https://github.com/recyclejs/recycle/tree/master/examples/TodoMVC).