## Using React Components
Since, by default, Recycle uses React you can use React components in your Recycle app and vice versa.

### React in Recycle
React component can be invoked in the same way as any other component - by defining it in a view:

```javascript
// React component
class ReactComponent extends React.Component {
  render () {
    return (
      <span>Hello from React Component!</span>
    )
  }
}
```

```javascript
// View function of Recycle component
view (jsx) {
  return (
    <div>
      <div>This is a Recycle component</div>
      <div>In which we are calling React component: <ReactComponent /></div>
    </div>
  )
}
```

### Recycle in React
There are two ways in which you can use a Recycle component inside a React component. 

#### Converting Recycle to React
By converting it in React. Which is useful when using something like [React Router](https://github.com/ReactTraining/react-router):


```javascript
// converting TodoList component in React
const recycle = createRecycle({ adapter })
const TodoListReact = recycle.toReact(TodoList)
```

```javascript
// passing it inside React-Router
ReactDOM.render((
  <Router history={hashHistory}>
    <Route path='/' filter='' component={TodoListReact} />
    <Route path='/completed' filter='completed' component={TodoListReact} />
    <Route path='/active' filter='active' component={TodoListReact} />
  </Router>
), document.getElementById('app'))
```

#### Calling it Directly (Recycle-React-Recycle)
If you are "switching" from Recycle to React and then back to Recycle, you can call your components directly. But, for this to work, unlike a "normal" React component which is using a global `JSX handler` for creating elements (used here in a first example), this time we will use `JSX handler` which is passed from Recycle to a render method of your React component:

```javascript
class ReactComponent extends React.Component {
  render (jsx) {
    // when used inside Recycle component
    // jsx handler will be passed in a render method of a react component
    // necessary only if you need to call another Recycle component inside it 
    return (
      <span>
        <RecycleComponent />
      </span>
    )
  }
}
```

### JSX pragma
Since Recycle requires "jsx" pragma, if you configure babel to transpile your whole project (rather than using pragma only in files where Recycle view is defined) your React components will depend on `jsx` variable rather than `React.createElement`. Which is why `jsx` variable has to be in scope. 

One way is to define it using a global `React` instance:

```javascript
import React from 'react'
const jsx = React.createElement

class ReactComponent extends React.Component {
  render () {
    return (
      <span>Hello from React Component!</span>
    )
  }
}
```
Or you can import it from `react-rxjs` adapter:

```javascript
import { React, ReactDOM, jsx } from 'recyclejs/adapter/react-rxjs'

class ReactComponent extends React.Component {
  render () {
    return (
      <span>Hello from React Component!</span>
    )
  }
}
```

## Counter Example
An example of Click counter using React and Recycle: [here](https://github.com/recyclejs/recycle/tree/master/examples/CombiningWithReact).
