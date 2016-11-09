import createRecycle from './recycle'

export default (config) => {
  if (!config || !config.adapter) {
    throw new Error('Missing adapter property for creating Recycle instance')
  }

  const adapter = config.adapter
  const recycle = createRecycle({
    adapter: config.adapter,
    additionalSources: config.additionalSources,
  })

  if (config.middleware) {
    config.middleware.map(m => m(recycle))
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

  function createReactComponent(constructor, jsx) {
    return class extends adapter.BaseComponent {
      render() {
        return jsx(constructor, this.props)
      }
    }
  }

  return {
    getComponentStructure: recycle.getComponentStructure,
    getAllComponents: recycle.getAllComponents,
    createReactComponent,
    createReactElement,
    render,
  }
}
