import createRecycle from '../../src/index'
import adapter from '../../src/adapter/react-rxjs'
import WrapMultipleCounters from './components/WrapMultipleCounters'

const recycle = createRecycle({ adapter })
recycle.render(WrapMultipleCounters, document.getElementById('app'))
