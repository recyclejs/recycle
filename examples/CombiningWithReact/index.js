import createRecycle from '../../src/index'
import reactRxjs from '../../src/adapter/react-rxjs'
import CounterWithReact from './components/CounterWithReact'

const recycle = createRecycle({ adapter: reactRxjs })

recycle.render(CounterWithReact, document.getElementById('app'))
