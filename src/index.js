import Recycle from './recycle'

export default function createRecycle(config) {
  if (!config || !config.adapter)
    throw new Error('Missing adapter property for creating Recycle instance')

  let adapter = config.adapter()
  var recycle = Recycle(adapter)

  function createReactElement(constructor, props) {
    return adapter.createElement(recycle.Component(constructor).getReactComponent(), props)
  }

  function render(Component, target) {
    return adapter.render(createReactElement(Component), target)
  }

  var key = 0
  function createReactClass(constructor, jsx) {
    return adapter.createClass({
      render: function () {
        key++
        var props = Object.assign({}, { key: key }, this.props)
        return jsx(constructor, props)
      }
    })
  }

  return {
    render,
    createReactClass,
    createReactElement
  }
}