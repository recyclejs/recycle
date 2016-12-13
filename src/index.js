import createRecycle from './recycle'

export default (config) => {
  if (!config || !config.adapter) {
    throw new Error('Missing adapter property for creating Recycle instance')
  }

  const adapter = config.adapter
  const recycle = createRecycle({
    adapter: config.adapter
  })

  const plugins = {}
  recycle.getPlugin = name => plugins[name]

  if (config.plugins) {
    config.plugins.map((m) => {
      const instance = m(recycle, adapter)
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
    return adapter.render(adapter.createElement(toReact(Component, props), props), target)
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
