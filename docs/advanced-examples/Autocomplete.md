## Autocomplete Example
To demonstrate a power of Observables for handling async operations, 
we are going to create a simple autocomplete example.

Requirements:
1. Listing GitHub usernames as user is typing in the input field
1. Debounce time of 500ms
1. Initiating search only if more than two characters are inserted
1. Canceling all previous requests as the new one arrives
1. Handling errors

### View
The component will consist of an input field, 
list of results and div element for displaying errors:

```javascript
function view (props, state) {
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
```

### Actions
Using RxJS operators like `debounceTime` and `Observable.ajax`, 
all async operations can be declared in a single action:

```javascript
function actions (sources) {
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
}
```
This action will dispatch `autocompleteFetched` with retrieved usernames, or `autocompleteError` with an error message. 

### Reducers
We can now use these actions for updating our state: 

```javascript
function reducers (sources) {
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
}
```

### Complete Example
For a complete example check [here](https://github.com/recyclejs/recycle/tree/master/examples/Autocomplete).