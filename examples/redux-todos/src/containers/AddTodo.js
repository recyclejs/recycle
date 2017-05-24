import React from 'react'
import recycle, { registerReducer } from 'recycle'
import { addTodo } from '../actions'

const AddTodo = recycle({
  initialState: {
    inputVal: ''
  },

  dispatch (sources) {
    return [
      sources.select('form')
        .addListener('onSubmit')
        .withLatestFrom(sources.state)
        .map(([e, state]) => addTodo(state.inputVal))
    ]
  },

  update (sources) {
    return [
      sources.select('input')
        .addListener('onChange')
        .let(registerReducer((state, e) => {
          state.inputVal = e.target.value
          return state
        })),

      sources.select('form')
        .addListener('onSubmit')
        .let(registerReducer((state, e) => {
          e.preventDefault()
          state.inputVal = ''
          return state
        }))
    ]
  },

  view (props, state) {
    return (
      <div>
        <form>
          <input value={state.inputVal} />
          <button type='submit'>
            Add Todo
          </button>
        </form>
      </div>
    )
  }
})

export default AddTodo
