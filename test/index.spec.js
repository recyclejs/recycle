/* global describe before after it document */
/* eslint import/no-extraneous-dependencies: "off" */
/* eslint func-names: "off" */

import { assert } from 'chai'
import jsdomify from 'jsdomify'
import createRecycle from '../src/index'
import reactRxjs from '../src/adapter/react-rxjs'

describe('index.spec.js', function () {
  describe('add additional sources', () => {
    before(function () {
      jsdomify.create()
    })

    after(function () {
      jsdomify.destroy()
    })

    it('should call observer.next', function (done) {
      const recycle = createRecycle({
        adapter: reactRxjs,
        additionalSources: {
          test: function () {
            return done()
          },
        },
      })

      recycle.render(function SingleCounterContainer() {
        return {
          actions: (sources) => {
            sources.test()
            return false
          },
        }
      }, document.createElement('div'))
    })
  })
});
