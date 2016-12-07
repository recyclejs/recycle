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
  * [Hello World](https://recycle.js.org/docs/quick-start/HelloWorld.html)
  * [Stateful Component](https://recycle.js.org/docs/quick-start/StatefulComponent.html)
  * [Parent-Child Relationship](https://recycle.js.org/docs/quick-start/ParentChild.html)
  * [Using React Components](https://recycle.js.org/docs/quick-start/UsingReactComponents.html)

### Advanced Examples
  * [Autocomplete](https://recycle.js.org/docs/advanced-examples/Autocomplete.html)
  * [WebSocket Echo](https://recycle.js.org/docs/advanced-examples/WebsocketEcho.html)
  * [TodoMVC](https://recycle.js.org/docs/advanced-examples/TodoMVC.html)
    * [Without Store](https://recycle.js.org/docs/advanced-examples/todomvc/TodoMVCNoPlugin.html)
    * [With Store](https://recycle.js.org/docs/advanced-examples/todomvc/TodoMVCStore.html)
    * [Isolated Reducers](https://recycle.js.org/docs/advanced-examples/todomvc/TodoMVCStoreIsolated.html)

### API Reference
  * [adapter](https://recycle.js.org/docs/api-reference/adapter.html)
  * [createRecycle](https://recycle.js.org/docs/api-reference/createRecycle.html)
  * [Component](https://recycle.js.org/docs/api-reference/Component.html)
  * [Recycle RxJS Operators](https://recycle.js.org/docs/api-reference/recycleRxjsOperators.html)
  * [Plugins](https://recycle.js.org/docs/api-reference/Plugins.html)