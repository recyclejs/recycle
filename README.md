# Recycle

Recycle is a functional and reactive library for [React](https://facebook.github.io/react).

With Recycle you can create your components using [FRP paradigm](https://en.wikipedia.org/wiki/Functional_reactive_programming), 
where View is a visual representation of the state which can be changed by reducers reacting to actions.

[![npm version](https://img.shields.io/npm/v/recyclejs.svg?style=flat-square)](https://www.npmjs.com/package/recyclejs)
[![npm downloads](https://img.shields.io/npm/dm/recyclejs.svg?style=flat-square)](https://www.npmjs.com/package/recyclejs)

## Key Features
* It's tiny - Recycle itself has 3.5KB gzipped
* View is a "clean" representation of the state (without `onClick`, `keyUp` or similar event handlers which leads to a better separation of concerns)
* Functional - all components can be defined without the use of classes
* Reactive - async operations are handled with Observables ([RxJS](https://github.com/ReactiveX/rxjs))
* Declarative - components are defined in a [declarative manner](https://medium.freecodecamp.com/imperative-vs-declarative-programming-283e96bf8aea#.py5l5or52), using actions and reducers

## Installation
```bash
npm install --save recyclejs
```
## Usage
Short example of converting React component to Recycle:
<img src="https://cloud.githubusercontent.com/assets/1868852/21557750/279d54ea-ce31-11e6-81f3-e1da977dab6b.gif" style="border: 5px solid #1e1e1e" alt="Recycle example" width="600" />

## Documentation

### [Motivation](https://recycle.js.org/docs/Motivation.html)

### Quick Start
  * [Hello World](https://recycle.js.org/docs/quick-start/HelloWorld.html)
  * [Stateful Component](https://recycle.js.org/docs/quick-start/StatefulComponent.html)
  * [Parent-Child Relationship](https://recycle.js.org/docs/quick-start/ParentChild.html)
  * [Usage with React](https://recycle.js.org/docs/quick-start/UsingReactComponents.html)

### Advanced Examples
  * [Autocomplete](https://recycle.js.org/docs/advanced-examples/Autocomplete.html)
  * [WebSocket Echo](https://recycle.js.org/docs/advanced-examples/WebsocketEcho.html)
  * [TodoMVC](https://recycle.js.org/docs/advanced-examples/TodoMVC.html)
    * [Without Store](https://recycle.js.org/docs/advanced-examples/todomvc/TodoMVCNoPlugin.html)
    * [With Store](https://recycle.js.org/docs/advanced-examples/todomvc/TodoMVCStore.html)
    * [Isolated Reducers](https://recycle.js.org/docs/advanced-examples/todomvc/TodoMVCStoreIsolated.html)
    * [Redux](https://recycle.js.org/docs/advanced-examples/todomvc/TodoMVCRedux.html)

### API Reference
  * [Component](https://recycle.js.org/docs/api-reference/Component.html)
  * [Recycle RxJS Operators](https://recycle.js.org/docs/api-reference/recycleRxjsOperators.html)
  * [Plugins](https://recycle.js.org/docs/api-reference/Plugins.html)