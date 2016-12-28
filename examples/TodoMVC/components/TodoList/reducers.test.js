/* global describe it expect */
import reducers from './reducers'
import { inspectObservable, applyReducer } from '../../../../src/testutils'

describe('TodoMVC reducers', function () {
  const on = inspectObservable(reducers)

  it('should change todo title', function () {
    const initialState = {
      list: [
        {id: 1, title: 'bla', completed: true}
      ]
    }

    const nextState = {
      list: [
        {id: 1, title: 'sometitle', completed: true}
      ]
    }

    return on.actions({type: 'editTodo', id: 1, title: 'sometitle'})
      .then(res => applyReducer(res, initialState))
      .then(state => expect(state).toEqual(nextState))
  })

  it('should toggle todo', function () {
    const initialState = {
      list: [
        {id: 1, title: 'first', completed: false},
        {id: 2, title: 'second', completed: false},
        {id: 3, title: 'third', completed: true}
      ]
    }

    const nextState = {
      list: [
        {id: 1, title: 'first', completed: false},
        {id: 2, title: 'second', completed: true},
        {id: 3, title: 'third', completed: true}
      ]
    }

    return on.actions({ type: 'toggleTodo', id: 2 })
      .then(res => applyReducer(res, initialState))
      .then(state => expect(state).toEqual(nextState))
  })

  it('should toggle all todos', function () {
    const initialState = {
      list: [
        {id: 1, title: 'first', completed: false},
        {id: 2, title: 'second', completed: false},
        {id: 3, title: 'third', completed: true}
      ]
    }

    const nextState = {
      list: [
        {id: 1, title: 'first', completed: true},
        {id: 2, title: 'second', completed: true},
        {id: 3, title: 'third', completed: true}
      ]
    }

    return on.actions({ type: 'toggleAll' })
      .then(res => applyReducer(res, initialState))
      .then(state => expect(state).toEqual(nextState))
  })

  it('should delete todo', function () {
    const initialState = {
      list: [
        {id: 1, title: 'first', completed: false},
        {id: 2, title: 'second', completed: false},
        {id: 3, title: 'third', completed: true}
      ]
    }

    const nextState = {
      list: [
        {id: 2, title: 'second', completed: false},
        {id: 3, title: 'third', completed: true}
      ]
    }

    return on.actions({ type: 'deleteTodo', id: 1 })
      .then(res => applyReducer(res, initialState))
      .then(state => expect(state).toEqual(nextState))
  })

  it('should delete completed todos', function () {
    const initialState = {
      list: [
        {id: 1, title: 'first', completed: false},
        {id: 2, title: 'second', completed: true},
        {id: 3, title: 'third', completed: true}
      ]
    }

    const nextState = {
      list: [
        {id: 1, title: 'first', completed: false}
      ]
    }

    return on.actions({ type: 'deleteCompleted' })
      .then(res => applyReducer(res, initialState))
      .then(state => expect(state).toEqual(nextState))
  })

  it('should insert todo', function () {
    const initialState = {
      list: [
        {id: 1, title: 'first', completed: false}
      ]
    }

    const nextState = {
      list: [
        {id: 1, title: 'first', completed: false},
        {id: 2, title: 'second', completed: false}
      ]
    }

    return on.actions({ type: 'insertTodo', payload: 'second' })
      .then(res => applyReducer(res, initialState))
      .then(state => expect(state).toEqual(nextState))
  })

  it('should change inputVal', function () {
    const initialState = {
      inputVal: 'hell'
    }

    const nextState = {
      inputVal: 'hello'
    }

    return on.actions({type: 'inputVal', payload: 'hello'})
      .then(res => applyReducer(res, initialState))
      .then(state => expect(state).toEqual(nextState))
  })
})
