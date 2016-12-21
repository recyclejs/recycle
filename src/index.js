import React from 'react'
import { findDOMNode } from 'react-dom'
import { Subject } from 'rxjs/Subject'
import { Observable } from 'rxjs/Observable'
import 'rxjs/add/observable/merge'
import 'rxjs/add/observable/fromEvent'
import 'rxjs/add/operator/withLatestFrom'
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/mapTo'
import 'rxjs/add/operator/do'
import 'rxjs/add/operator/share'
import 'rxjs/add/operator/switch'
import 'rxjs/add/operator/filter'
import 'rxjs/add/operator/merge'
import createRecycle from './recycle'

export default (props, publicContext, updateQueue) => {
  if (!props || !props.root) {
    throw new Error('Missing root component for initializing Recycle')
  }

  const recycle = createRecycle({
    React,
    findDOMNode,
    Observable,
    Subject
  })

  if (props.plugins) {
    applyPlugins(recycle, props.plugins)
  }

  // if Recycle was called as react component
  // return React element
  if (updateQueue && updateQueue.isMounted) {
    return React.createElement(toReact.call(recycle, props.root, props.props), props.props)
  }

  // if Recycle was called idependently
  // return React component
  return toReact.call(recycle, props.root, props.props)
}

function toReact (Component, props) {
  if (this.getRootComponent()) {
    throw new Error('Root component already exists. toReact can be used once per recyle instance.')
  }
  return this.createComponent(Component, props).getReactComponent()
}

function applyPlugins (recycle, pluginsArr) {
  if (!Array.isArray(pluginsArr)) {
    throw new Error('Plugins must be defined in an array.')
  }

  const plugins = {}
  recycle.getPlugin = name => plugins[name]

  pluginsArr.map((m) => {
    const instance = m(recycle)
    const name = (instance && instance.name) ? instance.name : 'plugin-' + Math.random()
    plugins[name] = instance
    return false
  })
}
