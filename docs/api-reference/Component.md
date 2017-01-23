## Component
In Recycle, a component is a function which returns an object with the following properties:

```javascript
function RecycleComponent (props) {
  return {
    initialState: {},
    view: function(props, state) { ... },
    actions: function(sources) { ... },
    reducers: function(sources) { ... },
    componentDidMount: function() { ... },
    shouldComponentUpdate: function(nextProps, nextState, props, state) { ... },
    componentDidUpdate: function({refs, props, state, prevProps, prevState}) { ... },
    componentWillUnmount: function() { ... },
    propTypes: {},
    displayName: 'string'
  }
}
```

Note that this function is called only on a component initialization.
So, if you want to use `props` in `actions` or `reducers`, 
it's probably better to use `sources.props` stream.

### Initialization Component
Recycle components can not be used in React directly, 
which is why `Recycle` initialization component is used:

##### Arguments
1. `root`: Recycle root component 
1. `props`: component state 
1. `drivers`: list of drivers

##### Example
```javascript
<Recycle root={RecycleComponent} />
``` 

Or if defined separately:

```javascript
const ReactComponent = Recycle(driver1, driver2...)(RecycleComponent)
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
Function returning a component view

##### Arguments
1. `props`: component props
1. `state`: component state 

##### Example
```javascript
function view (props, state) {
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
  * `sources.select` - selecting node(s) by its tag name or by child component function
  * `sources.selectClass` - selecting node(s) by its class name 
  * `sources.selectId` - selecting node(s) by its id
  * childrenActions - observable of all actions dispatched from a component children
  * actions - observable of all actions dispatched from a component (listening "to itself")
  * props - observable of component props (usually used in `mapToLatest` Observable operator)
  * state - observable of component state (usually used in `mapToLatest` Observable operator)
  * (fromDriver) - any other source that can be added by a driver

##### Example
```javascript
function actions (sources) {
  const button = sources.select('button')

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
  * `sources.select` - selecting node(s) by its tag name or by child component function
  * `sources.selectClass` - selecting node(s) by its class name 
  * `sources.selectId` - selecting node(s) by its id
  * childrenActions - observable of all actions dispatched from a component children
  * actions - observable of all actions dispatched from a component 
  * props - observable of component props (usually used in `mapToLatest` Observable operator)
  * state - observable of component state (usually used in `mapToLatest` Observable operator)
  * (fromDriver) - any other source that can be added by a driver

##### Example
```javascript
function reducers (sources) {
  return [
    sources.select('button')
      .on('click')
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
  * refs - component refs
  * props - component props
  * state - component state
  * prevProps - previous component props
  * prevState - previous component state

##### Example
```javascript
function componentDidUpdate ({refs, state, prevState}) {
  if (!prevState.editing && state.editing) {
    ref.input.focus()
    ref.input.select()
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

