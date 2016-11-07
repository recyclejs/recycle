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

  function getComponentStructure() {
    function addInStructure(parent, component) {
      const current = {
        component,
        name: component.getName(),
        children: [],
      }
      if (parent.children) {
        parent.children.push(current)
      } else {
        structure = current
      }

      if (component.getChildren()) {
        component.getChildren().forEach((c) => {
          addInStructure(current, c)
        })
      }
    }

    let structure = {}
    addInStructure(structure, recycle.getRootComponent())
    return structure
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
    getComponentStructure,
    render,
    createReactClass,
    createReactElement,
  }
}
