import React from 'react'

class ReactCounter extends React.Component {
  constructor (props) {
    super(props)
    this.state = { timesClicked: 0 }
    this.handleClick = this.handleClick.bind(this)
  }

  handleClick () {
    this.setState(prevState => ({
      timesClicked: prevState.timesClicked + 1
    }))
  }

  render (jsx) {
    // when used inside Recycle component
    // jsx handler will be passed in render method of a react component
    return (
      <span onClick={this.handleClick}>{this.state.timesClicked}</span>
    )
  }
}

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
          <span>Times clicked: {state.timesClicked}</span>
          <div>Times clicked on React component: <ReactCounter /></div>
          <button>Click me</button>
        </div>
      )
    }
  }
}
