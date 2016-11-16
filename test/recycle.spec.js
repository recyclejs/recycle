/* global describe before after it document */

import { assert } from 'chai'
import jsdomify from 'jsdomify'
import React from 'react'
import ReactDOM from 'react-dom'
import reactAdapter from '../src/adapter/react-rxjs'
import Recycle, {
  registerComponent,
  getAllComponents,
  getComponentStructure,
  createReactElement,
  isReactComponent,
  forceArray,
  applyRecycleObservable
} from '../src/recycle'

describe('recycle.spec.js', function () {
  describe('registerComponent', () => {
    it('should add new component in map', function () {
      const recycle = Recycle({ adapter: reactAdapter })
      const savedChildren = new Map()
      const constructor1 = function () { return {} }

      const rootComponent = recycle.createComponent(constructor1)
      const component1 = recycle.createComponent(constructor1, { key: 'key1' }, rootComponent)
      const component2 = recycle.createComponent(constructor1, { key: 'key1' }, rootComponent)

      registerComponent(component1, savedChildren)

      assert(savedChildren.get(constructor1).key1 !== false, 'component should have key')
      assert.throws(
        () => registerComponent(component2, savedChildren),
        'Could not register recycle component \'constructor1\'. Key \'key1\' is already in use.'
      )
    })
  })

  describe('isReactComponent', () => {
    it('should check if component is created with react', function () {
      const reactComponent = React.createClass({
        render () {
          return null
        }
      })

      assert(isReactComponent(reactComponent), 'not recognized as react component')
    })
  })

  describe('createReactElement', () => {
    before(function () {
      jsdomify.create()
    })

    after(function () {
      jsdomify.destroy()
    })

    it('should pass jsx as property in react render method', function (done) {
      const reactComponent = React.createClass({
        render (jsx) {
          jsx()
          return null
        }
      })

      const getArgs = function () {
        return arguments
      }

      const jsx = function () {
        done()
      }

      ReactDOM.render(
        createReactElement(React.createElement, getArgs(reactComponent), jsx),
        document.createElement('div')
      )
    })
  })

  describe('forceArray', () => {
    it('should always return an array', () => {
      const a = [1, 2, 3]
      assert(forceArray(a) === a, 'arrays not equal')
      const b = 'notarr'
      assert.deepEqual(forceArray(b), [b])
    })
  })

  describe('applyRecycleObservable', () => {
    const Observable = reactAdapter.Observable

    it('should add reducer and filterByType filters', () => {
      applyRecycleObservable(Observable)
      assert(typeof Observable.prototype.reducer === 'function', 'Observable.reducer not a function')
      assert(typeof Observable.prototype.filterByType === 'function', 'Observable.filterByType not a function')
    })
  })

  describe('getComponentStructure', () => {
    it('should return component structure tree', () => {
      const recycle = Recycle({ adapter: reactAdapter })
      const rootComponent = recycle.createComponent(() => ({}))
      const tree = getComponentStructure(rootComponent)

      assert(typeof tree.component === 'object', 'tree.component not an object')
      assert(Array.isArray(tree.children), 'tree.children not an array')
    })
  })

  describe('getAllComponents', () => {
    it('should return component structure tree', () => {
      const recycle = Recycle({ adapter: reactAdapter })
      const constructor = () => ({})
      const rootComponent = recycle.createComponent(constructor)
      const components = getAllComponents(rootComponent)

      assert(Array.isArray(components), 'returned components not an array')
      assert(components[0].getConstructor() === constructor, 'constructors doesnt match')
    })
  })
})
