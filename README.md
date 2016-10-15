# ReCycle

A functional and reactive JavaScript framework for creating components where View is a visual representation of the state which can be changed by reducers reacting to actions.

```javascript
const ReCycle = leverage('Cycle.js')
  .forCreatingComponents()
  .thatResambles('React')
  .and('Redux') 
  .using('RxJS') //or xstream   
```

## Table of Contents
1. [Installation](#installation)
1. [JSX and hyperscript](#jsx-and-hyperscript)
1. [Comparison with React/Redux](#comparison-with-reactredux)
  1. [Functional](#functional)
  1. [Reactive](#reactive)
1. [Comparison with Cycle.js](#comparison-with-cyclejs)
1. [Reducer-View-Actions](#reducer-view-actions)
1. [Examples](#examples)
  1. [Simple Component](#simple-component)
  1. [Stateful Component](#stateful-component)
  1. [Application](#application)
  1. [Component with actions](#component-with-actions)
  1. [TodoMVC](#todomvc)
1. [Why CSS selectors for querying DOM events?](#why-css-selectors-for-querying-dom-events)


## Installation
```
npm install --save recyclejs
```
For working with observables, ReCycle requires an adapter. 

If you are working with RxJS 
```
npm install --save recycle-rxjs
```

If you are working with xstream
```
npm install --save recycle-xstream
```

## JSX and hyperscript
For views, ReCycle uses [snabbdom](https://github.com/snabbdom/snabbdom). That means you can use [hyperscript](https://github.com/ohanhi/hyperscript-helpers) or [JSX](https://github.com/yelouafi/snabbdom-jsx)

## Comparison with React/Redux

Description of this framework probably sounds familiar especially if you already know [React](https://github.com/facebook/react) and [Redux](https://github.com/reactjs/redux). 
But there are two main keywords which make it different: *functional* and *reactive*.

### Functional
Components (in React and ReCycle) can be fully described in three parts: 
  - view (rerenering itself on state change)
  - defining actions (mouse clicks, keyboard, etc.)
  - handling state (usually reacting to user actions)

Because of its imperative nature, in React, these three parts are impossible to separate from each other. A logic for handling state (using `this.setState`) or forwarding actions to parent component is defined in "helper callbacks" of a `render` method (which binds actions and view together).

### Reactive
To separate view, actions and reducers (for handing state) it's necessary to deal with the asynchronous aspect of the component and not just the synchronous one. So rather than letting libraries like React handle this for you (by defining event handlers inline), ReCycle uses Observables.

In addition to handling user interactions, we can use Observables for other async operations as well (AJAX, animations, WebSockets, etc.) which means you will no longer need something like [thunk](https://github.com/gaearon/redux-thunk) or [redux saga](https://github.com/yelouafi/redux-saga).

Observables are proposed for ES7 but in the meantime you can use [RxJS](https://github.com/ReactiveX/rxjs) or [xstream](https://github.com/staltz/xstream).

## Comparison with Cycle.js
Under the hood, ReCycle uses [Cycle.js](https://github.com/cyclejs/cyclejs). In fact, the whole codebase of ReCycle has about 200 LOC. Still, its purpose and usage are different. 

Cycle.js is much more flexible then ReCycle. Since ReCycle is only concerned with defining components, there is no main function, no drivers for dealing with side effects and much less "stream wiring" (since ReCycle does that for you).

Also instead of `model-view-intent`, ReCycle has a similar pattern but named differently due to a resemblance to React and Redux: `reducer(model)-view-actions.`

So, you can think of ReCycle as an opinionated version of Cycle.js

## Reducer-View-Actions
To recap, ReCycle component consist of:
  - View - responsible only for declaring how state is visually represented. It is not aware of user inputs such as mouse operations and keystrokes
  - Actions - generates actions from sources (like DOM) or from actions of child components.
  - Reducers - creates a new state based on actions or sources 

## Examples
It is advisable to seprate view, actions and reducers in their own files, but for simplicity, in examples provied here they are declared together. 

Examples here are the same as in [React homepage](https://facebook.github.io/react/) so you can compare the two.

```javascript
import ReCycle from 'recyclejs';
import rxjsAdapter from 'recycle-rxjs';
// import xstreamAdapter from 'recycle-xstream

const app = ReCycle(rxjsAdapter, '#demo');
```

### Simple Component
```javascript
const HelloMessage = (props) => ({
  view: (state) => (
    <div>Hello {props.name}</div>
  )
})

app.render(HelloMessage('John'))
```

### Stateful Component

```javascript
const Timer = () => ({
  initialState: {
    secondsElapsed: 0
  },
  reducer: () => [
    Observable.interval(1000).map(i =>
      // return new state every 1000ms
      function (state) {
        state.secondsElapsed++
        return state
      })
  ],
  view: (state) => (
    <div>Seconds Elapsed: {state.secondsElapsed}</div>
  )
})

app.render(Timer())
```
### Application
This example uses state to track the current list of items as well as the text that the user has entered

```javascript
const TodoApp = () => ({
  children: { TodoList },

  initialState: {
    items: [],
    title: ''
  },

  reducer: (actions, sources) => [
    sources.$('form').events('submit')
      .map(ev => ev.preventDefault())
      .map(ev =>
        function (state) {
          state.items = state.items.concat({
            text: state.title,
            id: Date.now()
          })
          state.title = ''
          return state
        }),

    sources.$('input').events('keyup')
      .map(ev => ev.target.value)
      .map(title =>
        function (state) {
          state.title = title
          return state
        })
  ],

  view: (state, children) => (
    <div>
      <h3>TODO</h3>
      { children.TodoList(state.items) }
      <form>
        <input hook={onUpdate(elm => elm.value = state.title)} />
        <button>{'Add #' + (state.items.length + 1) }</button>
      </form>
    </div>
  )
})

```
```javascript
const TodoList = (items) => ({
  view: () => (
    <ul>
      {items.map(item => (
        <li key={item.id}>{item.text}</li>
      )) }
    </ul>
  )
})

app.render(TodoApp())
```
In case you need to force input value like React does when declaring `value={state.text}`, you can use hooks to get DOM element and do it yourself like in this example.
The same hooks can be used for using external plugins.

### Component with actions
As you can see, to create a new state, reducer can listen to sources (DOM) directly. But it is advisable to use actions for that. In this way, all async operations would be declared in one place and more importantly, they can be used in a parent component.
Here is an example of a Todo component that is part of a TodoMVC app:

```javascript
// Todo/index.js

import actions from './actions';
import view from './view';
import reducer from './model';

export default function Todo(props) {
  return {
    initialState: {
      editing: false
    },
    reducer,
    actions: (sources) => actions(sources, props),
    view: (state) => view(state, props)
  }
}
```

```javascript
// Todo/actions.js

export default (sources, props) => [
  sources.$('.destroy').events('click')
    .mapTo({ type: 'destroy', id: props.id }),

  sources.$('.toggle').events('change')
    .mapTo({ type: 'toggle', id: props.id }),

  sources.$('label').events('dblclick')
    .mapTo({ type: 'startEdit', id: props.id }),

  sources.$('.edit').events('keyup')
    .filter(ev => ev.keyCode === ESC_KEY)
    .mapTo({ type: 'doneEdit', id: props.id }),

  sources.$('.edit').events('blur', true)
    .mapTo({ type: 'doneEdit', id: props.id }),

  sources.$('.edit').events('keyup')
    .filter(ev => ev.keyCode === ENTER_KEY)
    .let(s => Observable.merge(s, sources.$('.edit').events('blur', true)))
    .filter(ev => ev.target.value !== props.title)
    .map(ev => ({ title: ev.target.value, type: 'titleChanged', id: props.id}))
]
```

```javascript
// Todo/model.js

export default (actions) => [
  actions
    .filter(action => action.type === 'startEdit')
    .map(action =>
      function setEditing(state) {
        state.editing = true;
        return state
      }),

  actions
    .filter(action => action.type === 'doneEdit')
    .map(action =>
      function removeEditing(state) {
        state.editing = false;
        return state
      }),
]
```

```javascript
// Todo/view.js

export default ({editing}, {completed, title}) => (
  <li className={'todoRoot ' + classNames({ completed, editing }) }>
    <div className='view'>
      <input className='toggle' type='checkbox' checked={completed} />
      <label>{title}</label>
      <button className='destroy'/>
    </div>
    <input className='edit' type='text' value={title} hook={onUpdate(elm => elm.focus())} />
  </li>
)
```

### TodoMVC
To see how are these actions are used in parent component, check the whole implementation:

  - [TodoMVC using RxJS](https://github.com/recyclejs/todomvc-rxjs)
  - [TodoMVC using xstream](https://github.com/recyclejs/todomvc-xstream)

## Why CSS selectors for querying DOM events?
Besides from using Observables, probably the biggest difference from React is the fact that CSS selectors are used for defining actions. In [Cycle.js documentation](https://cycle.js.org/model-view-intent.html) there is a good explanation on this issue:

Some programmers get concerned about `DOM.select(selector).events(eventType)` being a bad practice because it resembles spaghetti code in jQuery-based programs. They would rather prefer the virtual DOM elements to specify handler callbacks for events, such as `onClick={this.handleClick()}`.

The choice for selector-based event querying in Cycle DOM is an informed and rational decision. This strategy enables MVI to be reactive and is inspired by the [open-closed principle](https://en.wikipedia.org/wiki/Open/closed_principle).

If we had Views with `onClick={this.handleClick()}`, it would mean Views would not be anymore a simple translation from digital model to user mental model, because we also specify what happens as a consequence of the user’s actions. To keep all parts in a Cycle.js app reactive, we need the View to simply declare a visual representation of the Model. Otherwise the View becomes a Proactive component. It is beneficial to keep the View responsible only for declaring how state is visually represented: it has a [single responsibility](https://en.wikipedia.org/wiki/Single_responsibility_principle) and is friendly to UI designers. It is also conceptually aligned with the [original View in MVC](http://heim.ifi.uio.no/~trygver/1979/mvc-2/1979-12-MVC.pdf): “… *a view should never know about user input, such as mouse operations and keystrokes.*”

Adding user actions shouldn’t affect the View. If you need to grab new kinds of events from the element, you don’t need to modify code in the View. The View stays untouched, and it should, because translation from state to DOM hasn’t changed.

The MVI strategy in Cycle DOM is to name most elements in your View with appropriate semantic classnames. Then you do not need to worry which of those can have event handlers, if all of them can. The classname is the common artifact which the View and Actions can use to refer to the same element.

Also, it is worth mentioning, in ReCycle all components are isolated by default so there is no risk of global className colisions.