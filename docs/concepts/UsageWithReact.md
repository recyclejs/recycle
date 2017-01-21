# Usage With React
React component can be a part of Recycle component,
and Recycle component can be a part of React component.

## React in Recycle
React component is used in the same way as any other component - by defining it in a view:

```javascript
// View function of Recycle component
view () {
  return (
    <div>
      <div>This is a Recycle component</div>
      <div>In which we are calling React component: <ReactComponent /></div>
    </div>
  )
}
```

## Recycle in React
There are two ways in which you can use Recycle in your React app: 

- By using `Recycle` as a React component:
  ```javascript
  import React from 'react'
  import Recycle from 'recyclejs'

  class ReactComponent extends React.Component {
    render () {
      return (
        <span>
          <Recycle root={RecycleComponent} />
        </span>
      )
    }
  }
  ```
- By converting Recycle in React. Useful when you need to use the same component multiple times (for example inside [React Router](https://github.com/ReactTraining/react-router)):
  ```javascript
  import React from 'react'
  import Recycle from 'recyclejs'
  import { Router, Route, hashHistory } from 'react-router'
  import TodoListRecycle from './components/TodoList'

  const TodoListReact = Recycle()(TodoListRecycle)

  ReactDOM.render((
    <Router history={hashHistory}>
      <Route path='/' filter='' component={TodoListReact} />
      <Route path='/completed' filter='completed' component={TodoListReact} />
      <Route path='/active' filter='active' component={TodoListReact} />
    </Router>
  ), document.getElementById('app'))
  ```

## Autocomplete Example
Example of using React components ([material-ui](http://www.material-ui.com/)) with Recycle: [Autocomplete](https://github.com/recyclejs/recycle/tree/master/examples/Autocomplete)