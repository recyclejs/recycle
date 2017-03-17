import createRecycle from './recycle'
import streamAdapter from './adapter/rxjs'
import initEmitter from './drivers/initEmitter'
import childrenProp from './drivers/childrenProp'
import typeChecker from './drivers/typeChecker'

export default function (Rx) {
  const recycle = createRecycle(streamAdapter(Rx))
  recycle.use(initEmitter, childrenProp, typeChecker)

  // "headless root component"
  const rootComponent = recycle.createComponent(() => ({}), null, false)
  // rewriting createComponent to set rootComponent as its parent
  const createComponent = function (constructor, props, componentDefinition) {
    return recycle.createComponent(constructor, props, rootComponent, componentDefinition)
  }

  const createReactComponent = function (reactComponent, props) {
    if (!recycle.get('createReactComponent')) {
      throw new Error('createReactComponent function is not set')
    }
    return recycle.get('createReactComponent')(reactComponent, props, rootComponent)
  }

  return {
    ...recycle,
    createReactComponent,
    createComponent
  }
}

function type (type) {
  return {
    isRequired: {
      condition: 'isRequired',
      type
    }
  }
}

export const sourceTypes = {
  func: type('func'),
  any: type('any'),
  object: type('object'),
  array: type('array'),
  bool: type('bool'),
  number: type('number'),
  symbol: type('symbol'),
  observable: type('observable'),
  string: type('string')
}
