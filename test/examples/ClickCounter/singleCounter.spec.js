import {expect} from 'chai'
import jsdomify from 'jsdomify'
import createRecycle from '../../../src/index'
import reactAdapter from '../../../src/adapter/react-rxjs'
import SingleCounter from '../../../examples/ClickCounter/SingleCounter'

describe('SingleCounter example', function() {

  before(function() {
    jsdomify.create()
  })

  after(function() {
    jsdomify.destroy()
  })

  it('should change state on button click', function() {
    let el = document.createElement('div')
    let recycle = createRecycle({
      adapter: reactAdapter
    })
    
    recycle.render(SingleCounter, el)
    
    let buttonEl = el.querySelector('button')
    var evt = document.createEvent("HTMLEvents");
    evt.initEvent("click", false, true);

    buttonEl.dispatchEvent(evt)
    buttonEl.dispatchEvent(evt)

    let structure = recycle.getComponentStructure()
    expect(structure.children[0].component.getState().timesClicked).to.equal(2)

  });

});