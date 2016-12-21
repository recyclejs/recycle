import createRecycle from './recycle'

export default (config) => {
  if (!config || !config.adapter) {
    throw new Error('Missing adapter property for creating Recycle instance')
  }

  const React = config.adapter[0]
  const {findDOMNode} = config.adapter[1]
  const reactRender = config.adapter[1].render
  const {Observable, Subject} = config.adapter[2]

  const recycle = createRecycle({
    React,
    findDOMNode,
    Observable,
    Subject
  })

  const plugins = {}
  recycle.getPlugin = name => plugins[name]

  if (config.plugins) {
    config.plugins.map((m) => {
      const instance = m(recycle, config.adapter)
      const name = (instance && instance.name) ? instance.name : 'plugin-' + Math.random()
      plugins[name] = instance
      return false
    })
  }

  function render (Component, props, target) {
    if (!target) {
      target = props
      props = null
    }
    return reactRender(React.createElement(toReact(Component, props), props), target)
  }

  function toReact (Component, props) {
    if (recycle.getRootComponent()) {
      throw new Error('Root component already exists. toReact can be used once per recyle instance.')
    }
    return recycle.createComponent(Component, props).getReactComponent()
  }

  return {
    getComponentStructure: recycle.getComponentStructure,
    getAllComponents: recycle.getAllComponents,
    toReact,
    render
  }
}
