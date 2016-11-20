import createRecycle from '../../src/index'
import adapter, { Observable } from '../../src/adapter/react-rxjs'
import 'rxjs/add/observable/dom/ajax'
import 'rxjs/add/operator/debounceTime'
import 'rxjs/add/operator/switchMap'
import 'rxjs/add/operator/catch'

function Autocomplete () {
  return {
    initialState: {
      suggestions: []
    },

    actions (sources) {
      return [
        sources.DOM.select('input')
          .events('keyup')
          .debounceTime(500)
          .map(e => e.target.value)
          .filter(val => val.length > 2)
          .switchMap(val =>
            Observable.ajax('https://api.github.com/search/users?q=' + val)
              .map(res => ({ type: 'autocompleteFetched', payload: res.response.items.slice(0, 10) }))
              .catch(err => [{ type: 'autocompleteError', payload: err.message }])
          )
      ]
    },

    reducers (sources) {
      return [
        sources.actions
          .filterByType('autocompleteFetched')
          .reducer(function (state, action) {
            state.error = false
            state.suggestions = action.payload
            return state
          }),

        sources.actions
          .filterByType('autocompleteError')
          .reducer(function (state, action) {
            state.error = action.payload
            return state
          })
      ]
    },

    view (jsx, props, state) {
      return (
        <div>
          <div>Find GitHub login: <input type='text' /></div>
          <ul>
            {state.suggestions.map((item, i) => <li key={i}>{item.login}</li>)}
          </ul>
          {state.error ? (
            <div className='autocomplete-error'>
              Error fetching autocomplete results: {state.error}
            </div>
          ) : ''}
        </div>
      )
    }
  }
}

const recycle = createRecycle({ adapter })
recycle.render(Autocomplete, document.getElementById('app'))
