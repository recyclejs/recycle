## Hello World
The easiest way to get started with Recycle is to use [Create React App](https://github.com/facebookincubator/create-react-app)

```bash
npm install -g create-react-app

create-react-app my-app
cd my-app/
```

When you application is initialized you can install Recycle:

```bash
npm install --save recyclejs
```

Create a new file, for example: `src/HelloWorld.js`:

```javascript
import React from 'react';

function HelloWorld() {
  return {
    view() {
      return (
        <div className="App">
          <h2>Hello World</h2>
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