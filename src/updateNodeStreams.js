import { Observable } from 'rxjs/Observable'

function updateNodeStreams (listeners, nodeStreams) {
  listeners.forEach(regRef => {
    const streams = nodeStreams
      .filter(ref => ref.selector === regRef.selector)
      .filter(ref => ref.selectorType === regRef.selectorType)
      .filter(ref => ref.event === regRef.event)
      .map(ref => ref.stream)

    if (streams.length) {
      regRef.stream.next((streams.length === 1) ? streams[0] : Observable.merge(...streams))
    }
  })
}

export default updateNodeStreams
