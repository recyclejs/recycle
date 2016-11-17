import createRecycle from '../../src/index'
import reactRxjs from '../../src/adapter/react-rxjs'
import WrapMultipleCounters from './WrapMultipleCounters'

const recycle = createRecycle({ adapter: reactRxjs })

// Wrapping Recycle component in React component
// so it can be used inside React Router
export default recycle.toReact(WrapMultipleCounters)

// If you are not using React Router
// you can render it directly to the DOM
// recycle.render(WrapMultipleCounters, document.getElementById('app'))
