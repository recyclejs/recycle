/* global describe it expect */
import { ENTER_KEY, ESC_KEY } from '../../utils'
import actions from './actions'
import { inspectObservable } from '../../../../src/testutils'

describe('TodoMVC actions', function () {
  const on = inspectObservable(actions)

  it('should dispatch toggleTodo', function () {
    return on.childrenActions({type: 'toggle', id: 1})
      .then(res => expect(res).toEqual({type: 'toggleTodo', id: 1}))
  })

  it('should dispatch deleteTodo', function () {
    return on.childrenActions({type: 'destroy', id: 1})
      .then(res => expect(res).toEqual({type: 'deleteTodo', id: 1}))
  })

  it('should dispatch editTodo', function () {
    return on.childrenActions({type: 'titleChanged', title: 'sometitle', id: 1})
      .then(res => expect(res).toEqual({type: 'editTodo', id: 1, title: 'sometitle'}))
  })

  it('should dispatch inputVal', function () {
    return on.DOM('.new-todo', 'input', 'a')
      .then(result => expect(result).toEqual({ type: 'inputVal', payload: 'a' }))
  })

  it('should dispatch insertTodo', function () {
    return on.DOM('.new-todo', 'keydown', {target: {value: 'hello'}, keyCode: ENTER_KEY})
      .then(result => expect(result).toEqual({ type: 'insertTodo', payload: 'hello' }))
  })

  it('should dispatch empty inputVal', function () {
    return on.actions({type: 'insertTodo'})
      .then(res => expect(res).toEqual({type: 'inputVal', payload: ''}))
  })

  it('should dispatch empty inputVal', function () {
    return on.DOM('.new-todo', 'keydown', {keyCode: ESC_KEY})
      .then(result => expect(result).toEqual({ type: 'inputVal', payload: '' }))
  })

  it('should dispatch toggleAll', function () {
    return on.DOM('.toggle-all', 'click')
      .then(result => expect(result).toEqual({ type: 'toggleAll' }))
  })

  it('should dispatch deleteCompleted', function () {
    return on.DOM('.clear-completed', 'click')
      .then(result => expect(result).toEqual({ type: 'deleteCompleted' }))
  })
})
