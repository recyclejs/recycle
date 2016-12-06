# Recycle

A functional and reactive JavaScript framework for creating components where View is a visual representation of the state which can be changed by reducers reacting to actions.

[![npm version](https://img.shields.io/npm/v/recyclejs.svg?style=flat-square)](https://www.npmjs.com/package/recyclejs)
[![npm downloads](https://img.shields.io/npm/dm/recyclejs.svg?style=flat-square)](https://www.npmjs.com/package/recyclejs)

## Key Features
* View is a "clean" representation of the state (without `onClick`, `keyUp` or similar event handlers)
* Fully compatible with React (Recycle in React app or React in Recycle app)
* Functional - components can be defined with only pure functions
* Reactive - async operations are handled with Observables (RxJS by default)
* Declarative - components are defined in a [declarative manner](https://medium.freecodecamp.com/imperative-vs-declarative-programming-283e96bf8aea#.py5l5or52), using actions and reducers
* Built-in state managment plugin
* If compatible, React and RxJS can easily be replaced with another library

## Installation
```bash
npm install --save recyclejs
```

## Documentation

### Quick Start
  * [Hello World](/docs/quick-start/HelloWorld.md)
  * [Stateful Component](/docs/quick-start/StatefulComponent.md)
  * [Parent-Child Relationship](/docs/quick-start/ParentChild.md)
  * [Using React Components](/docs/quick-start/UsingReactComponents.md)

### Advanced Examples
  * [Autocomplete](/docs/advanced-examples/Autocomplete.md)
  * [WebSocket Echo](/docs/advanced-examples/WebsocketEcho.md)
  * [TodoMVC](/docs/advanced-examples/TodoMVC.md)
    * [Without Store](/docs/advanced-examples/todomvc/TodoMVCNoPlugin.md)
    * [With Store](/docs/advanced-examples/todomvc/TodoMVCStore.md)
    * [Isolated Reducers](/docs/advanced-examples/todomvc/TodoMVCStoreIsolated.md)

### API Reference
  * [adapter](/docs/api-reference/adapter.md)
  * [createRecycle](/docs/api-reference/createRecycle.md)
  * [Component](/docs/api-reference/Component.md)
  * [Recycle RxJS Operators](/docs/api-reference/recycleRxjsOperators.md)
  * [Plugins](/docs/api-reference/Plugins.md)