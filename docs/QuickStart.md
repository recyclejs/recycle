## Quick Start
The easiest way to get started with Recycle is to use [Create React App](https://github.com/facebookincubator/create-react-app)

```bash
npm install -g create-react-app

create-react-app my-app
cd my-app/
```

When your application is initialized you can install Recycle:

```bash
npm install --save recyclejs
```

### Hello World
Create a new file, `src/HelloWorld.js`:

```javascript
import React from 'react';

function HelloWorld() {
  return {
    initialState: {
      message: 'Hello World'
    },

    view (props, state) {
      return (
        <div>
          <h2>{state.message}</h2>
        </div>
      )
    }
  }
}

export default HelloWorld;
```

and import it in `index.js`:

```javascript
import React from 'react';
import ReactDOM from 'react-dom';
import Recycle from 'recyclejs';
import HelloWorld from './HelloWorld'

ReactDOM.render(
  <Recycle root={HelloWorld} />,
  document.getElementById('root')
);
```

### Starting Application

You can now run your app:
```bash
npm start
```