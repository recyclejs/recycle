import React, { PropTypes } from 'react'
import classnames from 'classnames'
import { TEXT_INPUT } from '../../constants/Selectors'

export default function TodoTextInput(props) {
  return {
    propTypes: {
      text: PropTypes.string,
      placeholder: PropTypes.string,
      editing: PropTypes.bool,
      newTodo: PropTypes.bool
    },

    initialState: {
      text: props.text || ''
    },

    actions (sources) {
      return [
        sources.select(TEXT_INPUT)
          .on('keydown')
          .filter(a => a.event.which === 13)
          .filter(a => a.value.length !== 0),

        sources.select(TEXT_INPUT)
          .on('blur')
          .filter(() => !props.newTodo)
          .filter(a => a.value.length !== 0)
      ]
    },

    reducers (sources) {
      return [
        sources.select(TEXT_INPUT)
          .events('input')
          .reducer((state, e) => {
            state.text = e.target.value
            return state
          }),

        sources.actions
          .filterByType(TEXT_INPUT)
          .filter(() => props.newTodo)
          .reducer(state => {
            state.text = ''
            return state
          })
      ]
    },

    view (props, state) {
      return (
        <input recycle={TEXT_INPUT}
          className={
            classnames({
              edit: props.editing,
              'new-todo': props.newTodo
            })
          }
          value={state.text}
          type="text"
          placeholder={props.placeholder}
          autoFocus="true" />
      )
    }
  }
}
