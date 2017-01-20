In Recycle, a component behavior is defined by specifying which node should be listened to and what should be done on user's actions.
This node is selected by tag, class name, id or a special `recycle` tag. 
Even though it resembles [query selectors](https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector), 
Recycle uses React's inline event handlers and doesn't rely on the DOM. 
A selection is isolated per component, so you don't have to worry about selecting nodes of child components.