/* global expect, it */
import forceArray from './forceArray'

it('should return an array', () => {
  expect(forceArray(1)).toBeInstanceOf(Array)
})

it('should return an array', () => {
  expect(forceArray([1, 2, 3])).toBeInstanceOf(Array)
})
