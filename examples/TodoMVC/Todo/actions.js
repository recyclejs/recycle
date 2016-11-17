import {ENTER_KEY, ESC_KEY} from '../utils'

function actions (sources, getProp, getState) {
  const toggleCheckbox = sources.DOM.select('.toggle')
  const destroyIcon = sources.DOM.select('.destroy')
  const editInput = sources.DOM.select('.edit')
  const todoLabel = sources.DOM.select('label')

  return [
    destroyIcon
      .events('click')
      .map(() => ({ type: 'destroy', id: getProp('id') })),

    toggleCheckbox
      .events('click')
      .map(() => ({ type: 'toggle', id: getProp('id') })),

    todoLabel
      .events('dblclick')
      .map(() => ({ type: 'startEdit', id: getProp('id') })),

    editInput
      .events('keyup')
      .filter(ev => ev.keyCode === ENTER_KEY)
      .merge(editInput.events('blur', true))
      .map(() => ({ type: 'titleChanged', id: getProp('id'), title: getState('inputVal') })),

    editInput
      .events('input')
      .map(ev => ({ type: 'inputVal', value: ev.target.value })),

    editInput
      .events('keyup')
      .filter(ev => ev.keyCode === ESC_KEY)
      .map(() => ({ type: 'cancelEdit' })),

    sources.actions
      .filterByType('cancelEdit')
      .map(() => ({ type: 'inputVal', value: getProp('title') })),

    sources.actions
      .filterByType('startEdit')
      .map(() => ({ type: 'inputVal', value: getProp('title') }))
  ]
}

export default actions
