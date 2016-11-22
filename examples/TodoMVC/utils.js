/* global localStorage */
const ENTER_KEY = 13
const ESC_KEY = 27
export {ENTER_KEY, ESC_KEY}

export function updateLocalStorage (state) {
  localStorage.setItem('todos-recycle-0', JSON.stringify(state.list))
}

export function getFromLocalStorage () {
  let saved = localStorage.getItem('todos-recycle-0')
  try {
    saved = JSON.parse(saved) || []
  } catch (e) {
    saved = []
    console.error(e)
  }
  return saved
}
