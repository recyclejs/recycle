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

export function deleteCompleted (state, action) {
  state.list = state.list
    .filter(todo => todo.completed === false)

  return state
}
