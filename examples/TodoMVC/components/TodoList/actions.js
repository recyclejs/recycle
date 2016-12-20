import { ENTER_KEY, ESC_KEY } from '../../utils'

export default function actions (sources) {
  const newTodoInput = sources.DOM.select('.new-todo')
  const toggleAll = sources.DOM.select('.toggle-all')
  const clearCompleted = sources.DOM.select('.clear-completed')

  /*
    const newTodoInput = sources.DOM.select('.new-todo')
    const toggleAll = sources.DOM.select('.toggle-all')
    const clearCompleted = sources.DOM.select('.clear-completed')

    sources.actions
      .on(sources.childrenActions, {type: 'toggle', id: 1})
      .shuldMatchSource()

    sources.actions
      .on(sources.childrenActions, {type: 'destroy', id: 1})
      .shuldMapTo({ type: 'deleteTodo', id: 1 })

    sources.actions
      .on(sources.childrenActions, {type: 'titleChanged', id: 1, title: 'some'})
      .shuldMapTo({ type: 'editTodo', id: 1, title: 'some' })

    sources.actions
      .on(sources.childrenActions, {type: 'notHandled'})
      .shuldIgnore()

    sources.actions
      .on(newTodoInput.events('input'), e('input', 'a'))
      .shuldMapTo({ type: 'inputVal', payload: 'a' })

    sources.actions
      .on(newTodoInput.events('keydown'),
        [
          e('keydown', 'd'},
          e('keydown', 'o'},
          e('keydown', 'b'},
          e('keydown', 'a'},
          e('keydown', {code: 'enter'})
        ]
      ))
      .shuldMapTo({ type: 'insertTodo', payload: 'doba' })

    sources.actions
      .on(sources.actions, { type: 'insertTodo', payload: 'doba' })
      .shuldMapTo({ type: 'inputVal', payload: '' })

    sources.actions
      .on(newTodoInput.events('keydown'), e('keydown', {code: 'esc'}))
      .shouldMapTo({ type: 'inputVal', payload: '' })

    sources.actions
      .on(toggleAll.events('click'), e('click'))
      .shouldMapTo({ type: 'toggleAll' })

    sources.actions
      .on(toggleAll.events('click'), e('click'))
      .shouldMapTo({ type: 'deleteCompleted' })
  */

  return [
    sources.childrenActions
      .filterByType('toggle')
      .map(action => ({ type: 'toggleTodo', id: action.id })),

    sources.childrenActions
      .filterByType('destroy')
      .map(action => ({ type: 'deleteTodo', id: action.id })),

    sources.childrenActions
      .filterByType('titleChanged')
      .map(action => ({ type: 'editTodo', id: action.id, title: action.title })),

    newTodoInput
      .events('input')
      .map(e => ({ type: 'inputVal', payload: e.target.value })),

    newTodoInput
      .events('keydown')
      .filter(e => e.keyCode === ENTER_KEY)
      .map(e => e.target.value)
      .filter(val => val.length > 0)
      .map(val => ({ type: 'insertTodo', payload: val })),

    sources.actions
      .filterByType('insertTodo')
      .mapTo({ type: 'inputVal', payload: '' }),

    newTodoInput
      .events('keydown')
      .filter(e => e.keyCode === ESC_KEY)
      .mapTo({ type: 'inputVal', payload: '' }),

    toggleAll
      .events('click')
      .mapTo({ type: 'toggleAll' }),

    clearCompleted
      .events('click')
      .mapTo({ type: 'deleteCompleted' })
  ]
}
