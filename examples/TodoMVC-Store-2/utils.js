/* global localStorage */
const ENTER_KEY = 13
const ESC_KEY = 27
export {ENTER_KEY, ESC_KEY}

export function objToArr (obj, key = 'id') {
  return Object.keys(obj).map(key => obj[key])
}

export function arrToObj (arr, key = 'id') {
  const newState = {}
  arr.map(item => { newState[item[key]] = item })
  return newState
}

export function updateLocalStorage (store) {
  localStorage.setItem('todos-recycle-2', JSON.stringify(store.todos.list))
}

export function getFromLocalStorage () {
  let saved = localStorage.getItem('todos-recycle-2')
  try {
    saved = JSON.parse(saved) || {}
  } catch (e) {
    saved = {}
    console.error(e)
  }
  return saved
}
