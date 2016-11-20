import createRecycle from '../../src/index'
import adapter from '../../src/adapter/react-rxjs'
import CounterWithReact from './components/CounterWithReact'

const recycle = createRecycle({ adapter })
recycle.render(CounterWithReact, document.getElementById('app'))
