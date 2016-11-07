/*
Initializing example of Recycle app
(not actually used in this repository)
*/

import createRecycle from 'recyclejs'
import reactRxjs from 'recyclejs/adapter/react-rxjs'
import WrapMultipleCounters from './WrapMultipleCounters'

const recycle = createRecycle({
  adapter: reactRxjs,
})

recycle.render(WrapMultipleCounters, document.getElementById('app'))
