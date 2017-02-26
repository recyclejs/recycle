export default function (recycle, Rx) {
  const suggestions$ = recycle.action$
      .switchMap(val => Rx.Observable.ajax('https://api.github.com/search/users?q=' + val))
      .map(res => res.response.items)

  recycle.feedAllComponents('suggestions$', suggestions$)
}
