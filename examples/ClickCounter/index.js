/* global document */
/* eslint import/no-extraneous-dependencies: "off" */
/* eslint import/no-unresolved: "off" */
/* eslint import/extensions: "off" */

import createRecycle from 'recyclejs'
import reactRxjs from 'recyclejs/adapter/react-rxjs'
import WrapMultipleCounters from './WrapMultipleCounters'

const recycle = createRecycle({
  adapter: reactRxjs,
})

recycle.render(WrapMultipleCounters, document.getElementById('app'))
