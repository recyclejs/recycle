import {ENTER_KEY, ESC_KEY} from '../../utils'

export default function actions (sources) {
  const newTodoInput = sources.DOM.select('.new-todo')
  const toggleAll = sources.DOM.select('.toggle-all')
  const clearCompleted = sources.DOM.select('.clear-completed')

  return [
    toggleAll
      .events('click')
      .mapTo({ type: 'toggleAll' }),

    clearCompleted
      .events('click')
      .mapTo({ type: 'deleteCompleted' }),

    newTodoInput
      .events('keydown')
      .filter(e => e.keyCode === ESC_KEY)
      .mapTo({ type: 'inputVal', payload: '' }),

    newTodoInput
      .events('keydown')
      .filter(e => e.keyCode === ENTER_KEY)
      .map(e => e.target.value)
      .filter(val => val.length > 0)
      .map(val => ({ type: 'insertTodo', payload: val })),

    newTodoInput
      .events('input')
      .map(e => e.target.value)
      .map(val => ({ type: 'inputVal', payload: val })),

    sources.actions
      .filterByType('insertTodo')
      .mapTo({ type: 'inputVal', payload: '' })
  ]
}
