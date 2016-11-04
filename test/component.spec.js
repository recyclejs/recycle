import {expect} from 'chai'
import jsdomify from 'jsdomify'

describe('component.js unit tests', function() {

  describe('prepareDomNode', () => {

    let prepareDomNode = require('../src/component').prepareDomNode
    let Observable = require('../src/rxjs').Observable

    it('should create a subject', function() {
      let domSelectors = {}
      prepareDomNode(domSelectors, 'test', 'click')
      
      expect(domSelectors.test.click.observer !== undefined).to.equal(true);
      expect(domSelectors.test.click.stream !== undefined).to.equal(true);
    })
    
  })

  describe('getDomStream', () => {

    let prepareDomNode = require('../src/component').prepareDomNode
    let getDomStream = require('../src/component').getDomStream
    let Observable = require('../src/rxjs').Observable

    it('should return previously created subject', function() {
      let domSelectors = {}
      prepareDomNode(domSelectors, 'test', 'click')
      let stream = getDomStream(domSelectors, 'test', 'click')

      expect(stream instanceof Observable).to.equal(true);
    })
    
  })

  describe('updateDomStreams', () => {
    before(function() {
      jsdomify.create()
    })

    after(function() {
      jsdomify.destroy()
    })

    let prepareDomNode = require('../src/component').prepareDomNode
    let updateDomStreams = require('../src/component').updateDomStreams

    it('should call observer.next', function(done) {
      let domSelectors = {}
      prepareDomNode(domSelectors, 'test', 'click')
      domSelectors.test.click.observer.next = function() {
        done()
      }
      let el = document.createElement('div')
      updateDomStreams(domSelectors, el)
    }) 
  })

  describe('createStateStream', () => {

    let makeSubject = require('../src/rxjs').makeSubject
    let createStateStream = require('../src/component').createStateStream

    it('should create new state and notify', function(done) {
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
    })
  })

  describe('createActionsStream', () => {

    let makeSubject = require('../src/rxjs').makeSubject
    let createActionsStream = require('../src/component').createActionsStream

    it('should create action stream and filter null values', function(done) {
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
    })
  })

  describe('getChild', () => {

    let getChild = require('../src/component').getChild

    it('should retrive object from map', function() {
      let map = new Map()
      let fn1 = function() {}
      let fn2 = function() {}

      let obj1 = {
        key1: 1
      }
      
      map.set(fn1, obj1)

      expect(getChild(fn1, 'key1', map)).to.equal(1)
      expect(getChild(fn2, 'key1', map)).to.equal(false)
    })
  })
  
  describe('registerComponent', () => {

    let recycleComponent = require('../src/component').default
    let registerComponent = require('../src/component').registerComponent
    let getChild = require('../src/component').getChild

    it('should add new component in map', function() {
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
    })
  })
  
  describe('isReactComponent', () => {

    let React = require('../src/index').React
    let isReactComponent = require('../src/component').isReactComponent

    it('should check if component is created with react', function() {
      let reactComponent = React.createClass({
        render() {} 
      })
      
      expect(isReactComponent(reactComponent)).to.equal(true)
    })
  })

  describe('createReactElement', () => {

    before(function() {
      jsdomify.create()
    })

    after(function() {
      jsdomify.destroy()
    })

    let React = require('../src/index').React
    let ReactDOM = require('../src/index').ReactDOM
    let createReactElement = require('../src/component').createReactElement

    it('should pass jsx as property in react render method', function(done) {
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
    })
  })
  
  describe('mergeChildrenActions', () => {

    before(function() {
      jsdomify.create()
    })

    after(function() {
      jsdomify.destroy()
    })

    let React = require('../src/index').React
    let ReactDOM = require('../src/index').ReactDOM
    let recycleComponent = require('../src/component').default
    let mergeChildrenActions = require('../src/component').mergeChildrenActions
    let makeSubject = require('../src/rxjs').makeSubject
    it('should return action created by recycle component', function(done) {

      const subj = makeSubject()

      let component = function() {
        return {
          actions: function() {
            return subj.stream
          },
          view: () => {
            return null
          }
        }
      }
      let rc = recycleComponent(component)

      ReactDOM.render(
        React.createElement(rc.getReactComponent(), null), 
        document.createElement('div')
      )

      let merged$ = mergeChildrenActions([rc])

      rc.getActions().subscribe(function(action) {
        expect(action.type).to.equal('testActions')
        done()
      })

      subj.observer.next()
      subj.observer.next({type: 'testActions'})
    })
  })

  describe('generateSources', () => {

    before(function() {
      jsdomify.create()
    })

    after(function() {
      jsdomify.destroy()
    })

    let makeSubject = require('../src/rxjs').makeSubject
    let Observable = require('../src/rxjs').Observable
    let generateSources = require('../src/component').generateSources

    it('generateSources should return component sources', function() {
      let childActions$ = makeSubject().stream
      let componentLifecycle$ = makeSubject().stream

      let sources = generateSources({}, childActions$, componentLifecycle$)
      
      expect(typeof sources.DOM).to.equal('function')
      expect(sources.componentLifecycle instanceof Observable).to.equal(true)
      expect(sources.childrenActions instanceof Observable).to.equal(true)
      expect(sources.actions instanceof Observable).to.equal(true)
    })
  })
  
});
