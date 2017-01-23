# Drivers

As shown in [Concepts -> Drivers](/docs/concepts/Drivers.md),
extended functionality for Recycle apps can be provided with drivers.

They can be enabled in `Recycle` component:

```javascript
<Recycle root={TodoList} driver={[Driver1, Driver2]} />
``` 

Or if defined separately:

```javascript
const TodoListReact = Recycle(Driver1, Driver2)(TodoList)
```

Every Recycle driver is a function that receives two arguments:
 - **recycle** `Object`: recycle instance
  - **on** `function(event, cb)`: Function for adding event listener
  - **unbind** `function(event, cb)`: Function for removing event listener
  - **emit** `function(event, params)`: Function for emitting events
  - **use** `function(driver)`: Function for applying a driver
  - **createComponent** `function(Component)`: Function for creating component
  - **getAllComponents** `function`: function which returns list of all components
  - **getComponentStructure** `function`: function which returns a tree of all components
  - **getRootComponent** `function`: function which returns a root component
 - **streamAdapter** `Object`: Object containing { Observable, Subject } RxJS functions


### Recycle Events
Using `recycle.on(event, cb)`, following events can be used:
- **'initialize'** `function`: emitted when root component is initialized
- **'componentInit'** `function(component`: emitted when component is initialized
- **'sourcesReady'** `function(component`: emitted when component sources are ready
- **'action'** `function(action, component)`: emitted when action is dispatched 
- **'newState'** `function(component, state, action)`: emitted when reducer had applied a new state

### Component Instance
Most of the events emitted from `recycle` will pass a `component` instance to a callback function.

- **component** `Object`: A component instance, created from [Component function](Component.md)
  - **get** `function(prop)`: retrive a component definition property (for example: `'initialPath'`, `'view'`, `'reducers'` etc.)
  - **set** `function(prop, val)`: add new component definition property
  - **getPrivate** `function(prop)`: retrive a private component property (can only be accessed with using driver)
  - **setPrivate** `function(prop, val)`: add new private component property
  - **setSource** `function(name, source)`: add new component source
  - **getSource** `function(name)`: retrive a component source (for example: `'DOM'`, `'actions'` etc.)
  - **getName** `function`: retrive a component name
  - **getKey** `function`: retrive a component key
  - **getConstructor** `function`: retrive a constructor function
  - **getParent** `function`: retrive a component parent
  - **getSources** `function`: retrive a component sources
  - **getActions** `function`: retrive a component actions
  - **getState** `function`: retrive a component state
  - **setState** `function(newState)`: set new component state
  - **replaceState** `function(newState)`: replace current state (state stream will stay silent)
  - **getStateStream** `function`: retrive a component state stream
  - **getProps** `function`: retrive a component props
  - **replaceProps** `function(newProps)`: replace a component props
  - **getChildren** `function`: get component children (returns an array)
  - **removeChild** `function(component)`: remove child from a component
  - **updateChildrenActions** `function`: update children actions (recursivly to a root component)
