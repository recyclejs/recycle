export default (recycle, Rx) => {
  function getType (test) {
    if (test instanceof Rx.Observable) {
      return 'observable'
    }
    if (Array.isArray(test)) {
      return 'array'
    }
    return typeof test
  }

  function isTypeOf (original, testType) {
    switch (testType) {
      case 'any':
        return true
      case 'observable':
        return original instanceof Rx.Observable
      case 'func':
        return typeof original === 'function'
      case 'array':
        return Array.isArray(original)
      case 'object':
        return typeof original === 'object'
      case 'bool':
        return typeof original === 'boolean'
      case 'number':
        return typeof original === 'number'
      case 'string':
        return typeof original === 'string'
      case 'symbol':
        return typeof original === 'symbol'
    }
    return false
  }

  recycle.on('sourcesReady', (c) => {
    const sourceTypes = c.get('sourceTypes')
    if (typeof sourceTypes !== 'object') {
      return
    }
    Object.keys(sourceTypes).forEach(function (source) {
      const sourceVal = c.getSource(source)
      if (sourceVal === undefined && sourceTypes[source].condition === 'isRequired') {
        throw new Error(`Failed source type: The source \`${source}\` is marked as required in \`${c.getName()}\`, but its value is \`undefined\`.`)
      }

      if (sourceVal !== undefined && !isTypeOf(sourceVal, sourceTypes[source].type)) {
        throw new Error(`Failed source type: Invalid source \`${source}\` of type \`${getType(sourceVal)}\` supplied to \`${c.getName()}\`, expected \`${sourceTypes[source].type}\`.`)
      }
    })
  })

  return {
    name: 'typeChecker'
  }
}
