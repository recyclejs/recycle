export function destroy (state) {
  return false
}

export function setTitle (state, action) {
  state.title = action.payload
  return state
}

export function toggleTodo (state) {
  state.completed = !state.completed
  return state
}
