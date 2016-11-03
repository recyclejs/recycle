import {expect} from 'chai'
import jsdom from 'mocha-jsdom'
import { React, ReactDOM } from '../src/index'
import { Observable, makeSubject } from '../src/rxjs'
import recycleComponent, { 
  createStateStream, 
  prepareDomNode, 
  getDomStream, 
  updateDomStreams,
  createActionsStream,
  getChild,
  registerComponent,
  isReactComponent,
  createReactElement,
} from '../src/component'

jsdom()

describe('Unit testing', function() {

  it('prepareDomNode should create a subject', function() {
    let domSelectors = {}
    prepareDomNode(domSelectors, 'test', 'click')
    
    expect(domSelectors.test.click.observer !== undefined).to.equal(true);
    expect(domSelectors.test.click.stream !== undefined).to.equal(true);
  });

  it('getDomStream should return previously created subject', function() {
    let domSelectors = {}
    prepareDomNode(domSelectors, 'test', 'click')
    let stream = getDomStream(domSelectors, 'test', 'click')

    expect(stream instanceof Observable).to.equal(true);
  });

  it('updateDomStreams should call observer.next', function(done) {
    let domSelectors = {}
    prepareDomNode(domSelectors, 'test', 'click')
    domSelectors.test.click.observer.next = function() {
      done()
    }
    let el = document.createElement('div')
    updateDomStreams(domSelectors, el)
  });

  it('createStateStream should create new state and notify', function(done) {
    const subj = makeSubject()

    const reducers = [
      subj.stream
        .reducer(function(state) {
          state.test = true;
          return state
        })
    ]

    let initialState = { test: false }

    let notify = function(action) {
      expect(action.type).to.equal('willCallReducer')
    }

    const state$ = createStateStream(reducers, initialState, notify)

    state$.subscribe(function(state) {
      if (state.test == true)
        done()
    })

    subj.observer.next()
  });

  it('createActionsStream should create action stream and filter null values', function(done) {
    const subj = makeSubject()

    const actions = [
      subj.stream,
      subj.stream.mapTo(false)
    ]

    const actions$ = createActionsStream(actions)

    actions$.subscribe(function(action) {
      expect(action.type).to.equal('testActions')
      done()
    })

    subj.observer.next()
    subj.observer.next({type: 'testActions'})
  });

  it('getChild should retrive object from map', function() {
    let map = new Map()
    let fn1 = function() {}
    let fn2 = function() {}

    let obj1 = {
      key1: 1
    }
    
    map.set(fn1, obj1)

    expect(getChild(fn1, 'key1', map)).to.equal(1)
    expect(getChild(fn2, 'key1', map)).to.equal(false)
  });
  
  it('registerComponent should add new component in map', function() {
    let savedChildren = new Map()

    let constructor1 = function(){ return {} }
    let constructor2 = function(){ return {} }

    let component1 = recycleComponent(constructor1, 'key1')
    let component2 = recycleComponent(constructor1, 'key1')
    
    
    registerComponent(component1, savedChildren)

    expect(getChild(constructor1, 'key1', savedChildren) !== false)
      .to.equal(true)

    expect(function() {
      registerComponent(component2, savedChildren)
    })
    .to.throw(`Could not register recycle component 'constructor1'. Key 'key1' is already in use.`)
  });

  it('isReactComponent should check if component is created with react', function() {
    let reactComponent = React.createClass({
      render() {} 
    })
    
    expect(isReactComponent(reactComponent)).to.equal(true)
  });
  
  it('createReactElement should pass jsx as property in react render method', function(done) {
    let reactComponent = React.createClass({
      render(jsx) {
        jsx()
        return null
      } 
    })

    let getArgs = function(constrctor, props) {
      return arguments
    }

    let jsx = function() {
      done()
    }

    ReactDOM.render(
      createReactElement(getArgs(reactComponent), jsx), 
      document.createElement('div')
    )
  });
});
