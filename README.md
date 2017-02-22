# Recycle

Recycle is a JavaScript library for creating modular applications using [Observable streams](http://reactivex.io/).

[![Join the chat at https://gitter.im/recyclejs](https://img.shields.io/gitter/room/nwjs/nw.js.svg?style=flat-square)](https://gitter.im/recyclejs?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![npm version](https://img.shields.io/npm/v/recyclejs.svg?style=flat-square)](https://www.npmjs.com/package/recyclejs)
[![npm downloads](https://img.shields.io/npm/dm/recyclejs.svg?style=flat-square)](https://www.npmjs.com/package/recyclejs)

## Why?
Todo: use cases which are not only related to react

## Installation
Recycle v2.0 is (while in rc stage) installed using npm tag `v2`

```bash
npm install recyclejs@v2
```

## Migrating From 1.0
Recycle has no dependencies in 2.0.
React or RxJS must be provided in `createRecycle` function.

Other than that, Recycle is the same as 1.0 but it has a different initialization process.
Rather than using only root react component (`<Recycle root={App} />`),
react components are now created using `recycle.createReactComponent`.

The main purpose of this apporach is the ability to easily create components which had
nothing to do with react.

```javascript
import React from 'react'
import Rx from 'rxjs/Rx'
import ReactDOM from 'react-dom'
import createRecycle from 'recyclejs/react'
import App from './components/App'
import ComponentWithoutView from './components/ComponentWithoutView'
import store from './drivers/store'

// creating recycle instance
const recycle = createRecycle(React, Rx)

// applying drivers
recycle.use(store)

// creating recycle components
const AppReact = recycle.createReactComponent(App)
// adding components which have no view to render
// but are still crucial for the application
// (dispatching actions from WebSocket for example)
recycle.createComponent(ComponentWithoutView)

// rendering root react component
ReactDOM.render(<WrapperReact />, document.getElementById('root'))
```

## Todo
This release will be released without `v2` tag when documentation and examples are adapted to `v2`
and more non-react examples (node.js app) are provided

## How does it look like?
Example of writing React component using Recycle:
<img src="https://cloud.githubusercontent.com/assets/1868852/22227336/192d20fe-e1cb-11e6-8c20-27218a6bc5e2.gif" style="border: 5px solid #1e1e1e" alt="Recycle example" width="600" />

## Documentation

### [https://recycle.js.org](https://recycle.js.org)