export default function reducers (sources) {
  return [
    // if recievied action type is 'editTodo'
    // apply a editTodo reducer which generates a new state
    // with new title for a todo (found by id)
    sources.actions
      .filterByType('editTodo')
      .reducer(editTodo),

    // if recievied action type is 'toggleTodo'
    // apply a toggleTodo reducer which generates a new state
    // where todo (found by id) has completed = !previousCompleted
    sources.actions
      .filterByType('toggleTodo')
      .reducer(toggleTodo),

    // if recievied action type is 'toggleAll'
    // apply a reducer which generates a new state
    // where all todos have the same completed flag
    sources.actions
      .filterByType('toggleAll')
      .reducer(toggleAll),

    // if recievied action type is 'deleteTodo'
    // apply a reducer which generates a new state
    // where todo (found by id) is removed from state.list
    sources.actions
      .filterByType('deleteTodo')
      .reducer(deleteTodo),

    // if recievied action type is 'deleteCompleted'
    // apply a reducer which generates a new state
    // where all cmopleted todos are removed from state.list
    sources.actions
      .filterByType('deleteCompleted')
      .reducer(deleteCompleted),

    // if recievied action type is 'insertTodo'
    // apply a insertTodo reducer
    sources.actions
      .filterByType('insertTodo')
      .reducer(insertTodo),

    sources.actions
      .filterByType('inputVal')
      .reducer(inputVal)
  ]
}


export function insertTodo (state, action) {
  let lastId = state.list.length > 0
   ? state.list[state.list.length - 1].id : 0

  state.list.push({
    id: lastId + 1,
    title: action.payload,
    completed: false
  })

  return state
}

export function editTodo (state, action) {
  let todo = state.list.find(todo => todo.id === action.id)
  todo.title = action.title

  return state
}

export function toggleTodo (state, action) {
  let todo = state.list.find(todo => todo.id === action.id)
  todo.completed = !todo.completed

  return state
}

export function toggleAll (state, action) {
  let amountCompleted = state.list
    .filter(todoData => todoData.completed)
    .length

  let amountActive = state.list.length - amountCompleted

  state.list.forEach(todo => {
    todo.completed = (amountActive)
  })

  return state
}

export function deleteTodo (state, action) {
  state.list = state.list
    .filter(todo => !(todo.id === action.id))

  return state
}

export function deleteCompleted (state, action) {
  state.list = state.list
    .filter(todo => todo.completed === false)

  return state
}

export function inputVal (state, action) {
  state.inputVal = action.payload

  return state
}
