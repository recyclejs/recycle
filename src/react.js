import createRecycle from './index'
import reactDriver from './drivers/react'

export default function (React, Rx) {
  const recycle = createRecycle(Rx)
  recycle.use(reactDriver(React))

  // "headless root component"
  // its children can be react component or any other
  const rootComponent = recycle.createComponent(() => ({}), null, false)

  const createReactComponent = function (reactComponent, props) {
    const $$typeofReactElement = React.createElement(function () {}).$$typeof
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
