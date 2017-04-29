import getNodeSelectors from './getNodeSelectors'

const customCreateElement = Rx => (listeners, nodeStreams, originalCreateElement) => function () {
  const possibleSelectors = getNodeSelectors(arguments['0'], arguments['1'])

  possibleSelectors.forEach(({ selectorType, selector }) => {
    listeners
      .filter(ref => ref.selector === selector)
      .filter(ref => ref.selectorType === selectorType)
      .forEach(registredRef => {
        let ref = {
          selector,
          selectorType,
          event: registredRef.event
        }
        if (!arguments['1']) {
          arguments['1'] = {}
        }
        if (typeof arguments['1'][ref.event] === 'function') {
          ref.stream = new Rx.Subject()
          let customFunction = arguments['1'][ref.event]
          arguments['1'][ref.event] = function () {
            let event = customFunction.apply(this, arguments)
            ref.stream.next(event)
          }
        } else {
          ref.stream = new Rx.Subject()
          arguments['1'][ref.event] = function () {
            let event = arguments['0']
            ref.stream.next(event)
          }
        }
        nodeStreams.push(ref)
      })
  })

  return originalCreateElement.apply(this, arguments)
}

export default customCreateElement
