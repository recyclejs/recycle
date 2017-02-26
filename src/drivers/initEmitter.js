export default (recycle, Rx) => {
  let timeout = null

  function emit () {
    timeout = setTimeout(function () {
      recycle.emit('componentsInitalized')
    }, 0)
  }

  recycle.on('sourcesReady', (component) => {
    clearTimeout(timeout)
    emit()
  })

  return {
    name: 'initEmitter'
  }
}
