/* global expect, it */
import shallowClone from './shallowClone'

it('should create shallow clone', () => {
  let a = {
    firstLevel: 1
  }
  let b = {
    firstLevel: 2,
    second: a
  }
  let c = shallowClone(b)

  expect(c).not.toBe(b)
  expect(c.second).toBe(b.second)
})

