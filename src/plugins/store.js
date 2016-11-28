import objectpath from 'objectpath'

export default ({ initialState, onUpdate }) => (recycle, adapter) => {
  const store = initialState || {}
  let storeVer = 0

  recycle.on('componentInit', (component) => {
    let storePath = component.get('storePath')

    if (storePath) {
      storePath = parsePath(storePath)
      component.set('storePath', storePath)
      const storeState = getByPath(storePath, store)
      if (typeof storeState !== 'object' || Array.isArray(storeState)) {
        const stateStr = JSON.stringify(storeState)
        throw new Error(`Component state must be an object, got: '${stateStr}'`)
      }

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
      if (state === false) {
        deleteByPath(component.get('storePath'), store)
        storeVer++
        component.set('storeVer', storeVer)
        updateComponents(storePath)
      } else {
        setByPath(storePath, state, store)
        storeVer++
        component.set('storeVer', storeVer)
      }
      if (onUpdate) {
        onUpdate(store)
      }
    }
  })

  recycle.on('componentUpdate', component => {
    const storePath = component.get('storePath')
    if (storePath) {
      updateComponents(storePath)
    }
  })

  function updateComponents (storePath) {
    recycle.getAllComponents()
      .filter(c => c.get('storeVer') !== storeVer)
      .filter(c => shouldUpdate(storePath, c.get('storePath')))
      .map(c => {
        c.setState(getByPath(c.get('storePath'), store))
        c.set('storeVer', storeVer)
      })
  }

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
