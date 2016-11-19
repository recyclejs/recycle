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
