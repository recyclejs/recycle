import React from 'react'

export default class ReactCounter extends React.Component {
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

  render () {
    return (
      <span>
        {this.state.timesClicked}
        <button onClick={this.handleClick}>Click me</button>
      </span>
    )
  }
}
