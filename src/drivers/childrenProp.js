export default (recycle, Rx) => {
  recycle.on('sourcesReady', (component) => {
    const children = component.get('children')
    if (children) {
      children.forEach(child => {
        recycle.createComponent(child, null, component)
      })
    }
    component.updateChildrenActions()
  })
}
