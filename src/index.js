import createRecycle from './recycle'

export default (config) => {
  if (!config || !config.adapter) {
    throw new Error('Missing adapter property for creating Recycle instance')
  }

  const adapter = config.adapter
  const recycle = createRecycle({
    adapter: config.adapter,
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

  function createReactElement(constructor, props) {
    return adapter.createElement(recycle.createComponent(constructor).getReactComponent(), props)
  }

  function render(Component, props, target) {
    if (!target) {
      target = props
      props = null
    }
    return adapter.render(createReactElement(Component, props), target)
  }

  function toReact(constructor, jsx) {
    return class extends adapter.BaseComponent {
      render() {
        if (!jsx) {
          if (!recycle.getRootComponent()) {
            return createReactElement(constructor, this.props)
          }
          jsx = recycle.getRootComponent().jsxHandler
        }
        return jsx(constructor, this.props)
      }
    }
  }

  return {
    getComponentStructure: recycle.getComponentStructure,
    getAllComponents: recycle.getAllComponents,
    toReact,
    createReactElement,
    render,
  }
}
