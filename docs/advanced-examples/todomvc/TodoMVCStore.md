## Application State
In the previous example, we had created a TodoMVC using two components: *TodoList* as a root component and *Todo* as its child.

But since *TodoList* is the only component which has access to a list of todo items, 
it is also the only component capable of changing that list. 

This is why we were dispatching an `id` property from a *Todo* back to a *TodoList* component. 
Because otherwise, we wouldn't know which Todo item had changed its `completed` flag or `title` value.

But if a *Todo* could modify the application state directly, 
we wouldn't have to do that because all of actions and reducers responsible for changing this part of a state
would be transferred from a *TodoList* on to *Todo* component.
By doing this, *TodoList* would no longer use `sources.childrenActions` which would result in a decoupled and simpler component 
that can be reused in a different app more easily.

This kind of architecture depends on some sort of state management tool (like [Redux](http://redux.js.org/))
responsible for keeping components synced with the application state.

In Recycle, this can be done by using Store plugin.

### Using Store Plugin
Store is created using `createStore`:

```javascript
import createRecycle from 'recyclejs'
import adapter from 'recyclejs/adapter/react-rxjs'
import createStore from 'recyclejs/plugins/store'

const store = createStore({
  initialState: {
    todos: {
      list: [] 
    }
  }
})
```

which is then passed as a plugin in `createRecycle` function:

```javascript
const recycle = createRecycle({
  adapter,
  plugins: [
    store
  ]
})
```

### Presentational and Container Components
If you are familiar with Redux, you'll probably be aware of the idea of separating presentational and container components.
If not, you can learn about it [here](http://redux.js.org/docs/basics/UsageWithReact.html#presentational-and-container-components).

Recycle store is similar to the one used in Redux with React, but it is not identical.
Using a table of differences between presentational and container components provided in Redux docs,
here is the same table for a Recycle Store (with highlighted differences from Redux):

<table>
    <thead>
        <tr>
            <th></th>
            <th scope="col" style="text-align:left">Presentational Components</th>
            <th scope="col" style="text-align:left">Container Components</th>
        </tr>
    </thead>
    <tbody>
        <tr>
          <th scope="row" style="text-align:right">Purpose</th>
          <td>How things look (markup, styles)</td>
          <td>How things work (data fetching, state updates)</td>
        </tr>
        <tr>
          <th scope="row" style="text-align:right">Aware of Store</th>
          <td>No</th>
          <td>Yes</th>
        </tr>
        <tr>
          <th scope="row" style="text-align:right">To read data</th>
          <td>Read data from props</td>
          <td>Subscribe to Recycle store</td>
        </tr>
        <tr>
          <th scope="row" style="text-align:right">To change data</th>
          <td><b style='color:red'>Define actions which container can use</b></td>
          <td><b style='color:red'>Define reducers</b></td>
        </tr>
        <tr>
          <th scope="row" style="text-align:right">Are written</th>
          <td>By hand</td>
          <td><b style='color:red'>By hand</b></td>
        </tr>
    </tbody>
</table>

Container components in Recycle are structured in the same way as any other Recycle component,
but with the addition of `storePath` property which connects that component to a particular part of the store.
That is why there is no need to generate them and are written "by hand".

Also, since reducers are an integral part of a Recycle component,
for changing store data we don't have to dispatch special actions which will then be listened to and applied in reducers
"outside" of a component - we can use container reducers. 

Anytime a component state is changed, if connected to the store, that component will also modify the store at the provided path (defined with `storePath`). 

### TodoList
As for our TodoMVC example, we can start by creating *TodoList* container and presentational components.

#### Presentational Component
*TodoList* presentational component is now much simpler from a [*TodoList* in previous example](https://github.com/recyclejs/recycle/tree/master/examples/TodoMVC/components/TodoList).
All actions depending on `sources.childrenActions` and almost all reducers are removed from the component,
keeping it decoupled from the rest of the application: [TodoList Presentational Component](https://github.com/recyclejs/recycle/tree/master/examples/TodoMVC-Store-1/components/TodoList).

#### Container Component
For a container component, we must first define a `storePath`. 

Since this is a structure of our store:

```JSON
todos: {
  list: [] 
}
```

and our component needs access to the `list` array of a `todos` property, 
we can define our path as follows:

```javascript
function TodoListContainer () {
  return {
    storePath: 'todos'
  }
}
```

Note: To be more clear on how to define a `storePath`, here is an example when dealing with a larger state:
  
```JSON
todos: {
  deeply: {
    nested: {
      list: []
    }
  }
}
```

in which case, our `storePath` would be defined as:

`storePath: 'todos.deeply.nested'` 

or as an array: 

`storePath: ['todos', 'deeply', 'nested']`

The rest of the component structure is no different from any other Recycle component.
We are using presentational *TodoList* component as a child and `sources.childrenActions`
for defining reducers which would update the store:  

```javascript
import { toggleAll, deleteCompleted, insertTodo } from './reducers'
import TodoList from '../../components/TodoList/index'

function TodoListContainer () {
  return {
    storePath: 'todos',

    reducers (sources) {
      return [
        sources.childrenActions
          .filterByType('toggleAll')
          .reducer(toggleAll),

        sources.childrenActions
          .filterByType('deleteCompleted')
          .reducer(deleteCompleted),

        sources.childrenActions
          .filterByType('insertTodo')
          .reducer(insertTodo)
      ]
    },

    view (jsx, props, state) {
      return <TodoList todos={state.list} filter={props.route.filter} />
    }
  }
}
```

### Todo
Just like *TodoList*, *Todo* is also separated into a container and presentational component. 

#### Presentational Component
For a presentational *Todo* component there is no need for changing anything, 
so we can use the one from the [previous example](https://github.com/recyclejs/recycle/tree/master/examples/TodoMVC/components/Todo).

#### Container Component
*TodoList* and *Todo* container components should both be able to change a list of todo items,
so we can define `storePath` of a *Todo* container to be the same as for *TodoList* and all reducers that were modifying state of a single todo item (`deleteTodo`, `editTodo`, `toggleTodo`) can now be transferred from *TodoList* to a *Todo* container:

```javascript
import { deleteTodo, editTodo, toggleTodo } from './reducers'
import Todo from '../../components/Todo/index'

function TodoContainer (props) {
  return {
    storePath: `todos`,

    reducers (sources) {
      return [
        sources.childrenActions
          .filterByType('destroy')
          .reducer(deleteTodo),

        sources.childrenActions
          .filterByType('titleChanged')
          .reducer(editTodo),

        sources.childrenActions
          .filterByType('toggle')
          .reducer(toggleTodo)
      ]
    },

    view (jsx, props, state) {
      const todo = state.list.find(todo => todo.id === props.id)
      if (!todo) {
        return null
      }
      return <Todo title={todo.title} id={todo.id} completed={todo.completed} />
    }
  }
}
```
## Complete Example
For a complete example with routing and localstorage support check [here](https://github.com/recyclejs/recycle/tree/master/examples/TodoMVC-Store-1).