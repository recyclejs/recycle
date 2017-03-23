export default function actionsDriver (recycle, Rx) {
  const action$ = new Rx.Subject()

  recycle.on('action', function (action) {
    action$.next(action)
  })

  return action$
}
