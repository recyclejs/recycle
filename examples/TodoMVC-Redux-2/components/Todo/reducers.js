export default function reducers (sources) {
  return [
    sources.actions
      .filterByType('startEdit')
      .reducer(state => {
        state.editing = true
        return state
      }),

    sources.actions
      .filterByType('cancelEdit')
      .reducer(state => {
        state.editing = false
        return state
      }),

    sources.actions
      .filterByType('titleChanged')
      .reducer(state => {
        state.editing = false
        return state
      }),

    sources.actions
      .filterByType('inputVal')
      .reducer((state, action) => {
        state.inputVal = action.value
        return state
      })
  ]
}
