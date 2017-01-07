/* global expect describe it document */

import {
  getByPath,
  setByPath,
  deleteByPath,
  parsePath
} from '../../src/plugins/redux'

describe('store.spec.js', function () {
  describe('getByPath', () => {
    it('should get object by path', function () {
      const source = {
        prop: 1,
        some: {
          prop: 2,
          obj: {
            with: [{ array: true }]
          }
        }
      }

      expect(getByPath([''], source)).toEqual(source)
      expect(getByPath(['prop'], source)).toBe(1)
      expect(getByPath(['some', 'prop'], source)).toBe(2)
      expect(getByPath(['some', 'obj', 'with'], source)).toEqual([{ array: true }])
      expect(getByPath(['some', 'obj', 'with', 0], source)).toEqual({ array: true })
      expect(getByPath(['some', 'obj', 'with', 0, 'array'], source)).toBe(true)
    })
  })

  describe('deleteByPath', () => {
    it('should delete property by path', function () {
      const source = {
        prop: 1,
        some: {
          prop: 2,
          obj: {
            with: [{ first: true }, { second: true }]
          }
        }
      }
      deleteByPath(['some', 'obj', 'with'], source)
      expect(source).toEqual({ prop: 1, some: { prop: 2, obj: { } } })
      deleteByPath(['some', 'obj'], source)
      expect(source).toEqual({ prop: 1, some: { prop: 2 } })
      deleteByPath(['some'], source)
      expect(source).toEqual({ prop: 1 })
    })
  })

  describe('setByPath', () => {
    it('should set object by path', function () {
      const source = {}
      setByPath(['prop'], 1, source)
      expect(source.prop).toBe(1)

      setByPath(['prop2', 'not', 'defined'], 2, source)
      expect(source.prop2.not.defined).toBe(2)
    })
  })

  describe('parsePath', () => {
    it('should convert string to array', function () {
      expect(parsePath('todos.list')).toEqual(['todos', 'list'])
      expect(parsePath('todos.list[1]')).toEqual(['todos', 'list', '1'])
    })
  })
})
