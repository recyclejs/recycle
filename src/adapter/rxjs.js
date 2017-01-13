export default function ({ Observable, Subject }) {
  // todo: more apstract api

  Observable.prototype.reducer = function reducer (reducerFn) {
    return this.map(action => ({ reducer: reducerFn, action }))
  }

  Observable.prototype.filterByType = function filterByType (type) {
    return this.filter(action => action.type === type)
  }

  Observable.prototype.filterByComponent = function filterByComponent (constructor) {
    return this.filter(action => action.childComponent === constructor)
  }

  Observable.prototype.mapToLatest = function mapToLatest (sourceFirst, sourceSecond) {
    if (sourceSecond) {
      return this.mapToLatest(sourceFirst).withLatestFrom(sourceSecond, (props, state) => ({props, state}))
    }
    return this.withLatestFrom(sourceFirst, (first, second) => second)
  }

  return { Observable, Subject }
}
