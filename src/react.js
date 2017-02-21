import Recycle from './recycle'
import reactDriver from './drivers/react'
import streamAdapter from './adapter/rxjs'

export default function (React, Rx) {
  return function (props, publicContext, updateQueue) {
    // if Recycle was called as react component
    const recycle = Recycle(streamAdapter(Rx))
    let drivers = [reactDriver(React)]
    if (updateQueue && updateQueue.isMounted) {
      if (!props || !props.root) {
        throw new Error('Missing root component for initializing Recycle')
      }

      if (props.drivers) {
        drivers = drivers.concat(props.drivers)
      }
      recycle.use(drivers)
      const ReactComponent = recycle.createComponent(props.root, props.props).get('ReactComponent')
      return React.createElement(ReactComponent, props.props)
    }

    if (Array.isArray(props)) {
      drivers = drivers.concat(props)
    }
    // if Recycle was called idependently
    if (arguments.length) {
      for (let i = 0; i < arguments.length; i++) {
        drivers.push(arguments[i])
      }
    }
    recycle.use(drivers)

    return function (rootComponent, props) {
      const $$typeofReactElement = React.createElement(function() {}).$$typeof
      let componentDefinition = rootComponent(props)

      if (componentDefinition.$$typeof === $$typeofReactElement) {
        componentDefinition = { view: rootComponent }
      }

      return recycle.createComponent(rootComponent, props, false, componentDefinition).get('ReactComponent')
    }
  }
}
