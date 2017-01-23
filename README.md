# Recycle

Recycle is a functional and reactive library for managing components.

With the official *React driver* (enabled by default), 
it can be used as a [React](https://facebook.github.io/react) component,
giving you the ability to use [FRP paradigm](https://en.wikipedia.org/wiki/Functional_reactive_programming)
for designing your apps.

[![npm version](https://img.shields.io/npm/v/recyclejs.svg?style=flat-square)](https://www.npmjs.com/package/recyclejs)
[![npm downloads](https://img.shields.io/npm/dm/recyclejs.svg?style=flat-square)](https://www.npmjs.com/package/recyclejs)

## Why?
* Greater separation of concerns - UI designers and JavaScript developers can live more peacefully
* It's functional - all components can be defined without the use of classes
* It's reactive - async operations are handled with [Observables](https://www.youtube.com/watch?v=XRYN2xt11Ek) (which is why they are built for)
* It's fast - even though selecting nodes looks like [query selectors](https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector), Recycle uses React's inline event handlers
* No need for another framework - use it as any other React component
* Use Observables for dispatching actions to [Redux](http://redux.js.org) store (using official *Redux driver*)

## How does it look like?
Example of converting React component to Recycle:
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