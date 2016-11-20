import createRecycle from './recycle'

export default (config) => {
  if (!config || !config.adapter) {
    throw new Error('Missing adapter property for creating Recycle instance')
  }

  const adapter = config.adapter
  const recycle = createRecycle({
    adapter: config.adapter
  })

  const middlewares = {}
  recycle.getMiddleware = name => middlewares[name]

  if (config.middleware) {
    config.middleware.map((m) => {
      const instance = m(recycle, adapter)
      middlewares[instance.name] = instance
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
