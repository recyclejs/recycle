/* global expect describe it document */
import Recycle from '../../src/recycle'
import Rx from 'rxjs/Rx'
import React from 'react'
import {
  isReactComponent
} from '../../src/drivers/react'

describe('store.spec.js', function () {
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
})
