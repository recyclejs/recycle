export default function storeDriver (recycle, Rx) {
  const store$ = new Rx.Subject()
  const store = {}
  const aggregators = []

  recycle.on('sourcesReady', function (c) {
    const modifyStore = c.getPrivate('modifyStore')
    if (!modifyStore) {
      return
    }

    let initialState = c.get('initialState')
    if (typeof initialState === 'function') {
      initialState = initialState(c.getSources())
    }

    Object.keys(modifyStore).forEach(key => {
      if (store[key] !== undefined) {
        throw new Error(`${key} is already modified by another store component`)
      }
      store[key] = modifyStore[key](initialState)
    })
    aggregators.push(c)
  })

  recycle.on('componentsInitalized', function () {
    Rx.Observable.merge(...aggregators.map(c => c.getStateStream().map(res => [res, c])))
      .map(([res, c]) => {
        const modifyStore = c.getPrivate('modifyStore')
        const calcState = {}
        Object.keys(modifyStore).forEach(key => {
          calcState[key] = modifyStore[key](res.state)
        })
        return calcState
      })
      .startWith(store)
      .scan((acc, curr) => {
        return Object.assign({}, acc, curr)
      })
      .subscribe(store$)
  })

  return store$
}
