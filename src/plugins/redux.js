import { Observable } from 'rxjs/Observable'
import { Subject } from 'rxjs/Subject'
import objectpath from 'objectpath'

export default (store) => (recycle) => {
  recycle.on('componentInit', (component) => {
    const dispatchFunction = component.get('dispatch')
    if (dispatchFunction) {
      const childrenActions = component.getSource('childrenActions')
      const actionsArr = forceArray(dispatchFunction(childrenActions))
      const manualActions = new Subject()
      actionsArr.push(manualActions)
      const actionsStream = Observable.merge(...actionsArr)

      component._actionsSubscription = actionsStream.subscribe(a => {
        let action = a
        if (typeof a.reducer === 'function') {
          let storePath = component.get('storePath')
          let state = store.getState()

          if (storePath) {
            storePath = parsePath(storePath)
            state = getByPath(storePath, state)
          }

          action.type = 'RECYCLE_REDUCER'
          const recycleAction = a.action
          delete recycleAction.childComponent
          let recycleState = a.reducer(state, recycleAction)

          if (storePath) {
            let storeState = {...store.getState()}
            if (recycleState === false) {
              deleteByPath(storePath, storeState)
            } else {
              setByPath(storePath, recycleState, storeState)
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
