import actions from './actions'
import view from './view'
import reducers from './reducers'
import { updateLocalStorage, getFromLocalStorage } from '../../utils'

export default function TodoList () {
  return {
    initialState: {
      inputVal: '',
      list: getFromLocalStorage()
    },
    actions,
    reducers,
    view,
    componentDidUpdate ({state}) {
      updateLocalStorage(state)
    }
  }
}
