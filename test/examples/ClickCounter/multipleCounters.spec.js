import {expect} from 'chai'
import jsdomify from 'jsdomify'
import createRecycle from '../../../src/index'
import MultipleCounters from '../../../examples/ClickCounter/MultipleCounters'

describe('MultipleCounters example', function() {

  before(function() {
    jsdomify.create()
  })

  after(function() {
    jsdomify.destroy()
  })

  it('should change state on button click', function() {
    let el = document.createElement('div')
    let recycle = createRecycle()
    var renderedComponent = recycle.render(MultipleCounters, el)
    
    let buttonEl = el.querySelector('button')
    var evt = document.createEvent("HTMLEvents");
    evt.initEvent("click", false, true);

    buttonEl.dispatchEvent(evt)
    buttonEl.dispatchEvent(evt)

    expect(renderedComponent.state.childButtonClicked).to.equal(2)
  });

});