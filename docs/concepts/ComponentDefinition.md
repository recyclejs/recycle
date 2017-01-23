# Component Definition

In Recycle, a component is defined by:

- **view** - a component structure. Equivalent of React `render` method but containing only visual presentation data
- **initialState** - Object defining component's initial state
- **reducers** - Observables which are changing component's state
- **actions** - Observables describing component's behaviour which other parts of the application can make use of. Think of it as a *component API* 

Additionally, if using *React driver*, a component can also provide properties like
`propTypes`, `shouldComponentUpdate`, `componentWillUnmount`, etc.
A list of available hooks is defined [here](/docs/api-reference/Component.md).

```javascript
function RecycleComponent (props) {
  return {
    initialState: { 
      something: props.value 
    },
    reducers (sources) {},
    actions (sources) {},
    view (props, state) {}
  }
}
```

A Recycle component can be used just like React component,
by defining it in a view (or in React `render` method):

```html
<div>
  <RecycleComponent prop='myprop' />
</div>
```
