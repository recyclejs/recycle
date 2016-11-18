import objectpath from 'objectpath'

export default ({ initialState }) => (recycle, adapter) => {
  const store = initialState || {}
  const actionRef = () => {}

  recycle.on('componentWillUpdate', component => {
    const storePath = parsePath(component.get('storePath'))
    component.set('storePath', storePath)
  })

  recycle.on('componentInit', (component) => {
    const storePath = parsePath(component.get('storePath'))

    if (storePath) {
      if (component.get('initialState')) {
        const pathStr = storePath.join('.')
        throw new Error(`Could not use ${component.getName()}'s initialState. It should be defined in store (path: '${pathStr}')`)
      }
      component.set('initialState', getByPath(storePath, store))
    }
  })

  recycle.on('componentUpdate', (state, action, component) => {
    if (action && action === actionRef) {
      return
    }
    const storePath = component.get('storePath')
    if (storePath) {
      setByPath(storePath, state, store)
      recycle.getAllComponents()
        .filter(c => c !== component)
        .filter(c => shouldUpdate(storePath, c.get('storePath')))
        .map(c => c.setState(getByPath(c.get('storePath'), store), actionRef))
    }
  })

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

export function getByPath (parts, current) {
  for (let i = 0; i < parts.length; ++i) {
    if (current[parts[i]] === undefined) {
      return undefined
    }
    current = current[parts[i]]
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

export function parsePath (path) {
  if (typeof path === 'string') {
    return objectpath.parse(path)
  }
  return path
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
