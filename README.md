# Recycle

Recycle is a functional and reactive library for [React](https://facebook.github.io/react).

With Recycle you can create your components using [FRP paradigm](https://en.wikipedia.org/wiki/Functional_reactive_programming).

[![npm version](https://img.shields.io/npm/v/recyclejs.svg?style=flat-square)](https://www.npmjs.com/package/recyclejs)
[![npm downloads](https://img.shields.io/npm/dm/recyclejs.svg?style=flat-square)](https://www.npmjs.com/package/recyclejs)

## Install
```bash
npm i --save recyclejs
```

## Why?
* Greater separation of concerns - component logic and component view are separated
* It's functional - all components can be defined without the use of classes
* It's reactive - async operations are handled with [Observables](https://www.youtube.com/watch?v=XRYN2xt11Ek) (which is why they are built for)
* It's fast - even though selecting nodes looks like [query selectors](https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector), Recycle uses React's inline event handlers and doesn't rely on DOM
* Separate side effects from components
* No need for another framework - use it as any other React component
* Use Observables for dispatching actions to [Redux](http://redux.js.org) store (using official *Redux driver*)

## How does it look like?
Example of converting React component to Recycle:
<img src="https://cloud.githubusercontent.com/assets/1868852/21557750/279d54ea-ce31-11e6-81f3-e1da977dab6b.gif" style="border: 5px solid #1e1e1e" alt="Recycle example" width="600" />

## Documentation

### [https://recycle.js.org](https://recycle.js.org)