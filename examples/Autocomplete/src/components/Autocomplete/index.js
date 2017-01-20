import view from './view'

export default function Autocomplete () {
  return {
    initialState: {
      suggestions: []
    },

    actions (sources) {
      return [
        sources.selectId('searchInput')
          .on('onChange')
          .filter(val => val.length > 2)
          .debounceTime(500)
      ]
    },

    reducers (sources) {
      return [
        sources.suggestions
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

