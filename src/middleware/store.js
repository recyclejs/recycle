import objectpath from 'objectpath'

export default ({ initialState }) => (recycle, adapter) => {
  const store = initialState || {}
  let storeVer = 0

  recycle.on('componentInit', (component) => {
    let storePath = component.get('storePath')

    if (storePath) {
      storePath = parsePath(storePath)
      component.set('storePath', storePath)
      const storeState = getByPath(storePath, store)

      if (component.get('initialState')) {
        const pathStr = storePath.join('.')
        throw new Error(`Could not use ${component.getName()}'s initialState. It should be defined in store (path: '${pathStr}')`)
      }
      component.set('initialState', storeState)
    }
  })

  recycle.on('newState', (component, state) => {
    const storePath = component.get('storePath')
    if (storePath) {
      setByPath(storePath, state, store)
      storeVer++
      component.set('storeVer', storeVer)
    }
  })

  recycle.on('componentUpdate', component => {
    const storePath = component.get('storePath')
    if (storePath) {
      updateComponents(component, storePath)
    }
  })

  recycle.on('componentStateFalse', component => {
    const storePath = component.get('storePath')
    if (storePath) {
      deleteByPath(component.get('storePath'), store)
      storeVer++
      updateComponents(component, storePath)
    }
  })

  function updateComponents (refComponent, storePath) {
    recycle.getAllComponents()
      .filter(c => c !== refComponent)
      .filter(c => c.get('storeVer') !== storeVer)
      .filter(c => shouldUpdate(storePath, c.get('storePath')))
      .map(c => {
        c.setState(getByPath(c.get('storePath'), store))
        c.set('storeVer', storeVer)
      })
  }

  /*
  concept for a remote state

  recycle.on('componentInit', (component) => {
    const remoteResponse = new adapter.Subject()
    component.setSource('remoteResponse', remoteResponse)
  })

  recycle.on('action', (action, component) => {
    if (action.something === 'should send to remote') {
      getStoreFromRemote(action, component.get('storePath'), function done(remoteState) {
        component.getSource('remoteResponse').next(remoteState)
      })
    }
  })
  */

  return {
    name: 'store'
  }
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

export function deleteByPath (parts, current) {
  for (let i = 0; i < parts.length; ++i) {
    if (i === parts.length - 1) {
      delete current[parts[i]]
    } else {
      current = current[parts[i]]
    }
  }
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

export function shouldUpdate (sourcePath, targetPath) {
  if (!targetPath) {
    return false
  }
  if (targetPath[0] !== sourcePath[0]) {
    return false
  }
  return true
}
