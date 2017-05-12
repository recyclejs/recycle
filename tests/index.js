// functional tests
/* global expect, it */
import recycle from '../src'
import React from 'react'
import {shallow} from 'enzyme'

it('should change label', () => {
  const CheckboxWithLabel = recycle({
    initialState: { isChecked: false },

    update (sources) {
      return [
        sources.select('input')
          .addListener('onChange')
          .reducer(function (state) {
            state.isChecked = !state.isChecked
            return state
          })
      ]
    },

    view (props, state) {
      return (
        <label>
          <input
            type='checkbox'
            checked={state.isChecked}
          />
          {state.isChecked ? props.labelOn : props.labelOff}
        </label>
      )
    }
  })

  const checkbox = shallow(
    <CheckboxWithLabel labelOn='On' labelOff='Off' />
  )

  expect(checkbox.text()).toEqual('Off')
  checkbox.find('input').simulate('change')
  expect(checkbox.text()).toEqual('On')
})

