## Adapter
For creating a Recycle instance, you need to provide an adapter.

Recycle provides a default adapter using [React](https://facebook.github.io/react/) and [RxJS](https://github.com/ReactiveX/rxjs), and its [implementation](https://github.com/recyclejs/recycle/blob/master/src/adapter/react-rxjs.js) looks like this:

```javascript
import React from 'react'
import ReactDOM from 'react-dom'
import { Subject } from 'rxjs/Subject'
import { Observable } from 'rxjs/Observable'
import 'rxjs/add/observable/merge'
import 'rxjs/add/observable/fromEvent'
import 'rxjs/add/operator/withLatestFrom'
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/mapTo'
import 'rxjs/add/operator/do'
import 'rxjs/add/operator/share'
import 'rxjs/add/operator/switch'
import 'rxjs/add/operator/filter'
import 'rxjs/add/operator/merge'

export default {
  BaseComponent: React.Component,
  createElement: React.createElement,
  findDOMNode: ReactDOM.findDOMNode,
  render: ReactDOM.render,
  Observable,
  Subject
}
```

## Extending Observable Object
As you can see, a default adapter uses a minimal set of operators from RxJS. But that may not be enough, so in case you require additional operators, you can either extend the default one or create your own adapter.

### Extending default adapter
If you choose to extend a default adapter you can use something like this:

```javascript
import adapter from 'recyclejs/adapter/react-rxjs'
import 'rxjs/add/operator/debounceTime'
import 'rxjs/add/operator/switchMap'
```

In your `actions` and `reducers` of any component, you will now be able to use `debounceTime` and `switchMap` operators.

### Creating a new adapter
Another option is to create your own adapter where you can import the whole `Rx` library including all RxJS operators (but note that this will result in a larger file size):

```javascript
import React from 'react'
import ReactDOM from 'react-dom'
import Rx from 'rxjs'

export default {
  BaseComponent: React.Component,
  createElement: React.createElement,
  findDOMNode: ReactDOM.findDOMNode,
  render: ReactDOM.render,
  Observable: Rx.Observable,
  Subject: Rx.Subject
}
```
