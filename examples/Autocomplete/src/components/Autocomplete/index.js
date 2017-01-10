import view from './view'
import { Observable } from 'rxjs/Observable'

export default function Autocomplete () {
  return {
    initialState: {
      suggestions: []
    },

    reducers (sources) {
      return [
        sources.select('searchInput')
          .events('onChange')
          .filter(val => val.length > 2)
          .debounceTime(500)
          .switchMap(val => Observable.ajax('https://api.github.com/search/users?q=' + val))
          .reducer(function (state, res) {
            state.suggestions = res.response.items.slice(0, 10)
            return state
          })
      ]
    },

    view (props, state) {
      return view(state.suggestions)
    }
  }
}

