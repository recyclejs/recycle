export function deleteTodo (state, action) {
  state.list = state.list
    .filter(todo => !(todo.id === action.id))

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
