# Reactive Programming
> Applications, especially on the web have changed over the years from being a simple static page, 
> to DHTML with animations, to the Ajax revolution. 
> Each time, we're adding more complexity, more data, and asynchronous behavior to our applications. 
> How do we manage it all? 
> -- <cite>[RxJS docs](https://github.com/Reactive-Extensions/RxJS#the-need-to-go-reactive)</cite>

In short, Reactive programming is programming with asynchronous data streams.
You can learn more about it here: [The introduction to Reactive Programming you've been missing](https://gist.github.com/staltz/868e7e9bc2a7b8c1f754)
by Andre Stalz, or watching Jafar Husain's talk: [Async JavaScript with Reactive Extensions](https://www.youtube.com/watch?v=XRYN2xt11Ek).

But, how is this related to React?

## Streams in React Component

Although you might never have considered your components as a way of managing streams,
if you worked with React, programming with asynchronous data should be familiar.

Take for example a simple click counter component:

```javascript
class App extends React.Component {
  constructor(props) {
    this.state = { count: 0 }
  }

  onClick (e) {
    this.setState({
      count: this.state.count + 1
    })
  }

  render () {
    return (
      <div>
        <h1>{this.state.count}</h1>
        <button onClick={this.onClick.bind(this)}>Count Up!!</button>
      </div>
    )
  }
}
```

It's a component describing asynchronous behavior. On every `click` event on a `button` tag, the state is changed.
Or in other words, the state is a type of value which **changes** as a result of **events** happening **over time**.

A type of value which we might call - **a stream**. 

This is the whole point of reactive programming. 
Instead of defining `this.state` as an object which will later be overwritten, what if we can define it more declaratively?

For example:

```javascript
const state = startWith({ count: 0 })
  .select('button')
  .on('click')
  .map((state, e) => {
    state.count++
    return state
  })
```

When defined like this, everything you need to know about a component state is written in just a few lines of code.
It can be defined as a `const`, so you know it will not be mutated.

Also, a definition of the component is more straightforward.
You don't need to know how the view is implemented to get a clear picture of what a component is doing.

### What should be defined as a stream?

Most of the React components are composed of three parts:
 - rendering view
 - handling state
 - handling passed callbacks from a parent component

Definition of a view is not mutable, so there is no need for it to be defined as a stream.
In the example above, you've seen how handling state could be transformed,
but what about callbacks sent from a parent component?

Rather than being responsible for a parent's methods,
every component can describe its behavior by defining it as a stream. 

In Recycle, this stream is called `actions` and it's a form of a "*component API*".
So if a parent or any other module (like *Redux driver*) wants to leverage this *API*, 
it can subscribe to this stream rather than using [React context API](https://facebook.github.io/react/docs/context.html).

To recap, here are some of the benefits by defining async actions with streams:
- View is a pure representation of the state
- A component can be defined without delegating responsibilities to child components
- No more searching for `this.setState` statements
- No more tracing `handleClick`, `handleChange` or similar callbacks
