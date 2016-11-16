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

  function createRootComponent (constructor) {
    return recycle.createComponent(constructor)
  }

  function render (constructor, props, target) {
    if (!target) {
      target = props
      props = null
    }
    const reactRootComponent = createRootComponent(constructor).getReactComponent()
    return adapter.render(adapter.createElement(reactRootComponent, props), target)
  }

  function toReact (constructor) {
    return class extends adapter.BaseComponent {
      render () {
        if (!recycle.getRootComponent()) {
          const reactRootComponent = createRootComponent(constructor).getReactComponent()
          return adapter.createElement(reactRootComponent, this.props)
        }
        const recycleComponent = recycle.getRootComponent().getByConstructor(constructor)
        recycle.getRootComponent().removeChild(recycleComponent)
        const jsx = recycle.getRootComponent().jsxHandler
        return jsx(constructor, ...this.props)
      }
    }
  }

  return {
    getComponentStructure: recycle.getComponentStructure,
    getAllComponents: recycle.getAllComponents,
    toReact,
    render,
    createRootComponent
  }
}
