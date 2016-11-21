/* global describe expect it document */
import createRecycle from '../../../src/index'
import adapter from '../../../src/adapter/react-rxjs'
import CounterWithReact from '../../../examples/CombiningWithReact/components/CounterWithReact'

describe('CounterWithReact example', function () {
  it('should change state on button click', function () {
    let el = document.createElement('div')
    let recycle = createRecycle({ adapter })
    var renderedComponent = recycle.render(CounterWithReact, el)

    let buttonEl = el.querySelector('button')
    var evt = document.createEvent('HTMLEvents')
    evt.initEvent('click', false, true)

    buttonEl.dispatchEvent(evt)
    buttonEl.dispatchEvent(evt)

    expect(renderedComponent.state.recycleState.timesClicked).toBe(2)
  })
})
