export default function todos (state = {todos: { list: [] }}, action) {
  switch (action.type) {
    case 'insertTodo':
      return insertTodo(state, action)
    case 'toggleAll':
      return toggleAll(state, action)
    case 'deleteCompleted':
      return deleteCompleted(state, action)
    case 'deleteTodo':
      return deleteTodo(state, action)
    case 'editTodo':
      return editTodo(state, action)
    case 'toggleTodo':
      return toggleTodo(state, action)
    default:
      return state
  }
}

function insertTodo (state, action) {
  let lastId = state.list.length > 0
   ? state.list[state.list.length - 1].id : 0

  state.list.push({
    id: lastId + 1,
    title: action.payload,
    completed: false
  })

  return state
}

function toggleAll (state, action) {
  let amountCompleted = state.list
    .filter(todoData => todoData.completed)
    .length

  let amountActive = state.list.length - amountCompleted

  state.list.forEach(todo => {
    todo.completed = (amountActive)
  })

  return state
}

function deleteCompleted (state, action) {
  state.list = state.list
    .filter(todo => todo.completed === false)

  return state
}

function deleteTodo (state, action) {
  state.list = state.list
    .filter(todo => !(todo.id === action.id))

  return state
}

function editTodo (state, action) {
  let todo = state.list.find(todo => todo.id === action.id)
  todo.title = action.title

  return state
}

function toggleTodo (state, action) {
  let todo = state.list.find(todo => todo.id === action.id)
  todo.completed = !todo.completed

  return state
}
