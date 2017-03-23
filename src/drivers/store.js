export default function storeDriver (recycle, Rx) {
  const store$ = new Rx.Subject()
  const state = {}
  const aggregators = []

  recycle.on('componentInit', function (c) {
    const aggregate = c.get('aggregate')
    if (typeof aggregate !== 'object') {
      return
    }
    Object.keys(aggregate).forEach(key => {
      if (state[key] !== undefined) {
        throw new Error(`${key} aggregate is already defined`)
      }
      state[key] = aggregate[key]
    })
    c.replaceState(aggregate)
    aggregators.push(c)
  })

  recycle.on('newState', function (c, state) {
    const aggregate = c.get('aggregate')
    if (typeof aggregate !== 'object') {
      return
    }
    Object.keys(state).forEach(key => {
      if (aggregate[key] === undefined) {
        throw new Error(`Could not calculate state. ${key} is not defined in aggregate.`)
      }
    })
  })

  recycle.on('componentsInitalized', function () {
    Rx.Observable.merge(...aggregators.map(c => c.getStateStream()))
      .map(res => res.state)
      .startWith(state)
      .scan((acc, curr) => {
        return Object.assign({}, acc, curr)
      })
      .subscribe(store$)
  })

  return store$
}
