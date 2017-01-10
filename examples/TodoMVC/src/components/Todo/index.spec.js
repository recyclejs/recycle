/* global describe it expect */
import TodoItem from './index'
import { inspectObservable, applyReducer } from '../../../../src/testutils'
import { ENTER_KEY, ESC_KEY } from '../../utils'

describe('TodoItem Actions', function () {
  const on = inspectObservable(TodoItem().actions)

  it('should dispatch destroy', function () {
    on.props({ id: 1 })

    return on.select('destroy', 'click')
      .then(res => expect(res).toEqual({ type: 'destroy', id: 1 }))
  })

  it('should dispatch toggle', function () {
    on.props({ id: 2 })

    return on.select('toggle', 'change')
      .then(res => expect(res).toEqual({ type: 'toggle', id: 2 }))
  })

  it('should dispatch titleChanged on enter', function () {
    on.props({ id: 3 })
    on.state({ inputVal: 'Changed' })

    return on.select('edit', 'keyup', {keyCode: ENTER_KEY})
      .then(result => expect(result).toEqual({ type: 'titleChanged', id: 3, title: 'Changed' }))
  })

  it('should dispatch titleChanged on blur', function () {
    on.props({ id: 3 })
    on.state({ inputVal: 'Changed' })

    return on.select('edit', 'blur')
      .then(result => expect(result).toEqual({ type: 'titleChanged', id: 3, title: 'Changed' }))
  })
})

describe('TodoItem Reducers', function () {
  const on = inspectObservable(TodoItem().reducers)

  it('should change inputVal', function () {
    const initialState = {
      editing: true,
      inputVal: 'initial title'
    }

    const nextState = {
      editing: true,
      inputVal: 'something'
    }

    return on.select('edit', 'input', 'something')
      .then(res => applyReducer(res, initialState))
      .then(state => expect(state).toEqual(nextState))
  })

  it('should finish editing ', function () {
    const initialState = {
      editing: true
    }

    const nextState = {
      editing: false
    }

    return on.actions({ type: 'titleChanged' })
      .then(res => applyReducer(res, initialState))
      .then(state => expect(state).toEqual(nextState))
  })

  it('should set in editing mode', function () {
    on.props({ title: 'todo item' })

    const initialState = {
      editing: false,
      inputVal: ''
    }

    const nextState = {
      editing: true,
      inputVal: 'todo item'
    }

    return on.select('label', 'dblclick')
      .then(res => applyReducer(res, initialState))
      .then(state => expect(state).toEqual(nextState))
  })

  it('should cancel editing mode', function () {
    on.props({ title: 'initial title' })

    const initialState = {
      editing: true,
      inputVal: 'new title'
    }

    const nextState = {
      editing: false,
      inputVal: 'initial title'
    }

    return on.select('edit', 'keyup', { keyCode: ESC_KEY })
      .then(res => applyReducer(res, initialState))
      .then(state => expect(state).toEqual(nextState))
  })
})
