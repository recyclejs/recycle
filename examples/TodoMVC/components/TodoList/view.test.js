/* global describe it expect */
import React from 'react'
import view from './view'
import renderer from 'react-test-renderer'

describe('TodoMVC view', function () {
  it('should', function () {
    const props = { route: {filter: ''} }
    const state = { list: [] }
    const component = renderer.create(view(props, state))

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
