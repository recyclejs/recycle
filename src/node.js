import Recycle from './recycle'
import streamAdapter from './adapter/rxjs'

export default function (Rx, children) {
  const recycle = Recycle(streamAdapter(Rx))
  const rootComponent = recycle.createComponent({})
  children.forEach(child => {
    recycle.createComponent(child, null, rootComponent)
  })
  return recycle
}
