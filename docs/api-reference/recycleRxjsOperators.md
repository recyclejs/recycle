## Recycle RxJS Operators
In addition to RxJS operators there are also Recycle-specific operators which you can use:

* `reducer` - used for defining component reducers
  ```javascript
  select('button')
    .on('click')
    .reducer(function (state) {
      state.timesClicked++
      return state
    })
  ```
* `filterByType` - shorthand for `filter(action => action.type === type)`
  ```javascript
  sources.childrenActions
    .filterByType('buttonClicked')
    .mapTo({ type: 'childButtonClicked' })
  ```
* `mapToLatest` - used for retriving component state or props
  ```javascript
  selectClass('delete')
    .on('click')
    .mapToLatest(sources.props)
    .map(props => ({ type: 'destroy', id: props.id }))

  select('input')
    .on('keyUp')
    .filter(ev => ev.keyCode === ENTER_KEY)
    .mapToLatest(sources.props, sources.state)
    .map(({props, state}) => ({ type: 'titleChanged', id: props.id, title: state.inputVal }))
  ```