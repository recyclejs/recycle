export default function ({ Observable, Subject }) {
  // todo: more apstract api

  Observable.prototype.reducer = function reducer (reducerFn) {
    return this.map(action => ({ reducer: reducerFn, action }))
  }

  return { Observable, Subject }
}
