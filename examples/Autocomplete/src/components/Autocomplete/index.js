import view from './view'
import TextField from 'material-ui/TextField'

export default function Autocomplete () {
  return {
    initialState: {
      suggestions: []
    },

    actions (sources) {
      return [
        sources.select(TextField)
          .on('onChange')
          .map(e => e.target.value)
          .filter(val => val.length > 2)
          .debounceTime(500)
      ]
    },

    reducers (sources) {
      return [
        sources.suggestions$
          .reducer(function (state, items) {
            state.suggestions = items.slice(0, 10)
            return state
          })
      ]
    },

    view (props, state) {
      return view(state.suggestions)
    }
  }
}

