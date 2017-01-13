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
        sources.selectClass('destroy')
          .on('click')
          .mapToLatest(sources.props)
          .map(props => ({ type: 'destroy', id: props.id })),

        sources.selectClass('toggle')
          .on('change')
          .mapToLatest(sources.props)
          .map(props => ({ type: 'toggle', id: props.id })),

        sources.selectClass('edit')
          .on('keyUp')
          .filter(ev => ev.keyCode === ENTER_KEY)
          .merge(sources.selectClass('edit').on('blur'))
          .mapToLatest(sources.props, sources.state)
          .map(({props, state}) => ({ type: 'titleChanged', id: props.id, title: state.inputVal }))
      ]
    },

    reducers (sources) {
      return [
        sources.selectClass('label')
          .on('doubleClick')
          .mapToLatest(sources.props)
          .reducer((state, props) => {
            state.editing = true
            state.inputVal = props.title
            return state
          }),

        sources.selectClass('edit')
          .on('keyUp')
          .filter(ev => ev.keyCode === ESC_KEY)
          .mapToLatest(sources.props)
          .reducer((state, props) => {
            state.editing = false
            state.inputVal = props.title
            return state
          }),

        sources.selectClass('edit')
          .on('change')
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
