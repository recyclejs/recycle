import Recycle from './recycle'
import streamAdapter from './adapter/rxjs'
import Rx from 'rxjs/Rx'
import nodeDriver from './drivers/node'

export default function (driversArr) {
  const recycle = Recycle(streamAdapter(Rx))
  let drivers = [nodeDriver]

  if (Array.isArray(driversArr)) {
    drivers = drivers.concat(driversArr)
  } else if (arguments.length) {
    for (let i = 0; i < arguments.length; i++) {
      drivers.push(arguments[i])
    }
  }
  recycle.use(drivers)

  return function (rootComponent, props) {
    return recycle.createComponent(rootComponent, props)
  }
}
