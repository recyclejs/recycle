export default Rx => {
  if (!Rx.Observable.prototype.reducer) {
    Rx.Observable.prototype.reducer = function reducer (reducerFn) {
      return this.map(event => ({ reducer: reducerFn, event }))
    }
  }
}
