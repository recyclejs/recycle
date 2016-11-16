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

  render (jsx) {
    // when used inside Recycle component
    // jsx handler will be passed in render method of a react component
    return (
      <span>
        {this.state.timesClicked}
        <button onClick={this.handleClick}>Click me</button>
      </span>
    )
  }
}
