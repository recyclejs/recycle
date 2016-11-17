import actions from './actions'
import view from './view'
import reducers from './reducers'

function TodoList () {
  return {
    initialState: {
      inputVal: '',
      filter: '', // wether to show completed, active or all todos
      list: []    // list of todo items
    },
    actions,
    reducers,
    view
  }
}

export default TodoList
