import createRecycle from './recycle'

export default (config) => {
  if (!config || !config.adapter) {
    throw new Error('Missing adapter property for creating Recycle instance')
  }
  const adapter = config.adapter()
  const recycle = createRecycle({
    ...adapter,
    initialStoreState: (config.store) ? config.store.initialState : null,
    additionalSources: config.additionalSources,
  })

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
    return class extends adapter.Component {
      render() {
        return jsx(constructor, this.props)
      }
    }
  }

  return {
    getComponentStructure: recycle.getComponentStructure,
    render,
    createReactComponent,
    createReactElement,
  }
}
