import createRecycle from './recycle'

export default (config) => {
  if (!config || !config.adapter) {
    throw new Error('Missing adapter property for creating Recycle instance')
  }
  const adapter = config.adapter()
  const recycle = createRecycle({
    ...adapter,
    initialStoreState: (config.store) ? config.store.initialState : null,
    storeReducers: (config.store) ? config.store.reducers : null,
    additionalSources: (config.store) ? config.additionalSources : null,
  })

  function createReactElement(constructor, props) {
    return adapter.createElement(recycle.createComponent(constructor).getReactComponent(), props)
  }

  function render(Component, target) {
    return adapter.render(createReactElement(Component), target)
  }

  let key = 0
  function createReactClass(constructor, jsx) {
    return adapter.createClass({
      render() {
        key++
        const props = Object.assign({}, { key }, this.props)
        return jsx(constructor, props)
      },
    })
  }

  return {
    getComponentStructure: recycle.getComponentStructure,
    render,
    createReactClass,
    createReactElement,
  }
}
