/* global describe before after it document */
import {expect} from 'chai'
import jsdomify from 'jsdomify'
import createRecycle from '../../../src/index'
import reactAdapter from '../../../src/adapter/react-rxjs'
import CounterWithReact from '../../../examples/CombiningWithReact/CounterWithReact'

describe('CounterWithReact example', function () {
  before(function () {
    jsdomify.create()
  })

  after(function () {
    jsdomify.destroy()
  })

  it('should change state on button click', function () {
    let el = document.createElement('div')
    let recycle = createRecycle({
      adapter: reactAdapter
    })
    var renderedComponent = recycle.render(CounterWithReact, el)

    let buttonEl = el.querySelector('button')
    var evt = document.createEvent('HTMLEvents')
    evt.initEvent('click', false, true)

    buttonEl.dispatchEvent(evt)
    buttonEl.dispatchEvent(evt)

    expect(renderedComponent.state.recycleState.timesClicked).to.equal(2)
  })
})
