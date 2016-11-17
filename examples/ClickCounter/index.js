import createRecycle from '../../src/index'
import reactRxjs from '../../src/adapter/react-rxjs'
import WrapMultipleCounters from './components/WrapMultipleCounters'

const recycle = createRecycle({ adapter: reactRxjs })

recycle.render(WrapMultipleCounters, document.getElementById('app'))
