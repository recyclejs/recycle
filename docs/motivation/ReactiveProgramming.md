## Component Asynchronousity
> Applications, especially on the web have changed over the years from being a simple static page, 
> to DHTML with animations, to the Ajax revolution. 
> Each time, we're adding more complexity, more data, and asynchronous behavior to our applications. 
> How do we manage it all? 
> -- <cite>[RxJS docs](https://github.com/Reactive-Extensions/RxJS#the-need-to-go-reactive)</cite>

The most complex aspect of React apps is managing component's asynchronous behavior.
After it's rendered, React component can update itself when the new state is applied.
This can be done periodicaly, on `click` or `mouseOver` event, on network request, etc.

Whatever the case may be, applying a new state is always done asynchronously.

Since JavaScript is a multi-paradigm language, 
there is fundamentally two ways of managing this asynchronous behavior: **imperative** and **declarative**.

### Imperative Programming

```javascript
<div>
  <form onSubmit={this.handleSubmit}>
    <input onChange={this.handleChange} value={this.state.text} />
    <button>Add</button>
  </form>
</div>
```

Component state is an object which changes over time - a stream.



If we want for a component to be reactive, it must listen for events and react on it. 

In React, this is usally done by changing a component state.

After it's rendered, React component can update itself when the new state is applied (by calling `this.setState`).
This can be done periodicaly, on `click` or `mouseOver` event, on network request, etc.
Whatever the case may be, applying a new state is always done asynchronously.

As you application grows, managing this asynchronous behavior 