## Motivation

### Declarative Programming
> Applications, especially on the web have changed over the years from being a simple static page, 
> to DHTML with animations, to the Ajax revolution. 
> Each time, we're adding more complexity, more data, and asynchronous behavior to our applications. 
> How do we manage it all? 
> -- <cite>[RxJS docs](https://github.com/Reactive-Extensions/RxJS#the-need-to-go-reactive)</cite>

After it's rendered, React component can update itself when the new state is applied (usually by calling `this.setState`).
This can be done periodically, on `click` or `mouseOver` event, on network request, etc.

Whatever the case may be, applying a new state is always done asynchronously.

Calling `this.setState` is an [**imperative**](https://en.wikipedia.org/wiki/Imperative_programming) way of managing this asynchronous behavior.
But for this problem, in contrast to imperative, Recycle is promoting a [**declarative way**](https://en.wikipedia.org/wiki/Declarative_programming).

But, before we start writing our components declaratively,
we need to change the way we are defining React components.

### Separating Logic and Structure
In React apps, a component is used for visually presenting a part of the application (**component structure**),
but also for defining what happens as a consequence of the user’s actions (**component logic**).

A component structure and a component logic are two very different things.
They are usually written using different syntax (JSX/JavaScript), and 
often maintained by separated teams (programmers/designers).

But, in a `render` method of a React component, these two parts are mixed together:

<img src="https://cloud.githubusercontent.com/assets/1868852/21597508/20e56ee4-d14c-11e6-8399-73f9a326d0b5.png" width="530" />


In Recycle, render is separated in:
  - view (presentational - )
  - reducers and actions (behavioral)
