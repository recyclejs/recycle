export function deleteTodo (state) {
  return false
}

export function editTodo (state, action) {
  state.title = action.payload
  return state
}

export function toggleTodo (state) {
  state.completed = !state.completed
  return state
}
