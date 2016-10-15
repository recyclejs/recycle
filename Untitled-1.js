function Timer() {
  return {
    initialState: {
      secondsElapsed: 0
    },
    reducer:  () => [
       Observable.interval(1000)
        .map(function(state) {
          state.secondsElapsed++
          return state
        })
    ],
    view: (state) => {
      <div>Seconds Elapsed: {state.secondsElapsed}</div>
    }
  }
}