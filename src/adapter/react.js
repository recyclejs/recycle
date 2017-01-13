import Recycle from '../recycle'

export function createRecycle (componentAdapter, streamAdapter) {
  const { React } = componentAdapter

  return function (props, publicContext, updateQueue) {
    // if Recycle was called as react component
    const recycle = Recycle(componentAdapter, streamAdapter)

    if (updateQueue && updateQueue.isMounted) {
      if (!props || !props.root) {
        throw new Error('Missing root component for initializing Recycle')
      }

      if (props.drivers) {
        recycle.applyDrivers(props.drivers)
      }

      const ReactComponent = recycle.createComponent(props.root, props.props).getReactComponent()
      return React.createElement(ReactComponent, props.props)
    }

    // if Recycle was called idependently
    let drivers = []
    if (arguments.length) {
      for (let i = 0; i < arguments.length; i++) {
        drivers.push(arguments[i])
      }
    }
    recycle.applyDrivers(drivers)

    return function (rootComponent, props) {
      return recycle.createComponent(rootComponent, props).getReactComponent()
    }
  }
}

export default function (React) {
  // todo: more apstract api

  const getEventHandler = (event) => {
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

  return { React, getEventHandler }
}
