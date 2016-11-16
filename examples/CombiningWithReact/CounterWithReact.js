import ReactCounter from './ReactComponent'

export default function SingleCounterWithReact () {
  return {
    initialState: {
      timesClicked: 0
    },

    actions: function (sources) {
      const button = sources.DOM.select('button')

      return [
        button.events('click')
          .mapTo({ type: 'buttonClicked' })
      ]
    },

    reducers: function (sources) {
      return [
        sources.actions
          .filterByType('buttonClicked')
          .reducer(function (state) {
            state.timesClicked++
            return state
          })
      ]
    },

    view: function (jsx, state, props) {
      return (
        <div>
          <div>Times clicked on Recycle component: {state.timesClicked} <button>Click me</button></div>
          <div>Times clicked on React component: <ReactCounter /></div>
        </div>
      )
    }
  }
}
