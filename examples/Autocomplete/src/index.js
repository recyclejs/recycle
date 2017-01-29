import React from 'react'
import ReactDOM from 'react-dom'
import Autocomplete from './components/Autocomplete'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import injectTapEventPlugin from 'react-tap-event-plugin'
import ajaxDriver from './drivers/ajax'

// RECYCLE DEFINED USING DEFAULT ADAPTER
import Recycle from 'recyclejs'
import 'rxjs/add/observable/dom/ajax'
import 'rxjs/add/operator/debounceTime'
import 'rxjs/add/operator/switchMap'

// RECYCLE DEFINED USING CUSTOM ADAPTER
// import Rx from 'rxjs/Rx'
// import createRecycle from 'recyclejs/react'
// const Recycle = createRecycle(React, Rx)

injectTapEventPlugin()

ReactDOM.render((
  <MuiThemeProvider>
    <Recycle root={Autocomplete} drivers={ajaxDriver} />
  </MuiThemeProvider>
), document.getElementById('root'))
