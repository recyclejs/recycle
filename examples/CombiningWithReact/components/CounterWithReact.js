import ReactCounter from './ReactComponent'

export default function SingleCounterWithReact () {
  return {
    initialState: {
      timesClicked: 0
    },

    actions (sources) {
      const button = sources.DOM.select('button')

      return [
        button.events('click')
          .mapTo({ type: 'buttonClicked' })
      ]
    },

    reducers (sources) {
      return [
        sources.actions
          .filterByType('buttonClicked')
          .reducer(function (state) {
            state.timesClicked++
            return state
          })
      ]
    },

    view (jsx, props, state) {
      return (
        <div>
          <div>Times clicked on Recycle component: {state.timesClicked} <button>Click me</button></div>
          <div>Times clicked on React component: <ReactCounter /></div>
        </div>
      )
    }
  }
}
