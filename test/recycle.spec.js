/* global expect describe it document */
import {
  forceArray
} from '../src/recycle'


describe('recycle.spec.js', function () {
  describe('forceArray', () => {
    it('should always return an array', () => {
      const a = [1, 2, 3]
      expect(forceArray(a)).toBe(a)
      const b = 'notarr'
      expect(forceArray(b)).toEqual([b])
    })
  })
})
