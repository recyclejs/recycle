import SingleCounter from './SingleCounter'

export default function MultipleCounters () {
  return {
    initialState: {
      childButtonClicked: 0
    },
    actions: function actions (sources) {
      return [
        sources.childrenActions
          .filterByType('buttonClicked')
          .mapTo({ type: 'childButtonClicked' })
      ]
    },
    reducers: function reducers (sources) {
      return [
        sources.actions
          .filterByType('childButtonClicked')
          .reducer(function increment (state) {
            state.childButtonClicked++
            return state
          })
      ]
    },
    view: function view (jsx, state, props) {
      return (
        <div>
          <div><SingleCounter key='1' /></div>
          <div><SingleCounter key='2' /></div>
          <div><SingleCounter key='3' /></div>
          <div className='message'>
            Total child button clicks: {state.childButtonClicked}
          </div>
        </div>
      )
    }
  }
}
