import actions from './actions'
import view from './view'
import reducers from './reducers'

export default function TodoList () {
  return {
    initialState: {
      inputVal: '',
      list: []    // list of todo items
    },
    actions,
    reducers,
    view
  }
}
