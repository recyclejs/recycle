import Recycle from './recycle'
import reactDriver from './drivers/react'
import streamAdapter from './adapter/rxjs'

export default function (React, Rx) {
  const recycle = Recycle(streamAdapter(Rx))
  let drivers = [reactDriver(React)]
  recycle.use(drivers)

  // "headless root component"
  // its children can be react component or any other
  const rootComponent = recycle.createComponent(() => ({}), null, false)

  const createReactComponent = function (reactComponent, props) {
    const $$typeofReactElement = React.createElement(function() {}).$$typeof
    let componentDefinition = reactComponent(props)

    if (componentDefinition.$$typeof === $$typeofReactElement) {
      componentDefinition = { view: reactComponent }
    }

    return recycle.createComponent(reactComponent, props, rootComponent, componentDefinition).get('ReactComponent')
  }

  const createComponent = function (constructor, props) {
    return recycle.createComponent(constructor, props, rootComponent)
  }

  return {
    ...recycle,
    createComponent,
    createReactComponent
  }
}
