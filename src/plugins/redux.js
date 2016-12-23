import { Observable } from 'rxjs/Observable'

export default (store) => (recycle, adapter) => {
  recycle.on('componentInit', (component) => {
    const dispatchFunction = component.get('dispatch')
    if (dispatchFunction) {
      component.set('initialState', store.getState())

      const actionsArr = forceArray(dispatchFunction(component.getSource('childrenActions')))
      const actionsStream = Observable.merge(...actionsArr)

      component._actionsSubscription = actionsStream.subscribe(a => {
        store.dispatch(a)
      })

      component._reduxUnsubscribe = store.subscribe(() => {
        component.setState(store.getState())
      })
    }
  })

  recycle.on('componentWillUnmount', component => {
    if (component._actionsSubscription) {
      component._actionsSubscription.unsubscribe()
    }
    if (component._reduxUnsubscribe) {
      component._reduxUnsubscribe()
    }
  })

  return {
    name: 'redux'
  }
}

function forceArray (arr) {
  if (!Array.isArray(arr)) return [arr]
  return arr
}
