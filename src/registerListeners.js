const registerListeners = Rx => (listeners, selectorType) => selector => ({
  addListener: event => {
    let ref = listeners
      .filter(ref => ref.selector === selector)
      .filter(ref => ref.selectorType === selectorType)
      .filter(ref => ref.event === event)[0]

    if (!ref) {
      ref = {
        selector,
        selectorType,
        event,
        stream: new Rx.Subject()
      }
      listeners.push(ref)
    }

    return ref.stream.switch()
  }
})

export default registerListeners
