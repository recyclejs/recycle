/* global describe expect it document */
import createRecycle from '../../../src/index'
import adapter from '../../../src/adapter/react-rxjs'
import MultipleCounters from '../../../examples/ClickCounter/components/MultipleCounters'

describe('MultipleCounters example', function () {
  it('should change state on button click', function () {
    let el = document.createElement('div')
    let recycle = createRecycle({
      adapter,
      store: {
        initialState: 4
      }
    })
    var renderedComponent = recycle.render(MultipleCounters, el)

    let buttonEl = el.querySelector('button')
    var evt = document.createEvent('HTMLEvents')
    evt.initEvent('click', false, true)

    buttonEl.dispatchEvent(evt)
    buttonEl.dispatchEvent(evt)

    expect(renderedComponent.state.recycleState.childButtonClicked).toBe(2)
  })
})
