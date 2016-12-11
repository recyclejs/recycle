## Plugins

As shown in [WebSocket Echo example](/docs/advanced-examples/WebsocketEcho.md),
extended functionality for Recycle apps can be provided with plugins.

They can be enabled in `createRecycle` function:

```javascript
const recycle = createRecycle({
  adapter: adapter,
  plugins: [
    Plugin1,
    Plugin2
  ]
})
``` 

Every Recycle plugin is a function that receives two arguments:
 * `recycle` *(Object)*: recycle instance
  * `on` *(Function(event, cb))*: Function for adding event listener
  * `unbind` *(Function(event, cb))*: Function for removing event listener
  * `createComponent` *(Function(Component))*: Function for creating component
  * `getAllComponents` *(Function)*: function which returns list of all components
  * `getComponentStructure` *(Function)*: function which returns a tree of all components
  * `getRootComponent` *(Function)*: function which returns a root component
 * `adapter` *(Object)*: adapter instance (documented [here](adapter.md))

### Recycle Events
Using `recycle.on(event, cb)`, following events can be used:
* `'componentUpdate'` *(Function(component))*: emitted immediately after updating occurs. This method is not called for the initial render
* `'initialize'` *(Function()*: emitted when root component is initialized
* `'componentInit'` *(Function(component)*: emitted when component is initialized
* `'action'` *(Function(action, component))*: emitted when action is dispatched 
* `'newState'` *(Function(component, state, action))*: emitted when reducer had applied a new state

### Component Instance
Most of the events emitted from `recycle` will pass a `component` instance to a callback function.

* `component` *(Object)*: A component instance, created from [Component function](Component.md)
  * `get` *(Function)*: retrive a component property (for example: `'initialPath'`, `'view'`, `'reducers'` etc.)
  * `set` *(Function)*: add new component property
  * `getSource` *(Function)*: retrive a component source (for example: `'DOM'`, `'actions'` etc.)
  * `setSource` *(Function)*: add new component source
  * `getName` *(Function)*: retrive a component name
  * `getState` *(Function)*: retrive a component state
  * `getProps` *(Function)*: retrive a component props
