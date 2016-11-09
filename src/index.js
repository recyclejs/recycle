import createRecycle from './recycle'

function memory(recycle) {
  const store = {}

  store.onUpdate((record, state) => {
    recycle.getAllComponents()
      .filter(c => c.get('record') === record)
      .map(c => c.setState(state))
  })

  recycle.on('componentUpdated', (component) => {
    const record = component.get('record')
    store.set(record, component.getState())
  })
}

export default (config) => {
  if (!config || !config.adapter) {
    throw new Error('Missing adapter property for creating Recycle instance')
  }
  const adapter = config.adapter
  const recycle = createRecycle({
    ...adapter,
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
    return class extends adapter.BaseComponent {
      render() {
        return jsx(constructor, this.props)
      }
    }
  }

  return {
    getComponentStructure: recycle.getComponentStructure,
    getAllComponents: recycle.getAllComponents,
    render,
    createReactComponent,
    createReactElement,
  }
}
