## React in Recycle
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
view () {
  return (
    <div>
      <div>This is a Recycle component</div>
      <div>In which we are calling React component: <ReactComponent /></div>
    </div>
  )
}
```

### Recycle in React
There are two ways in which you can use Recycle in React app. 

#### Using Recycle React Component
By using `Recycle` (special React component) and specify its `root` Recycle component:

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

#### Converting Recycle to React
When you need to use the same component multiple times (for example inside [React Router](https://github.com/ReactTraining/react-router)),
you can convert your Recycle component in React and define it separately:


```javascript
import React from 'react'
import Recycle from 'recyclejs'
import { Router, Route, hashHistory } from 'react-router'
import TodoList from './components/TodoList'

const TodoListReact = Recycle({
  root: TodoList
})

ReactDOM.render((
  <Router history={hashHistory}>
    <Route path='/' filter='' component={TodoListReact} />
    <Route path='/completed' filter='completed' component={TodoListReact} />
    <Route path='/active' filter='active' component={TodoListReact} />
  </Router>
), document.getElementById('app'))
```

## Counter Example
An example of Click counter using React and Recycle: [here](https://github.com/recyclejs/recycle/tree/master/examples/CombiningWithReact).
