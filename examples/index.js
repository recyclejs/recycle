/* global document */
/* eslint import/no-unresolved: "off" */
/* eslint import/extensions: "off" */

import createRecycle from '../src/index'
import reactRxjs from '../src/adapter/react-rxjs'
import WrapMultipleCounters from './ClickCounter/WrapMultipleCounters'

const recycle = createRecycle({
  adapter: reactRxjs,
})

setTimeout(function() {
  recycle.render(WrapMultipleCounters, document.getElementById('app'))
}, 1000)

