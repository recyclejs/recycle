import { ENTER_KEY, ESC_KEY } from '../../utils'
import view, {componentDidUpdate} from './view'

export default function Todo () {
  return {
    initialState: {
      editing: false,
      inputVal: ''
    },

    actions (sources) {
      return [
        sources.select('destroy')
          .events('click')
          .mapToLatest(sources.props)
          .map(props => ({ type: 'destroy', id: props.id })),

        sources.select('toggle')
          .events('change')
          .mapToLatest(sources.props)
          .map(props => ({ type: 'toggle', id: props.id })),

        sources.select('edit')
          .events('keyup')
          .filter(ev => ev.keyCode === ENTER_KEY)
          .merge(sources.select('edit').events('blur', true))
          .mapToLatest(sources.props, sources.state)
          .map(({props, state}) => ({ type: 'titleChanged', id: props.id, title: state.inputVal }))
      ]
    },

    reducers (sources) {
      return [
        sources.select('label')
          .events('dblclick')
          .mapToLatest(sources.props)
          .reducer((state, props) => {
            state.editing = true
            state.inputVal = props.title
            return state
          }),

        sources.select('edit')
          .events('keyup')
          .filter(ev => ev.keyCode === ESC_KEY)
          .mapToLatest(sources.props)
          .reducer((state, props) => {
            state.editing = false
            state.inputVal = props.title
            return state
          }),

        sources.select('edit')
          .events('input')
          .reducer((state, e) => {
            state.inputVal = e.target.value
            return state
          }),

        sources.actions
          .filterByType('titleChanged')
          .reducer(state => {
            state.editing = false
            return state
          })
      ]
    },

    view (props, state) {
      return view({
        completed: props.completed,
        editing: state.editing,
        title: props.title,
        inputVal: state.inputVal
      })
    },

    componentDidUpdate
  }
}
