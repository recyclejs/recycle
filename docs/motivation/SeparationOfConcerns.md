# Separation of Concerns

## Structure and Logic
> Components let you split the UI into independent, reusable pieces, and think about each piece in isolation.
> -- <cite>[React docs](https://facebook.github.io/react/docs/react-component.html)</cite>

There are two main aspects of every component:
* A component **structure** - defining how should a piece of the UI be visually presented.
* A component **logic** - defining what happens as a consequence of the user’s actions (a component behavior).

Because these are two very different things, 
each part is usually written with a different syntax (JSX/JavaScript),
and often maintained by separated teams (programmers/designers).

Yet, in a `render` method of a React component, these two parts are mixed together:

<img src="https://cloud.githubusercontent.com/assets/1868852/21963068/844bad54-db33-11e6-9567-9fba24ca4c4d.png" width="650" />

Defining components this way is manageable, but it's also a bit cumbersome.

### What is the alternative?
The reason why React proposed this concept is not because it's convenient, but because it's more powerful.

Prior to React and JSX, most of the applications used HTML template language where
separating a component logic and a component structure was natural. 

But, it was not perfect. 
After React was introduced, developers had traded this separation for something more valuable - speed and composability.

> Though it looks like it, JSX isn’t a template in the sense that Handlebars and EJS are templates. 
> It’s not a simple token replace and `.innerHTML= foo` dump like so many other tools.
> JSX gets interpreted and converted to virtual DOM, which gets diffed against the real DOM. 
> Rather than rewrite the whole DOM tree, only the differences get applied.  
> That makes React renders fast.
> -- <cite>[JSX Looks Like An Abomination](https://medium.com/javascript-scene/jsx-looks-like-an-abomination-1c1ec351a918#.nf98mm22a)</cite>

Also, it handles event delegation for you. 
Rather than attaching event listeners directly to the DOM element that the user interacts with, 
React creates a single listener automatically.

> It looks like DHTML from the 90's, but under the hood, it does the right thing.

In Recycle, a component behavior is defined by specifying which node should be listened to and what should be done on user's actions.
The node is selected by class name, id or a tag. 
Although it resembles [query selectors](https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector), 
Recycle uses React's inline event handlers and doesn't rely on the DOM. 
Since selection is isolated per component, no child nodes can ever be accessed.

This way, a component structure and a component logic are separated,
and UI designers and JavaScript developers can live more peacefully.

So, it doesn't look like DHTML from the 90's, and under the hood, it still does the right thing.

## Side Effects

Apart from managing itself, a component must sometimes communicate with the "outside world".
This can be an Ajax request, a WebSocket notification or even a desktop notification.

There are [multiple ways](http://andrewhfarmer.com/react-ajax-best-practices/) to accomplish this,
but, React component itself was not built for that. 

Probably the most recommended way to solve this issue is by using [Redux](http://redux.js.org).

Redux is great for managing application state,
but it's not built for handling async behavior.
Although it's possible to create async actions using special *Redux middlewares*,
from a component standpoint, communication with Redux store is just another side effect.

Since Recycle components are declarative and all its actions can be represented as a stream,
we can make use of that stream to perform any kind of side effect.

In Recycle, a component can be observed by a parent component or by a - *driver*.
A driver is an independent layer which a component is not aware of.
Besides the ability of listening to all components, 
a driver can also provide streams, which in turn, a component can use for changing its state.

So, a component doesn't care about the way messages are delivered to the server
or whether it uses WebSockets, Ajax or if its data is stored in Redux.
Its implementation is straightforward - 
describing conditions when a component should send an action 
and how should the component state be changed when a message is received.