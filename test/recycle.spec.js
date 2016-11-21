/* global expect describe it document */

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

      expect(savedChildren.get(constructor1).key1).not.toBe(false)
      expect(() => registerComponent(component2, savedChildren))
        .toThrow('Could not register recycle component \'constructor1\'. Key \'key1\' is already in use.')
    })
  })

  describe('isReactComponent', () => {
    it('should check if component is created with react', function () {
      const reactComponent = React.createClass({
        render () {
          return null
        }
      })

      expect(isReactComponent(reactComponent)).toBe(true)
    })
  })

  describe('createReactElement', () => {
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
      expect(forceArray(a)).toBe(a)
      const b = 'notarr'
      expect(forceArray(b)).toEqual([b])
    })
  })

  describe('applyRecycleObservable', () => {
    const Observable = reactAdapter.Observable

    it('should add reducer and filterByType filters', () => {
      applyRecycleObservable(Observable)
      expect(typeof Observable.prototype.reducer).toBe('function')
      expect(typeof Observable.prototype.filterByType).toBe('function')
    })
  })

  describe('getComponentStructure', () => {
    it('should return component structure tree', () => {
      const recycle = Recycle({ adapter: reactAdapter })
      const rootComponent = recycle.createComponent(() => ({}))
      const tree = getComponentStructure(rootComponent)

      expect(typeof tree.component).toBe('object')
      expect(Array.isArray(tree.children)).toBe(true)
    })
  })

  describe('getAllComponents', () => {
    it('should return component structure tree', () => {
      const recycle = Recycle({ adapter: reactAdapter })
      const constructor = () => ({})
      const rootComponent = recycle.createComponent(constructor)
      const components = getAllComponents(rootComponent)

      expect(Array.isArray(components)).toBe(true)
      expect(components[0].getConstructor()).toBe(constructor)
    })
  })
})
