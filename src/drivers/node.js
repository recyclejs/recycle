export default (recycle, Rx) => {
  let timeout = null
  recycle.on('sourcesReady', (component) => {
    clearTimeout(timeout)
    const children = component.get('children')
    if (children) {
      children.forEach(child => {
        recycle.createComponent(child, null, component)
      })
    }
    component.updateChildrenActions()
  })

  timeout = setTimeout(function () {
    recycle.emit('componentsInitalized')
  }, 0)

  return {
    name: 'node'
  }
}
