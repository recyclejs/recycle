export function addTodo (state, action) {
  return [
    {
      id: state.reduce((maxId, todo) => Math.max(todo.id, maxId), -1) + 1,
      completed: false,
      text: action.text
    },
    ...state
  ]
}

export function deleteTodo (state, action) {
  return state.filter(todo =>
    todo.id !== action.id
  )
}

export function editTodo (state, action) {
  return state.map(todo =>
    todo.id === action.id ?
      { ...todo, text: action.text } :
      todo
  )
}

export function completeTodo (state, action) {
  return state.map(todo =>
    todo.id === action.id ?
      { ...todo, completed: !todo.completed } :
      todo
  )
}

export function completeAll (state, action) {
  const areAllMarked = state.every(todo => todo.completed)
  return state.map(todo => ({
    ...todo,
    completed: !areAllMarked
  }))
}

export function clearCompleted (state, action) {
  return state.filter(todo => todo.completed === false)
}
