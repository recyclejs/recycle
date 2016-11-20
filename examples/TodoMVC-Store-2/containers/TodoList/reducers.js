import {objToArr, arrToObj} from '../../utils'

export function insertTodo (state, action) {
  const todoIds = Object.keys(state).map(id => parseInt(id))
  let lastId = (todoIds.length > 0) ? Math.max(...todoIds) : 0
  const id = lastId + 1

  state[id] = {
    id,
    title: action.payload,
    completed: false
  }
  return state
}

export function toggleAll (state, action) {
  let todosArr = objToArr(state)

  let amountCompleted = todosArr
    .filter(todoData => todoData.completed)
    .length

  let amountActive = todosArr.length - amountCompleted

  todosArr.forEach(todo => {
    todo.completed = (amountActive)
  })

  return arrToObj(todosArr)
}

export function deleteCompleted (state, action) {
  let todosArr = objToArr(state)
    .filter(todo => todo.completed === false)

  return arrToObj(todosArr)
}
