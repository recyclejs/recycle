import PropTypes from 'prop-types'
import forceArray from './forceArray'
import shallowClone from './shallowClone'
import customRxOperators from './customRxOperators'
import _makeUpdateNodeStreams from './updateNodeStreams'
import _makeRegisterListeners from './registerListeners'
import _makeCustomCreateElement from './customCreateElement'

export default (React, Rx) => function recycle (component) {
  const customCreateElement = _makeCustomCreateElement(Rx)
  const registerListeners = _makeRegisterListeners(Rx)
  const updateNodeStreams = _makeUpdateNodeStreams(Rx)
  customRxOperators(Rx)

  const originalCreateElement = React.createElement
  const listeners = []
  let nodeStreams = []

  const sources = {
    select: registerListeners(listeners, 'tag'),
    selectClass: registerListeners(listeners, 'class'),
    selectId: registerListeners(listeners, 'id'),
    lifecycle: new Rx.Subject(),
    state: new Rx.Subject(),
    props: new Rx.Subject()
  }

  let componentState = component.initialState
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
      this.state = componentState
      if (component.update) {
        const state$ = Rx.Observable.merge(...forceArray(component.update(sources)))
        this.__stateSubsription = state$.subscribe(newVal => {
          if (this.__componentMounted) {
            componentState = shallowClone(newVal.reducer(componentState, newVal.event))
            this.setState(componentState)
          } else {
            componentState = newVal.reducer(componentState, newVal.event)
          }
        })
      }

      if (component.effects) {
        const effects$ = Rx.Observable.merge(...forceArray(component.effects(sources)))
        this.__effectsSubsription = effects$.subscribe(function () {
          // intentionally empty
        })
      }
    }

    componentDidMount () {
      this.__componentMounted = true
      updateNodeStreams(listeners, nodeStreams)
      sources.state.next(componentState)
      sources.props.next(this.props)
      sources.lifecycle.next('componentDidMount')
    }

    componentDidUpdate () {
      updateNodeStreams(listeners, nodeStreams)
      sources.state.next(componentState)
      sources.props.next(this.props)
      sources.lifecycle.next('componentDidUpdate')
    }

    componentWillUnmount () {
      sources.lifecycle.next('componentWillUnmount')
      if (this.__stateSubsription) {
        this.__stateSubsription.unsubscribe()
      }
      if (this.__eventsSubsription) {
        this.__eventsSubsription.unsubscribe()
      }
      if (this.__effectsSubsription) {
        this.__effectsSubsription.unsubscribe()
      }
    }

    render () {
      nodeStreams = []
      React.createElement = customCreateElement(listeners, nodeStreams, originalCreateElement)
      const view = component.view(this.props, componentState)
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
