export function reducer(reducer) {
  if (arguments.length > 1) {
    return this.switchMap(action => {
      let reducers = []
      for (let i=0; i<arguments.length; i++) {
        reducers.push({reducer: arguments[i], action})
      }
      return Observable.of(...reducers)
    })
  }
  return this.map(action => ({reducer, action}))
}

export function filterByType(type) {
  return this.filter(action => action.type === type)
}