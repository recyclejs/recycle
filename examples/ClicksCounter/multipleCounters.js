import ClicksCounter from './clicksCounter'

export default function MultipleCounters() {
  return {
    initialState: {
      childButtonClicked: 0
    },
    actions: function(sources) {
      return [
        sources.childrenActions
          .filterByType('buttonClicked')
          .mapTo({type: 'childButtonClicked'})
      ] 
    },
    reducers: function(sources) {
      return [
        sources.actions
          .filterByType('childButtonClicked')
          .reducer(function(state) {
            state.childButtonClicked++;
            return state
          })
      ]
    },
    view: function(state, props, jsx) {
      return (
        <div>
          <ul>
            <li><ClicksCounter key="1" /></li>
            <li><ClicksCounter key="2" /></li>
            <li><ClicksCounter key="3" /></li>
          </ul>
          <div className="message">
            Total child button clicks: {state.childButtonClicked}
          </div>
        </div>
      )
    }
  }
}