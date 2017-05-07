export const reducer = (reducerFn) => (stream) =>
  stream.map(event => ({ reducer: reducerFn, event }))

export default Rx => {
  if (!Rx.Observable.prototype.reducer) {
    Rx.Observable.prototype.reducer = function (reducerFn) {
      return reducer(reducerFn)(this)
    }
  }
}
