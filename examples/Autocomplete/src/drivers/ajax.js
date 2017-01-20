export default function (recycle, { Subject, Observable }) {
  const values$ = new Subject()
  const suggestions$ = values$
      .switchMap(val => Observable.ajax('https://api.github.com/search/users?q=' + val))
      .map(res => res.response.items)

  recycle.on('componentInit', (component) => {
    component.setSource('suggestions', suggestions$)
  })

  recycle.on('action', (action, component) => {
    values$.next(action)
  })
}
