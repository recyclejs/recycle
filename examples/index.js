/* global document */
/* eslint import/no-unresolved: "off" */
/* eslint import/extensions: "off" */

import createRecycle from '../src/index'
import reactRxjs from '../src/adapter/react-rxjs'
import { Router, Route, Link, hashHistory } from 'react-router'
import WrapMultipleCounters from './ClickCounter/WrapMultipleCounters'

const recycle = createRecycle({
  adapter: reactRxjs
})

const ExampleList = () => (state, props, jsx) => (
  <ul>
    <li><Link to='/clickcounter'>ClickCounter</Link></li>
  </ul>
)

const Routes = () => (state, props, jsx) => (
  <Router history={hashHistory} >
    <Route path='clickcounter' component={recycle.toReact(WrapMultipleCounters)} />
    <Route path='*' component={recycle.toReact(ExampleList)} />
  </Router>
)

recycle.render(Routes, document.getElementById('app'))
