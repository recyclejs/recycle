export default function reducers (sources) {
  return [
    sources.actions
      .filterByType('inputVal')
      .reducer((state, action) => {
        state.inputVal = action.payload
        return state
      })
  ]
}
