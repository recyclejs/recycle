export default function ClicksCounter() {
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
          .filter(action => action.type == 'buttonClicked')
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