import createRecycle from '../../src/index'
import reactRxjs from '../../src/adapter/react-rxjs'
import CounterWithReact from './CounterWithReact'

const recycle = createRecycle({ adapter: reactRxjs })

// Wrapping Recycle component in React component
// using "recyle.toReact", so it can be used inside React Router
export default recycle.toReact(CounterWithReact)

// If you are not using React Router
// you can render it directly to the DOM
// recycle.render(CounterWithReact, document.getElementById('app'))
