export function insertTodo (state, text) {
  let lastId = state.list.length > 0
   ? state.list[state.list.length - 1].id : 0

  state.list.push({
    id: lastId + 1,
    title: text,
    completed: false
  })
  state.inputVal = ''

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
    todo.completed = (amountActive) ? true : false
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

export function inputVal (state, text) {
  state.inputVal = text

  return state
}
