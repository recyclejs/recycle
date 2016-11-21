/* global describe expect it document */
import createRecycle from '../../../src/index'
import adapter from '../../../src/adapter/react-rxjs'
import SingleCounter from '../../../examples/ClickCounter/components/SingleCounter'

describe('SingleCounter example', function () {
  it('should change state on button click', function () {
    let el = document.createElement('div')
    let recycle = createRecycle({ adapter })

    recycle.render(SingleCounter, el)

    let buttonEl = el.querySelector('button')
    var evt = document.createEvent('HTMLEvents')
    evt.initEvent('click', false, true)

    buttonEl.dispatchEvent(evt)
    buttonEl.dispatchEvent(evt)

    let structure = recycle.getComponentStructure()
    expect(structure.component.getState().timesClicked).toBe(2)
  })
})
