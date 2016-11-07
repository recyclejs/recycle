import MultipleCounters from './MultipleCounters'

export default function WrapMultipleCounters() {
  return {
    initialState: {
      multiplechildButtonClicked: 0,
    },
    actions: function actions(sources) {
      return [
        sources.childrenActions
          .filterByType('childButtonClicked')
          .mapTo({ type: 'multipleChildButtonClicked' }),
      ]
    },
    reducers: function reducers(sources) {
      return [
        sources.actions
          .filterByType('multipleChildButtonClicked')
          .reducer(function increment(state) {
            state.multiplechildButtonClicked++;
            return state
          }),
      ]
    },
    view: function view(state, props, jsx) {
      return (
        <div>
          <ul>
            <li><MultipleCounters key="1" /></li>
            <li><MultipleCounters key="2" /></li>
            <li><MultipleCounters key="3" /></li>
          </ul>
          <div className="message">
            Total multiple child button clicks: {state.multiplechildButtonClicked}
          </div>
        </div>
      )
    },
  }
}
