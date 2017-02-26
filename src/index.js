import createRecycle from './recycle'
import streamAdapter from './adapter/rxjs'
import initEmitter from './drivers/initEmitter'
import childrenProp from './drivers/childrenProp'
import typeChecker from './drivers/typeChecker'

export default function (Rx) {
  const recycle = createRecycle(streamAdapter(Rx))
  recycle.use(initEmitter, childrenProp, typeChecker)
  return recycle
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
