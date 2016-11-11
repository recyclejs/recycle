import objectpath from 'objectpath'

export default (recycle) => {
  const store = {}

  recycle.on('componentUpdated', (state, action, component) => {
    if (action && action.fromStore) {
      return
    }
    const storePath = parsePath(component.get('storePath'))
    if (storePath) {
      saveByPath(storePath, state, store)
      recycle.getAllComponents()
        .filter(c => c !== component)
        .filter(c => shouldUpdate(storePath, parsePath(c.get('storePath'))))
        .map(c => c.setState(getByPath(parsePath(c.get('storePath')), store), { fromStore: true }))
    }
  })
}

export function getByPath(parts, source) {
  let property = source;
  let i

  for (i = 0; i < parts.length; i++) {
    if (parts[i + 1]) {
      const test = property[parts.slice(i).join('.')]
      if (test) {
        property = test
        i++
        continue
      }
    }

    property = property[parts[i]];
    if (property === undefined) {
      return undefined;
    }
  }

  if (i === 0) return undefined
  if (property && property.value) return property.value
  return property
}

export function saveByPath(path, value, current) {
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

export function parsePath(path) {
  if (typeof path === 'string') {
    return objectpath.parse(path)
  }
  return path
}

export function shouldUpdate(sourcePath, targetPath) {
  if (!targetPath) {
    return false
  }
  if (targetPath.length > sourcePath.length) {
    return false
  }
  for (let i; i < targetPath.length; i++) {
    if (sourcePath[i] !== targetPath[i]) {
      return false
    }
  }
  return true
}
