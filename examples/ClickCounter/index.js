import createRecycle from 'recyclejs'
import ReactRxJS from 'recyclejs/adapter/react-rxjs'
import WrapMultipleCounters from './WrapMultipleCounters'

let recycle = createRecycle({
  adapter: ReactRxJS
})

recycle.render(WrapMultipleCounters, document.getElementById('app'))