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
  const originalCreateElement = React.createElement
  customRxOperators(Rx)

  class RecycleComponent extends React.Component {
    componentWillMount () {
      this.listeners = []
      this.nodeStreams = []

      this.sources = {
        select: registerListeners(this.listeners, 'tag'),
        selectClass: registerListeners(this.listeners, 'class'),
        selectId: registerListeners(this.listeners, 'id'),
        lifecycle: new Rx.Subject(),
        state: new Rx.Subject(),
        props: new Rx.Subject()
      }

      this.componentState = {...component.initialState}

      // create redux store stream
      if (this.context && this.context.store) {
        const store = this.context.store
        this.sources.store = new Rx.BehaviorSubject(store.getState())
        store.subscribe(() => {
          this.sources.store.next(store.getState())
        })
      }

      // dispatch events to redux store
      if (component.dispatch && this.context && this.context.store) {
        const events$ = Rx.Observable.merge(...forceArray(component.dispatch(this.sources)))
        this.__eventsSubsription = events$.subscribe((a) => {
          this.context.store.dispatch(a)
        })
      }

      // handling component state with update() stream
      this.state = this.componentState
      if (component.update) {
        const state$ = Rx.Observable.merge(...forceArray(component.update(this.sources)))
        this.__stateSubsription = state$.subscribe(newVal => {
          if (this.__componentMounted) {
            this.componentState = shallowClone(newVal.reducer(this.componentState, newVal.event))
          } else {
            this.componentState = newVal.reducer(this.componentState, newVal.event)
          }
          this.setState(this.componentState)
        })
      }

      if (component.effects) {
        const effects$ = Rx.Observable.merge(...forceArray(component.effects(this.sources)))
        this.__effectsSubsription = effects$.subscribe(function () {
          // intentionally empty
        })
      }
    }

    componentDidMount () {
      this.__componentMounted = true
      this.sources.lifecycle.next('componentDidMount')
    }

    componentDidUpdate () {
      updateNodeStreams(this.listeners, this.nodeStreams)
      this.sources.state.next(this.componentState)
      this.sources.props.next(this.props)
      this.sources.lifecycle.next('componentDidUpdate')
    }

    componentWillUnmount () {
      this.sources.lifecycle.next('componentWillUnmount')
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
      this.nodeStreams = []
      React.createElement = customCreateElement(this.listeners, this.nodeStreams, originalCreateElement)
      const view = component.view(this.props, this.componentState)
      React.createElement = originalCreateElement

      updateNodeStreams(this.listeners, this.nodeStreams)
      this.sources.state.next(this.componentState)
      this.sources.props.next(this.props)

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
