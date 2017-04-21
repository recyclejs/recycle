import { Observable } from 'rxjs/Observable'

if (!Observable.prototype.reducer) {
  Observable.prototype.reducer = function reducer (reducerFn) {
    return this.map(event => ({ reducer: reducerFn, event }))
  }
}
