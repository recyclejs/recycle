import { Observable } from 'rxjs/Observable'
import objectpath from 'objectpath'

export default (store) => (recycle) => {
  recycle.on('componentInit', (component) => {
    const dispatchFunction = component.get('dispatch')
    if (dispatchFunction) {
      component.set('initialState', store.getState())

      const childrenActions = component.getSource('childrenActions')
      const actionsArr = forceArray(dispatchFunction(childrenActions))
      const actionsStream = Observable.merge(...actionsArr)

      component._actionsSubscription = actionsStream.subscribe(a => {
        let action = a
        if (typeof a.reducer === 'function') {
          let reducerPath = component.get('reducerPath')
          let state = store.getState()

          if (reducerPath) {
            reducerPath = parsePath(reducerPath)
            state = getByPath(reducerPath, state)
          }

          action.type = 'RECYCLE_REDUCER'
          const recycleAction = a.action
          delete recycleAction.childComponent
          let recycleState = a.reducer(state, recycleAction)

          if (reducerPath) {
            let storeState = {...store.getState()}
            if (recycleState === false) {
              deleteByPath(reducerPath, storeState)
            } else {
              setByPath(reducerPath, recycleState, storeState)
            }
            recycleState = storeState
          }

          delete action.reducer
          delete action.action
          action.payload = recycleState
        }
        store.dispatch(action)
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

export function forceArray (arr) {
  if (!Array.isArray(arr)) return [arr]
  return arr
}

export function parsePath (path) {
  if (typeof path === 'string') {
    return objectpath.parse(path)
  }
  return path
}

export function getByPath (parts, current) {
  for (let i = 0; i < parts.length; ++i) {
    if (parts[i] !== '') {
      current = current[parts[i]]
    }
  }
  return current
}

export function setByPath (path, value, current) {
  path.forEach((i, index) => {
    if (index === path.length - 1) {
      current[i] = value
      return
    }
    if (!current[i]) {
      current[i] = {}
    }
    current = current[i]
  })
}

export function deleteByPath (parts, current) {
  for (let i = 0; i < parts.length; ++i) {
    if (i === parts.length - 1) {
      delete current[parts[i]]
    } else {
      current = current[parts[i]]
    }
  }
}
