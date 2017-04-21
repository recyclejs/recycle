import Rx from 'rxjs'
import ReactNpm from 'react'
import PropTypes from 'prop-types'
import forceArray from './forceArray'
import registerListeners from './registerListeners'
import customCreateElement from './customCreateElement'
import updateNodeStreams from './updateNodeStreams'
import './customRxOperators'

function recycle (component, React) {
  // support for "non npm" React instance
  // (usefull when debugging with npm link)
  if (!React) {
    React = ReactNpm
  }

  const originalCreateElement = React.createElement
  const listeners = []
  let nodeStreams = []

  const sources = {
    select: registerListeners(listeners, 'tag'),
    selectClass: registerListeners(listeners, 'class'),
    selectId: registerListeners(listeners, 'id')
  }

  class RecycleComponent extends React.Component {
    componentWillMount () {
      // create redux store stream
      if (this.context && this.context.store) {
        const store = this.context.store
        sources.store = new Rx.BehaviorSubject(store.getState())
        store.subscribe(function () {
          sources.store.next(store.getState())
        })
      }

      // dispatch events to redux store
      if (component.dispatch && this.context && this.context.store) {
        const events$ = Rx.Observable.merge(...forceArray(component.dispatch(sources)))
        this.__eventsSubsription = events$.subscribe((a) => {
          this.context.store.dispatch(a)
        })
      }

      // handling component state with update() stream
      this.state = component.initialState
      if (component.update) {
        const state$ = Rx.Observable.merge(...forceArray(component.update(sources)))
        this.__stateSubsription = state$.subscribe(newVal => {
          if (this.__componentMounted) {
            this.setState(newVal.reducer(this.state, newVal.event))
          } else {
            this.state = newVal.reducer(this.state, newVal.event)
          }
        })
      }
    }

    componentDidMount () {
      this.__componentMounted = true
      updateNodeStreams(listeners, nodeStreams)
    }

    componentDidUpdate () {
      updateNodeStreams(listeners, nodeStreams)
    }

    componentWillUnmount () {
      if (this.__stateSubsription) {
        this.__stateSubsription.unsubscribe()
      }
      if (this.__eventsSubsription) {
        this.__eventsSubsription.unsubscribe()
      }
    }

    render () {
      nodeStreams = []
      React.createElement = customCreateElement(listeners, nodeStreams, originalCreateElement)
      const view = component.view(this.props, this.state)
      React.createElement = originalCreateElement
      return view
    }
  }

  RecycleComponent.contextTypes = {
    store: PropTypes.object
  }
  RecycleComponent.propTypes = component.propTypes
  RecycleComponent.displayName = component.displayName

  return RecycleComponent
}

export default recycle
