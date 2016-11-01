# Recycle

A functional and reactive JavaScript framework for creating components where View is a visual representation of the state which can be changed by reducers reacting to actions.

```javascript
// Recycle described in 5 lines:
const Recycle = leverage('Cycle.js')
  .forCreatingComponents()
  .thatResambles('React')
  .and('Redux') 
  .using('RxJS')
```

## Table of Contents
1. [Installation](#installation)
1. [Comparison with React.js](#comparison-with-reactjs)
  1. [Functional](#functional)
  1. [Reactive](#reactive)
1. [Comparison with Redux](#comparison-with-redux)
1. [Comparison with Cycle.js](#comparison-with-cyclejs)
1. [Reducer-View-Actions](#reducer-view-actions)
1. [JSX and hyperscript](#jsx-and-hyperscript)
1. [Getting Started](#getting-started)
  1. [Recycle Initialization](#recycle-initialization)
  1. [Simple Stateful Component](#simple-stateful-component)
  1. [Nested Components](#nested-components)
  1. [Nested Components using Hyperscript](#nested-components-using-hyperscript)
1. [TodoMVC](#todomvc)
1. [Why CSS selectors for querying DOM events?](#why-css-selectors-for-querying-dom-events)


## Installation
```
npm install --save recyclejs
```

## Getting Started

### Recycle Initialization
For initializing Recycle app, you need to provide a root component and sources object:

```javascript
import Recycle from 'recyclejs'
import getDOMSource from 'recyclejs/sources/dom'

Recycle({
  rootComponent: YourRootComponent(),
  sources: {
    DOM: getDOMSource('#demo'),
  }
})
```
DOM source is used for rendering component and creating observables on DOM elements inside that component (shown in examples below). If you want your component actions to react on other observable streams (for example WebSockets or URL changes stream) you can either create them inside component actions or add it as a source (which will then be accessible to all components actions and reducers)   

### Simple Stateful Component

Example of a component that is tracking how many times a button was clicked

```javascript
function Timer() {
  return {
    initialState: {
      timesClicked: 0
    },

    actions: function(sources) {
      const button = sources.DOM('button');

      return [
        // every time user clicks on a button
        // return an action with type 'buttonClicked'
        button
          .events('click')
          .mapTo({type: 'buttonClicked'})
      ]
    },
    
    reducers: function(actions) { 
      return [
        // listen to actions
        // if action type is "buttonClicked"
        // apply an reducer
        // where timesClicked is incremented
        actions
          .filterByType('buttonClicked')
          .reducer(function(state) {
            state.timesClicked++;
            return state
          })
      ]
    },

    view: function(state) {
      return (
        <div>
          <span>You pushed the button: {state.timesClicked} times</span>
          <button>Click me</button>
        </div>
      )
    }
  }
}
```

### Nested Components
Let's now reuse this component inside a parent component. 

```javascript
function MultipleTimers() {
  return {
    view: function(state) {
      return (
        <div>
          <ul>
            <li><Timer key="first" /></li>
            <li><Timer key="second" /></li>
            <li><Timer key="third" /></li>
          </ul>
        </div>
      )
    }
  }
}
// If the child component is called multiple times 
// its required to provide a `key` property.
```
Since parent component can listen to all actions dispatched by its child components, we can track the total number of clicks and increment it any time a `Timer` button is clicked.

```javascript
function MultipleTimers() {
  return {
    initialState: {
      childButtonClicked: 0
    },
    actions: function(sources, childrenActions) {
      return [
        // listen to childrenActions
        // if recievied action type is "buttonClicked"
        // (dispatched from a Timer component)
        // return an action with type 'childButtonClicked'
        childrenActions
          .filterByType('buttonClicked')
          .mapTo({type: 'childButtonClicked'})
      ] 
    },
    reducers: function(actions) {
      return [
        // listen to actions
        // if action type is "childButtonClicked"
        // apply an reducer
        // where childButtonClicked is incremented
        actions
          .filterByType('childButtonClicked')
          .reducer(function(state) {
            state.childButtonClicked++;
            return state
          })
      ]
    },
    view: function(state) {
      return (
        <div>
          <ul>
            <li><Timer key="first" /></li>
            <li><Timer key="second" /></li>
            <li><Timer key="third" /></li>
          </ul>
          <div className="message">
            Total child button clicks: {state.childButtonClicked}
          </div>
        </div>
      )
    }
  }
}
```
#### Nested Components using Hyperscript
In previous examples we used JSX for defining a view, but if you prefer Hyperscript instead, in order to render a child component you need to use a `render` function (provided as a second parameter of the view function):

```javascript
function view(state, render) {
  return div([
    ul([
      li(render(Timer(), 'first')),
      li(render(Timer(), 'second')),
      li(render(Timer(), 'third'))
    ]),
    div(".message", [`Total child button clicks: {state.childButtonClicked}`])
  ])
}
```
## TodoMVC

Recycle is easy to use for simple apps, but the real advatages of this framework can be seen when used in a more complex application. For that purpose check out [TodoMVC](https://github.com/recyclejs/TodoMVC) implementation with the addition of autocomplete feature (so you can see how much extra code is needed for accomplishing debouncing, fetching results or handling errors) 

## JSX and Hyperscript
For views, Recycle uses [snabbdom](https://github.com/snabbdom/snabbdom). Which means you can use [hyperscript](https://github.com/ohanhi/hyperscript-helpers) or [JSX](https://github.com/yelouafi/snabbdom-jsx)

JSX example:
```javascript
function view() {
  return (
    <div className="menu">
      <ul>
        <li>option #1</li>
        <li>option #2</li>
      </ul>
    </div>
  )
}
```

Hyperscript example:
```javascript
import {div, ul, li} from 'recyclejs/view'

function view() {
  return div(".menu", [
    ul([
      li(['option #1']),
      li(['option #2'])
    ])
  ])
}
```

Note that in order for JSX to work it first needs to be transpiled by something like `transform-react-jsx` from babel (with `RecycleJSX` as *pragma* option)

`.babelrc` example:
```
{
  "presets": ["es2015"],
  "plugins": [
    "syntax-jsx",
    ["transform-react-jsx", {"pragma": "RecycleJSX"}],
  ]
}
```

## Comparison with React.js

"*Component where View is a representation of the state*". 

If you know React, that should sound familiar.
But there are two main keywords in the description of Recycle that suggests its biggest difference: *functional* and *reactive*.

### Functional
Components (in React and Recycle) can be fully described in three parts: 
  - view (rerenering itself on state change)
  - defining actions (mouse clicks, keyboard, etc.)
  - handling state (usually reacting to user actions)

Because of its imperative nature, in React, these three parts are impossible to separate from each other. Since logic for handling state (using `this.setState`) or forwarding actions to parent component are defined as "helper callbacks" of a `render` method, all three parts of the component are "bundled" together in a class.

In Recycle there is no need for classes because every part of the component is defined as a function that can be logically separated.

### Reactive
To achieve this kind of separation, it's necessary to deal with the asynchronous aspect of the component and not just the synchronous one. So rather than letting libraries like React handle this for you (by using something like `onClick` inside a View), Recycle uses Observables.

As a result, components in Recycle have no `setState` function - the only way a component state can be changed is by defining reducer streams.

## Comparison with Redux
Wait... reducer inside of a component? Shouldn't this be separated?

Well, actually, it shouldn't.

Why? Because application state is nothing more than the state of a root component. It should then be handled in the same way as any other component, without the need of using multiple libraries.

In Recycle, there is no such thing as *presentational* and *container* components. There are only components.

## Comparison with Cycle.js
Under the hood, Recycle uses [Cycle.js](https://github.com/cyclejs/cyclejs) but its purpose and usage is different. 

Cycle.js is much more flexible then Recycle. Since Recycle is only concerned with defining components, there is no main function, no drivers for dealing with side effects and much less "stream wiring" (since Recycle does that for you).

Also instead of `model-view-intent`, Recycle has a similar pattern but named differently (resemblance to React and Redux): `reducers-view-actions`.

So, you can think of Recycle as an opinionated version of Cycle.js

## What about side-effects?

If we can use Observables for handling events like user clicks and keystrokes, we can also use them for all other async operations as well. 

So, for any AJAX calls, WebSockets events or similar, there is no need any special middlewear like [thunk](https://github.com/gaearon/redux-thunk) or [redux saga](https://github.com/yelouafi/redux-saga) because those are just another async operations which can be deffined in component actions.

## Reducer-View-Actions
To recap, Recycle component consist of:
  - View - responsible only for declaring how state is visually represented. It is not aware of any user inputs such as mouse operations and keystrokes
  - Actions - generates actions from sources (like DOM) or from actions of child components
  - Reducers - creates a new state based on actions or sources 

## Why CSS selectors for querying DOM events?
Besides from using Observables, probably the biggest difference from React is the fact that CSS selectors are used for defining actions. In [Cycle.js documentation](https://cycle.js.org/model-view-intent.html) there is a good explanation on this issue:

Some programmers get concerned about `sources.DOM(selector).events(eventType)` being a bad practice because it resembles spaghetti code in jQuery-based programs. They would rather prefer the virtual DOM elements to specify handler callbacks for events, such as `onClick={this.handleClick()}`.

The choice for selector-based event querying in Cycle DOM is an informed and rational decision. This strategy enables MVI to be reactive and is inspired by the [open-closed principle](https://en.wikipedia.org/wiki/Open/closed_principle).

If we had Views with `onClick={this.handleClick()}`, it would mean Views would not be anymore a simple translation from digital model to user mental model, because we also specify what happens as a consequence of the user’s actions. To keep all parts in a Cycle.js app reactive, we need the View to simply declare a visual representation of the Model. Otherwise the View becomes a Proactive component. It is beneficial to keep the View responsible only for declaring how state is visually represented: it has a [single responsibility](https://en.wikipedia.org/wiki/Single_responsibility_principle) and is friendly to UI designers. It is also conceptually aligned with the [original View in MVC](http://heim.ifi.uio.no/~trygver/1979/mvc-2/1979-12-MVC.pdf): “… *a view should never know about user input, such as mouse operations and keystrokes.*”

Adding user actions shouldn’t affect the View. If you need to grab new kinds of events from the element, you don’t need to modify code in the View. The View stays untouched, and it should, because translation from state to DOM hasn’t changed.

The MVI strategy in Cycle DOM is to name most elements in your View with appropriate semantic classnames. Then you do not need to worry which of those can have event handlers, if all of them can. The classname is the common artifact which the View and Actions can use to refer to the same element.

Also, it is worth mentioning, in Recycle all components are isolated by default so there is no risk of global className colisions.