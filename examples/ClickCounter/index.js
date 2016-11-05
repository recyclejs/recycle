import createRecycle from 'recyclejs'
import reactRxjs from 'recyclejs/adapter/react-rxjs'
import WrapMultipleCounters from './WrapMultipleCounters'

let recycle = createRecycle({
  adapter: reactRxjs
})

recycle.render(WrapMultipleCounters, document.getElementById('app'))