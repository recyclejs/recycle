# Recycle

Recycle is a JavaScript library for creating modular applications using [Observable streams](http://reactivex.io/).

With the official *React driver*, 
it can be used as a [React](https://facebook.github.io/react) component,
giving you the ability to leverage the power of [RxJS](https://github.com/ReactiveX/rxjs)
for designing your apps.

[![Join the chat at https://gitter.im/recyclejs](https://img.shields.io/gitter/room/nwjs/nw.js.svg?style=flat-square)](https://gitter.im/recyclejs?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![npm version](https://img.shields.io/npm/v/recyclejs.svg?style=flat-square)](https://www.npmjs.com/package/recyclejs)
[![npm downloads](https://img.shields.io/npm/dm/recyclejs.svg?style=flat-square)](https://www.npmjs.com/package/recyclejs)

## Why?
* Use [Observables](http://reactivex.io) for managing async behavior
* Greater separation of concerns
* Better component decoupling
* Manage side effects outside a component definition
* Use Observables for dispatching actions to [Redux](http://redux.js.org) store
* No need for another framework - use it as any other React component

## How does it look like?
Example of writing React component using Recycle:
<img src="https://cloud.githubusercontent.com/assets/1868852/22227336/192d20fe-e1cb-11e6-8c20-27218a6bc5e2.gif" style="border: 5px solid #1e1e1e" alt="Recycle example" width="600" />

## Quick Start
The easiest way to get started with Recycle is to use [Create React App](https://github.com/facebookincubator/create-react-app)

```bash
npm install -g create-react-app

create-react-app my-app
cd my-app/
```

When your application is initialized you can install Recycle:

```bash
npm install --save recyclejs
```

Create Recycle instance by defining its root component:

```javascript
import React from 'react'
import ReactDOM from 'react-dom'
import Recycle from 'recyclejs'
import ClickCounter from './ClickCounter'

ReactDOM.render(
  <Recycle root={ClickCounter} />,
  document.getElementById('root')
)
```

Create a new file, `src/ClickCounter.js`:

```javascript
import React from 'react';

function ClickCounter () {
  return {
    initialState: { 
      timesClicked: 0 
    },

    reducers (sources) {
      return [
        sources.select('button')
          .on('click')
          .reducer(function (state) {
            state.timesClicked++
            return state
          })
      ]
    },

    view (props, state) {
      return (
        <div>
          <span>Times clicked: {state.timesClicked}</span>
          <button>Click me</button>
        </div>
      )
    }
  }
}

export default ClickCounter;
```

### Starting Application

You can now run your app:
```bash
npm start
```

## Documentation

### [https://recycle.js.org](https://recycle.js.org)