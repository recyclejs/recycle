import React from 'react'

function SingleCounter () {
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

    view: function (state, props, jsx) {
      return (
        <div>
          <span>Times clicked: {state.timesClicked}</span>
          <button>Click me</button>
        </div>
      )
    }
  }
}

export default class Bla extends React.Component {

  render (jsx) {
    // when used inside Recycle component
    // jsx handler will be passed in render method of a react component
    return (
      <SingleCounter key={this.props.id} />
    )
  }
}

function SingleCounterContainer (props) {
  return {
    storePath: 'test',

    actions: (sources, props) => {
      return sources.childrenActions
    },

    view: (state, props, jsx) => {
      return <SingleCounter />
    }
  }
}
