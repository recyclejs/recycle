import Recycle from '../../src/index'
import ReactDOM from 'react-dom'
import React from 'react'
import ClicksCounter from './clickscounter'

ReactDOM.render(Recycle(ClicksCounter), document.getElementById('app'))