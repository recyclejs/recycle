import createRecycle from '../src/index'
import reactRxjs from '../src/adapter/react-rxjs'
import { Router, Route, hashHistory, Link } from 'react-router'
import ClickCounter from './ClickCounter/index'
import ClickCounterReact from './CombiningWithReact/index'

const ExampleList = () => (jsx) => (
  <ul>
    <li><Link to='/clickcounter'>Click Counter</Link></li>
    <li><Link to='/recyclereact'>Combining Recycle with React</Link></li>
  </ul>
)

//  Function defined above is a shorthand version of
//  defining a component with a view
//
//  const ExampleList = () => ({
//    view: (jsx) => (
//      <ul>
//        ...
//      </ul>
//    )
//  })

const Routes = () => (jsx) => (
  <Router history={hashHistory} >
    <Route path='clickcounter' component={ClickCounter} />
    <Route path='recyclereact' component={ClickCounterReact} />
    <Route path='*' component={recycle.toReact(ExampleList)} />
  </Router>
)

const recycle = createRecycle({ adapter: reactRxjs })
recycle.render(Routes, document.getElementById('app'))
