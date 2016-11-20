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

  function render (constructor, props, target) {
    if (!target) {
      target = props
      props = null
    }
    return adapter.render(adapter.createElement(toReact(constructor), props), target)
  }

  function toReact (constructor) {
    if (recycle.getRootComponent()) {
      throw new Error('Root component already exists. toReact can be used once per recyle instance.')
    }
    return recycle.createComponent(constructor).getReactComponent()
  }

  return {
    getComponentStructure: recycle.getComponentStructure,
    getAllComponents: recycle.getAllComponents,
    toReact,
    render
  }
}
