import { shallowClone } from '../recycle'

const ANY_EVENT = 'ANY_EVENT'

export default React => (recycle, streamAdapter) => {
  const { Observable, Subject } = streamAdapter
  const $$typeofReactElement = React.createElement(function() {}).$$typeof
  const createElement = React.createElement

  recycle.on('componentInit', component => {
    let registeredNodeStreams = component.getPrivate('registeredNodeStreams') || []

    component.set('ReactComponent', createReactComponent(component))

    component.setSource('select', registerNodeStream(registeredNodeStreams, 'tag'))
    component.setSource('selectClass', registerNodeStream(registeredNodeStreams, 'class'))
    component.setSource('selectId', registerNodeStream(registeredNodeStreams, 'id'))
    component.setSource('state', new Subject())
    component.setSource('props', new Subject())

    component.setPrivate('registeredNodeStreams', registeredNodeStreams)

    if (component.get('initialState') !== undefined) {
      component.replaceState(component.get('initialState'))
    }

    if (!component.getPrivate('children')) {
      component.setPrivate('children', new Map())
    }
  })

  recycle.on('componentDidMount', component => {
    updateNodeStreams(component)
    updateStatePropsReference(component)
  })

  recycle.on('componentUpdate', component => {
    updateNodeStreams(component)
    updateStatePropsReference(component)
  })

  recycle.on('beforeRender', component => {
    let timesRendered = component.getPrivate('timesRendered') || 0
    timesRendered++
    component.setPrivate('timesRendered', timesRendered)
    component.set('currentNodeStreams', [])

    function jsxHandler () {
      const currentNodeStreams = component.get('currentNodeStreams')
      let selectors = getNodeSelectors(arguments['0'], arguments['1'])
      let returnValue = (arguments['1']) ? arguments['1'].return : undefined

      if (arguments['1'] && arguments['1'].return !== undefined) {
        delete arguments['1'].return
      }

      const setNodeStream = (child) => {
        selectors.forEach(({ selectorType, selector }) => {
          component.getPrivate('registeredNodeStreams')
            .filter(ref => ref.selector === selector)
            .filter(ref => ref.selectorType === selectorType)
            .forEach(registredRef => {
              let ref = {
                selector,
                selectorType,
                event: registredRef.event
              }
              if (child) {
                ref.stream = child.getActions()
                  .filter(a => a.type === ref.event || ref.event === ANY_EVENT)
                  .map(event => ({ event }))
              } else if (typeof arguments['1'][ref.event] === 'function') {
                ref.stream = new Subject()
                let customFunction = arguments['1'][ref.event]
                arguments['1'][ref.event] = function () {
                  let event = customFunction.apply(this, arguments)
                  ref.stream.next({ event, value: returnValue })
                }
              } else {
                ref.stream = new Subject()
                const reactEvent = getEventHandler(ref.event) || ref.event
                arguments['1'][reactEvent] = function () {
                  let event = arguments['0']
                  ref.stream.next({ event, value: returnValue })
                }
              }
              currentNodeStreams.push(ref)
            })
        })
        component.set('currentNodeStreams', currentNodeStreams)
      }

      if (typeof arguments['0'] === 'function') {
        const childConstructor = arguments['0']
        const childProps = arguments['1'] || {}

        if (isReactComponent(childConstructor)) {
          setNodeStream()
          return createReactElement(createElement, arguments, jsxHandler)
        }

        let foundChildren = component.getChildren()
                      .filter(child => child.getConstructor() === childConstructor)
                      .filter(child => child.getKey() === childProps.key)

        let child = foundChildren[0]
        if (child) {
          if (component.getPrivate('timesRendered') === 1) {
            if (!child.getKey()) {
              throw new Error(`Recycle component '${child.getName()}' called multiple times without the key property`)
            } else {
              throw new Error(`Recycle component '${child.getName()}' called multiple times with the same key property '${child.getKey()}'`)
            }
          }
          setNodeStream(child)
          return createElement(child.get('ReactComponent'), childProps)
        }

        let componentDefinition = childConstructor(childProps)
        if (componentDefinition.$$typeof === $$typeofReactElement) {
          return componentDefinition
        }
        const newComponent = recycle.createComponent(childConstructor, childProps, component, componentDefinition)

        setNodeStream(newComponent)
        return createElement(newComponent.get('ReactComponent'), childProps)
      }
      setNodeStream()
      return createElement.apply(this, arguments)
    }

    React.createElement = jsxHandler
  })

  recycle.on('afterRender', component => {
    component.updateChildrenActions()
    React.createElement = createElement
  })

  function registerNodeStream (registeredNodeStreams, selectorType) {
    return selector => {
      const api = {
        on: event => {
          const foundRefs = registeredNodeStreams
            .filter(ref => ref.selector === selector)
            .filter(ref => ref.selectorType === selectorType)
            .filter(ref => ref.event === event)

          let ref = foundRefs[0]

          if (!ref) {
            ref = {
              selector,
              selectorType,
              event,
              stream: new Subject()
            }
            registeredNodeStreams.push(ref)
          }

          return ref.stream.switch().share()
            .map(val => (val.value !== undefined) ? val.value : val.event)
        },
        allActions: () => {
          return api.on(ANY_EVENT)
        },
        onAnyAction: (mapFn) => {
          return api.on(ANY_EVENT).map(mapFn)
        }
      }
      return api
    }
  }

  function updateNodeStreams (component) {
    component.getPrivate('registeredNodeStreams').forEach(regRef => {
      const streams = component.get('currentNodeStreams')
              .filter(ref => ref.selector === regRef.selector)
              .filter(ref => ref.selectorType === regRef.selectorType)
              .filter(ref => ref.event === regRef.event)
              .map(ref => ref.stream)

      if (streams.length) {
        regRef.stream.next((streams.length === 1) ? streams[0] : Observable.merge(...streams))
      }
    })
  }

  function updateStatePropsReference (component) {
    component.getSource('state').next(shallowClone(component.getState()))
    component.getSource('props').next(shallowClone(component.getProps()))
  }

  function createReactComponent (component) {
    class ReactClass extends React.Component {
      constructor (ownProps) {
        super(ownProps)
        this.state = { recycleState: component.getState() }
      }

      componentDidMount () {
        this.stateSubsription = component.getStateStream().subscribe(newVal => {
          this.setState({
            recycleState: shallowClone(newVal.state)
          })
        })

        recycle.emit('componentDidMount', component)

        if (component.get('componentDidMount')) {
          return component.get('componentDidMount')()
        }
      }

      shouldComponentUpdate (nextProps, nextState) {
        if (component.get('shouldComponentUpdate')) {
          return component.get('shouldComponentUpdate')(nextProps, nextState.recycleState, this.props, this.state.recycleState)
        }
        return true
      }

      componentDidUpdate (prevProps, prevState) {
        component.replaceProps(this.props)
        component.replaceState(this.state.recycleState)

        recycle.emit('componentUpdate', component)

        if (component.get('componentDidUpdate')) {
          const params = {
            refs: this.refs,
            props: this.props,
            state: this.state.recycleState,
            prevProps,
            prevState: prevState.recycleState
          }
          return component.get('componentDidUpdate')(params)
        }
      }

      componentWillUnmount () {
        recycle.emit('componentWillUnmount', component)

        if (this.stateSubsription) {
          this.stateSubsription.unsubscribe()
        }
        if (component.getParent()) {
          component.getParent().removeChild(component)
        }

        if (component.get('componentWillUnmount')) {
          return component.get('componentWillUnmount')()
        }
      }

      render () {
        recycle.emit('beforeRender', component)
        if (!component.get('view')) return null
        let toReturn = component.get('view')(this.props, this.state.recycleState)
        recycle.emit('afterRender', component)
        return toReturn
      }
    }

    ReactClass.displayName = component.getName()
    ReactClass.propTypes = component.get('propTypes') || null
    return ReactClass
  }

  return {
    name: 'react'
  }
}

export function getNodeSelectors (nodeName, attrs) {
  let selectors = []

  let tag = (typeof nodeName === 'string') ? nodeName : undefined
  let id = (attrs) ? attrs.id : undefined
  let className = (attrs) ? attrs.className : undefined
  let functionSelector = (typeof nodeName === 'function' || typeof nodeName === 'object') ? nodeName : undefined

  if (tag) {
    selectors.push({ selector: tag, selectorType: 'tag' })
  }

  if (functionSelector) {
    selectors.push({ selector: functionSelector, selectorType: 'tag' })
  }

  if (className) {
    let classes = className.split(' ').map(classNcame => ({ selector: className, selectorType: 'class' }))
    selectors = selectors.concat(classes)
  }
  if (id) {
    selectors.push({ selector: id, selectorType: 'id' })
  }

  return selectors
}

export function isReactComponent (constructor) {
  if (typeof constructor === 'function' && constructor.prototype && constructor.prototype.render) {
    return true
  }
  return false
}

export function createReactElement (createElementHandler, args) {
  const constructor = args['0']
  const props = args['1'] || {}

  const newArgs = []
  for (let i = 0; i < args.length || i < 2; i++) {
    if (i === 0) {
      newArgs.push(constructor)
    } else if (i === 1) {
      newArgs.push(props)
    } else if (i > 1) {
      newArgs.push(args[i])
    }
  }

  return createElementHandler.apply(this, newArgs)
}

export function getEventHandler (event) {
  const reactEvents = [
    'onCopy', 'onCut', 'onPaste', 'onCompositionEnd', 'onCompositionStart', 'onCompositionUpdate',
    'onKeyDown', 'onKeyPress', 'onKeyUp', 'onFocus', 'onBlur', 'onChange', 'onInput', 'onSubmit',
    'onClick', 'onContextMenu', 'onDoubleClick', 'onDrag', 'onDragEnd', 'onDragEnter', 'onDragExit',
    'onDragLeave', 'onDragOver', 'onDragStart', 'onDrop', 'onMouseDown', 'onMouseEnter', 'onMouseLeave',
    'onMouseMove', 'onMouseOut', 'onMouseOver', 'onMouseUp', 'onSelect', 'onTouchCancel', 'onTouchEnd',
    'onTouchMove', 'onTouchStart', 'onScroll', 'onWheel', 'onAbort', 'onCanPlay', 'onCanPlayThrough',
    'onDurationChange', 'onEmptied', 'onEncrypted', 'onEnded', 'onError', 'onLoadedData',
    'onLoadedMetadata', 'onLoadStart', 'onPause', 'onPlay', 'onPlaying', 'onProgress', 'onRateChange',
    'onSeeked', 'onSeeking', 'onStalled', 'onSuspend', 'onTimeUpdate', 'onVolumeChange', 'onWaiting',
    'onLoad', 'onError', 'onAnimationStart', 'onAnimationEnd', 'onAnimationIteration', 'onTransitionEnd'
  ]
  const reactEvent = 'on' + event.charAt(0).toUpperCase() + event.slice(1)

  if (reactEvents.indexOf(reactEvent) === -1) {
    return false
  }

  return reactEvent
}
