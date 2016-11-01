import recycleComponent from './component'
import React from 'react'
import ReactDOM from 'react-dom'

export function createReactElement(Component, jsx) {
  let key = 0
  return React.createClass({
    render() {
      key++
      let props = Object.assign({}, {key: key}, this.props)
      return jsx(Component, props)
    }
  })
}

export default function Recycle(constructor, props) {
  return React.createElement(recycleComponent(constructor).getReactComponent(), props)
}

export {
  React,
  ReactDOM
}