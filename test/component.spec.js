import {expect} from 'chai'
import jsdom from 'mocha-jsdom'
import { createStateStream, prepareDomNode, getDomStream, updateDomStreams} from '../src/component'
import { Observable, makeSubject, mergeArray } from '../src/rxjs'
jsdom()

describe('Unit testing', function() {
  
  it('prepareDomNode() should create a subject', function() {
    let domSelectors = {}
    prepareDomNode(domSelectors, 'test', 'click')
    
    expect(domSelectors.test.click.observer !== undefined).to.equal(true);
    expect(domSelectors.test.click.stream !== undefined).to.equal(true);
  });

  it('getDomStream() should return previously created subject', function() {
    let domSelectors = {}
    prepareDomNode(domSelectors, 'test', 'click')
    let stream = getDomStream(domSelectors, 'test', 'click')

    expect(stream instanceof Observable).to.equal(true);
  });

  it('updateDomStreams() should call observer.next', function(done) {
    let domSelectors = {}
    prepareDomNode(domSelectors, 'test', 'click')
    domSelectors.test.click.observer.next = function() {
      done()
    }
    let el = document.createElement('div')
    updateDomStreams(domSelectors, el)
  });

  it('createStateStream() should create new state and notify', function(done) {
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
});
