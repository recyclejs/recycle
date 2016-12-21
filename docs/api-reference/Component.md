## Component
In Recycle, a component is a function which returns an object with the following properties:

```javascript
function RecycleComponent () {
  return {
    initialState: {},
    view: function(props, state) { ... },
    actions: function({DOM, childrenActions, actions, props, state, (?fromPlugin)}) { ... },
    reducers: function({DOM, childrenActions, actions, props, state, (?fromPlugin)}) { ... },
    componentDidMount: function() { ... },
    shouldComponentUpdate: function(nextProps, nextState, props, state) { ... },
    componentDidUpdate: function({select, props, state, prevProps, prevState}) { ... },
    componentWillUnmount: function() { ... },
    propTypes: {},
    displayName: 'string'
  }
}
```
### Initialization Component
Recycle components can not be used in React directly, 
which is why `Recycle` initialization component is used:

##### Arguments
1. `root`: Recycle root component 
1. `props`: component state 
1. `plugins`: list of plugins

##### Example
```javascript
<Recycle root={RecycleComponent} />
``` 

Or if defined separately:

```javascript
const ReactComponent = Recycle({
  root: RecycleComponent
})
```

### initialState
Component initial state

##### Example
```javascript
initialState: {
  editing: false,
  inputVal: ''
}
```

### view
Function returning a component view, usually written in JSX

##### Arguments
1. `props`: component props
1. `state`: component state 
1. `jsx`: jsxHandler (equivalent of `React.createElement`)

##### Example
```javascript
function view (jsx, props, state) {
  return (
    <div>
      <div><ClickCounter /></div>
      <div>Total child button clicks: {state.childButtonClicked}</div>
    </div>
  )
}
```

### actions
Function returning an array of observables, representing component actions 

##### Arguments
1. `sources`: object containing component sources:
  * DOM
    * select - function for selecting a DOM element
      * events - function for listening events on selected DOM element (returns an Observable)
  * childrenActions - observable of all actions dispatched from a component children
  * actions - observable of all actions dispatched from a component (listening "to itself")
  * props - observable of component props (usually used in `mapToLatest` Observable operator)
  * state - observable of component state (usually used in `mapToLatest` Observable operator)
  * (fromPlugin) - any other source that can be added by a plugin

##### Example
```javascript
function actions (sources) {
  const button = sources.DOM.select('button')

  return [
    button.events('click')
      .mapTo({ type: 'buttonClicked' })
  ]
}
```

### reducers
Function returning an array of observables, representing component reducers 

##### Arguments
1. `sources`: object containing component sources:
  * DOM
    * select - function for selecting a DOM element
      * events - function for listening events on selected DOM element (returns an Observable)
  * childrenActions - observable of all actions dispatched from a component children
  * actions - observable of all actions dispatched from a component
  * props - observable of component props (usually used in `mapToLatest` Observable operator)
  * state - observable of component state (usually used in `mapToLatest` Observable operator)
  * (fromPlugin) - any other source that can be added by a plugin

##### Example
```javascript
function reducers (sources) {
  return [
    sources.actions
      .filterByType('buttonClicked')
      .reducer(function (state) {
        state.timesClicked++
        return state
      })
  ]
}
```

### componentDidUpdate
Function invoked immediately after updating occurs. 

##### Arguments
1. `params`: object containing following properties:
  * select - function for selecting a DOM element
  * props - component props
  * state - component state
  * prevProps - previous component props
  * prevState - previous component state

##### Example
```javascript
function componentDidUpdate ({select, state, prevState}) {
  if (!prevState.editing && state.editing) {
    const node = select('input.edit')
    node.focus()
    node.select()
  }
}
```

### componentDidMount
Equivalent of [React componentDidMount](https://facebook.github.io/react/docs/react-component.html#componentdidmount)

### shouldComponentUpdate
Equivalent of [React shouldComponentUpdate](https://facebook.github.io/react/docs/react-component.html#shouldcomponentupdate)

### componentWillUnmount
Equivalent of [React componentWillUnmount](https://facebook.github.io/react/docs/react-component.html#componentwillunmount)

### propTypes
Equivalent of [React propTypes](https://facebook.github.io/react/docs/react-component.html#proptypes)

### displayName
Equivalent of [React displayName](https://facebook.github.io/react/docs/react-component.html#displayname)

