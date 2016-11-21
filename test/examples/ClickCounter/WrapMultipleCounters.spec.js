/* global describe expect it document */
import createRecycle from '../../../src/index'
import adapter from '../../../src/adapter/react-rxjs'
import WrapMultipleCounters from '../../../examples/ClickCounter/components/WrapMultipleCounters'

describe('WrapMultipleCounters example', function () {
  it('should change state on button click', function () {
    let el = document.createElement('div')
    let recycle = createRecycle({ adapter })
    var renderedComponent = recycle.render(WrapMultipleCounters, el)

    let buttonEl = el.querySelector('button')
    var evt = document.createEvent('HTMLEvents')
    evt.initEvent('click', false, true)

    buttonEl.dispatchEvent(evt)
    buttonEl.dispatchEvent(evt)

    expect(renderedComponent.state.recycleState.multiplechildButtonClicked).toBe(2)
  })
})
