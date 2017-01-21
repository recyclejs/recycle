/* global describe it expect */
import React from 'react'
import TodoList from './index'
import Todo from '../Todo'
import renderer from 'react-test-renderer'
import { ENTER_KEY } from '../../utils'
import { inspectObservable, applyReducer } from 'recyclejs/testutils'

describe('TodoList Reducers', function () {
  const on = inspectObservable(TodoList().reducers)

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

    return on.select(Todo, 'titleChanged', {type: 'titleChanged', id: 1, title: 'sometitle'})
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

    return on.select(Todo, 'toggle', { type: 'toggle', id: 2 })
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

    return on.selectClass('toggle-all', 'click')
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

    return on.select(Todo, 'destroy', { type: 'destroy', id: 1 })
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

    return on.selectClass('clear-completed', 'click')
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
      ],
      inputVal: ''
    }

    return on.selectClass('new-todo', 'keyDown', {target: {value: 'second'}, keyCode: ENTER_KEY})
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

    return on.selectClass('new-todo', 'change', {target: {value: 'hello'}})
      .then(res => applyReducer(res, initialState))
      .then(state => expect(state).toEqual(nextState))
  })
})

describe('TodoList View', function () {
  it('should have correct structure', function () {
    const props = { route: {filter: ''} }
    const state = { list: [] }
    const component = renderer.create(TodoList().view(props, state))

    const expected = renderer.create(
      <div className='todoapp'>
        <header className='header'>
          <h1>todos</h1>
          <input
            className='new-todo'
            type='text'
            value={state.inputVal}
            placeholder='What needs to be done?'
            name='newTodo' />
        </header>

        <section className='main' style={{ 'display': 'none' }}>
          <input className='toggle-all' type='checkbox' defaultChecked={true} />
          <ul className='todo-list'>
          </ul>
        </section>

        <footer className='footer' style={{ 'display': 'none' }}>
          <span className='todo-count'>
            <strong>{0}</strong>
            <span> items left</span>
          </span>
          <ul className='filters'>
            <li><a href='#/' className={'selected'}>All</a></li>
            <li><a href='#/active' className={''}>Active</a></li>
            <li><a href='#/completed' className={''}>Completed</a></li>
          </ul>
          {''}
        </footer>
      </div>
    )

    expect(component.toJSON()).toEqual(expected.toJSON())
  })
})
