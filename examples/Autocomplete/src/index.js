import React from 'react'
import ReactDOM from 'react-dom'
import Recycle from 'recyclejs'
import 'rxjs/add/observable/dom/ajax'
import 'rxjs/add/operator/debounceTime'
import 'rxjs/add/operator/switchMap'
import Autocomplete from './components/Autocomplete'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import injectTapEventPlugin from 'react-tap-event-plugin'
injectTapEventPlugin()

ReactDOM.render((
  <MuiThemeProvider>
    <Recycle root={Autocomplete} />
  </MuiThemeProvider>
), document.getElementById('root'))
