import createRecycle from './recycle'
import streamAdapter from './adapter/rxjs'
import initEmitter from './drivers/initEmitter'
import childrenProp from './drivers/childrenProp'

export default function (Rx) {
  const recycle = createRecycle(streamAdapter(Rx))
  recycle.applyDriver(initEmitter)
  recycle.applyDriver(childrenProp)

  return recycle
}
