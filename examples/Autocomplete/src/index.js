import React from 'react'
import ReactDOM from 'react-dom'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import injectTapEventPlugin from 'react-tap-event-plugin'
import Rx from 'rxjs/Rx'
import createRecycle from 'recyclejs/react'
import Autocomplete from './components/Autocomplete'
import ajaxDriver from './drivers/ajax'

// creating recycle instance
const recycle = createRecycle(React, Rx)

// applying drivers
recycle.use(ajaxDriver)

// creating root react component
const AutocompleteReact = recycle.createReactComponent(Autocomplete)

injectTapEventPlugin()

ReactDOM.render((
  <MuiThemeProvider>
    <AutocompleteReact />
  </MuiThemeProvider>
), document.getElementById('root'))
