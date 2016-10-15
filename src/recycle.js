let DOMscope = 0

export const ReCycleComponent = ({parent, DOM, adapter, additionalSources, name}) => {

  let childrenComponents = []
  let actions$
  let childActions = adapter.makeSubject()
  let componentState

  DOM = DOM.isolateSource(DOM, ++DOMscope)
  let componentSources = Object.assign(additionalSources || {}, {
    $: (selector) => DOM.select(selector),
  })

  const updateChildActions = () => {
    if (!childrenComponents.length)
      return

    childActions.observer.next(adapter.mergeArray(
      childrenComponents
        .filter(component => component.getActionsStream())
        .map(component => component.getActionsStream())
    ))
  }

  const render = ({view, actions, reducer, children, initialState, onStateUpdate}) => {
    
    componentState = initialState

    if (actions) {
      let componentActions = actions(componentSources, adapter.flatten(childActions.stream), componentState)
      if (!Array.isArray(componentActions))
        componentActions = [componentActions]

      actions$ = adapter.mergeArray(componentActions)
    }


    let state$ = adapter.of(initialState)
    if (reducer) {
      let componentReducers = reducer(actions$, componentSources)
      if (!Array.isArray(componentReducers))
          componentReducers = [componentReducers]

      state$ = adapter.fold(
          adapter.mergeArray(componentReducers), 
          (state, reducer) => reducer(state), 
          initialState
        )
    }

    let view$ = state$
      .map(state => {
        clearChildren()

        componentState = state

        if (onStateUpdate)
          onStateUpdate(state)

        let returned
        let errNotified
        try {
          returned = view(state, wrapChildComponents(children))
        } catch(e) {
          errNotified = true
          console.error(e)
        }
        if (!errNotified && (!returned || !returned.sel)) {
          let message = 'Unsupported View'
          if (name)
            message += ' in component "'+name+'"'

          console.error(message)
        }
          

        return returned;
      })
    
    if (parent) 
      parent.updateChildActions()

    return DOM.isolateSink(view$, DOMscope)
  }

  const clearChildren = () => {
    childrenComponents = []
  }

  const addChild = (c) => {
    childrenComponents.push(c);
  }

  const getActionsStream = () => {
    return actions$;
  }
  
  const wrapChildComponents = (children) => {
    if (children) {
      let childComponents = {}
      for (let child in children) {
        childComponents[child] = function() {
          return ReCycleComponent({
            parent: thisComponent, 
            DOM, 
            adapter, 
            name: child,
            additionalSources
          }).render(children[child](...arguments))
        }
      }
      return childComponents
    }
  }

  const thisComponent = {
    render,
    updateChildActions,
    addChild,
    getActionsStream,
    clearChildren
  }

  if (parent) {
    parent.addChild(thisComponent)
  }

  return thisComponent;
}

function ReCycle(adapter, additionalSources) {
  return (rootComponent, target) => {

    function main(sources) {
      return {
        DOM: ReCycleComponent({
          DOM: sources.DOM, 
          adapter, 
          additionalSources
        }).render(rootComponent)
      }
    }

    const drivers = {
      DOM: adapter.makeDOMDriver(target)
    }

    adapter.run(main, drivers)
  }
}

export default (adapter, sources) => {
  if (!adapter)
    throw new Error('No adapter provided')

  return {
    render: ReCycle(adapter, sources)
  }
}