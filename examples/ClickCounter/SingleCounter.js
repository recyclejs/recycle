function SingleCounter() {
  return {
    initialState: {
      timesClicked: 0
    },

    actions: function(sources) {
      const button = sources.DOM('button');

      return [
        button.events('click')
          .mapTo({type: 'buttonClicked'})
      ]
    },
    
    reducers: function(sources) { 
      return [
        sources.actions
          .filterByType('buttonClicked')
          .reducer(function(state) {
            state.timesClicked++;
            return state
          })
      ]
    },

    view: function(state, props, jsx) {
      return (
        <div>
          <span>Times clicked: {state.timesClicked}</span>
          <button>Click me</button>
        </div>
      )
    }
  }
}

export default function SingleCounterContainer() {
  return {
    wrap: SingleCounter,
    
    mapStateToProps: function(storeState, ownProps) {
      return storeState
    },

    actions: function(componentActions, ownProps) {
      return componentActions
    }
  }
}