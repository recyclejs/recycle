import Recycle from './recycle'
import streamAdapter from './adapter/rxjs'

export default function (params) {
  if (!params) {
    throw new Error('Invalid params')
  }
  if (!params.streamAdapter) {
    throw new Error('Missing streamAdapter')
  }

  const recycle = Recycle(streamAdapter(params.streamAdapter))
  const rootComponent = recycle.createComponent({})

  if (params.drivers) {
    recycle.use(params.drivers)
  }

  if (params.modules) {
    params.modules.forEach(child => {
      recycle.createComponent(child, null, rootComponent)
    })
  }

  return recycle
}
