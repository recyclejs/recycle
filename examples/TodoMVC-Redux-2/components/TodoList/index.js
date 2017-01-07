import actions from './actions'
import view from './view'
import reducers from './reducers'

export default function TodoList () {
  return {
    initialState: {
      inputVal: ''
    },
    actions,
    reducers,
    view
  }
}
