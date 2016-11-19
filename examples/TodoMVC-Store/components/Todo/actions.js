import {ENTER_KEY, ESC_KEY} from '../../utils'

export default function actions (sources, getProp, getState) {
  const toggleCheckbox = sources.DOM.select('.toggle')
  const destroyIcon = sources.DOM.select('.destroy')
  const editInput = sources.DOM.select('.edit')
  const todoLabel = sources.DOM.select('label')

  return [
    destroyIcon
      .events('click')
      .mapTo({ type: 'destroy' }),

    toggleCheckbox
      .events('click')
      .mapTo({ type: 'toggle' }),

    editInput
      .events('keyup')
      .filter(ev => ev.keyCode === ENTER_KEY)
      .merge(editInput.events('blur', true))
      .map(() => ({ type: 'titleChanged', payload: getState('inputVal') })),

    todoLabel
      .events('dblclick')
      .mapTo({ type: 'startEdit' }),

    editInput
      .events('input')
      .map(ev => ({ type: 'inputVal', value: ev.target.value })),

    editInput
      .events('keyup')
      .filter(ev => ev.keyCode === ESC_KEY)
      .mapTo({ type: 'cancelEdit' }),

    sources.actions
      .filterByType('cancelEdit')
      .mapTo({ type: 'inputVal', value: getProp('title') }),

    sources.actions
      .filterByType('startEdit')
      .mapTo({ type: 'inputVal', value: getProp('title') })
  ]
}
