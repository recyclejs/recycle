import {ENTER_KEY, ESC_KEY} from '../../utils'

export default function actions (sources) {
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
      .mapToLatest(sources.state)
      .map(state => ({ type: 'titleChanged', payload: state.inputVal })),

    todoLabel
      .events('dblclick')
      .mapTo({ type: 'startEdit' }),

    editInput
      .events('input')
      .map(e => ({ type: 'inputVal', value: e.target.value })),

    editInput
      .events('keyup')
      .filter(ev => ev.keyCode === ESC_KEY)
      .mapTo({ type: 'cancelEdit' }),

    sources.actions
      .filterByType('cancelEdit')
      .mapToLatest(sources.props)
      .map(props => ({ type: 'inputVal', value: props.title })),

    sources.actions
      .filterByType('startEdit')
      .mapToLatest(sources.props)
      .map(props => ({ type: 'inputVal', value: props.title }))
  ]
}
