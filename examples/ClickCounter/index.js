import Recycle from '../../src/index'
import ReactDOM from 'react-dom'
import WrapMultipleCounters from './WrapMultipleCounters'

ReactDOM.render(Recycle(WrapMultipleCounters), document.getElementById('app'))