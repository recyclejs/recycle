## Recycle RxJS Operators
In addition to RxJS operators there are also Recycle-specific operators which you can use:

* `reducer` - used for defining component reducers
  ```javascript
  button.events('click')
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
* `filterByComponent` - shorthand for `filter(action => action.childComponent === Component)`
  ```javascript
  sources.childrenActions
    .filterByComponent(ClickCounter)
    .mapTo({ type: 'childButtonClicked' })
  ```
* `mapToLatest` - used for retriving component state or props
  ```javascript
  destroyIcon
    .events('click')
    .mapToLatest(sources.props)
    .map(props => ({ type: 'destroy', id: props.id }))

  editInput
    .events('keyup')
    .filter(ev => ev.keyCode === ENTER_KEY)
    .mapToLatest(sources.props, sources.state)
    .map(({props, state}) => ({ type: 'titleChanged', id: props.id, title: state.inputVal }))
  ```