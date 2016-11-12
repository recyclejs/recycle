function SingleCounter() {
  return {
    initialState: {
      timesClicked: 0,
    },

    actions: function actions(sources) {
      const button = sources.DOM.select('button')

      return [
        button.events('click')
          .mapTo({ type: 'buttonClicked' }),
      ]
    },

    reducers: function reducers(sources) {
      return [
        sources.actions
          .filterByType('buttonClicked')
          .reducer(function increment(state) {
            state.timesClicked++;
            return state
          }),
      ]
    },

    view: function view(state, props, jsx) {
      return (
        <div>
          <span>Times clicked: {state.timesClicked}</span>
          <button>Click me</button>
        </div>
      )
    },
  }
}

export default function SingleCounterContainer(props) {
  return {
    storePath: 'test',

    actions: (sources, props) => {
      return sources.childrenActions
    },

    view: (state, props, jsx) => {
      return <SingleCounter {...props} />
    },
  }
}
