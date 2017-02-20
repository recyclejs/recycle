import Recycle from './recycle'
import reactDriver from './drivers/react'
import streamAdapter from './adapter/rxjs'

export default function (React, Rx) {
  return function (props, publicContext, updateQueue) {
    // if Recycle was called as react component
    const recycle = Recycle(streamAdapter(Rx))
    let drivers = [reactDriver(React)]
    if (updateQueue && updateQueue.isMounted) {
      let root
      let passProps
      if (props && props.root) {
        root = props.root
        passProps = props.props
      }
      else if (props && props.children) {
        root = function () {
          return {
            view: function() {
              return <div>{props.children}</div>
            }
          }
        }
      }
      else {
        throw new Error('Missing root component for initializing Recycle')
      }

      if (props.drivers) {
        drivers = drivers.concat(props.drivers)
      }
      recycle.use(drivers)
      const ReactComponent = recycle.createComponent(root, passProps).get('ReactComponent')
      return React.createElement(ReactComponent, passProps)
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
      return recycle.createComponent(rootComponent, props).get('ReactComponent')
    }
  }
}
