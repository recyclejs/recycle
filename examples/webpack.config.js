var path = require('path')

var APP_DIR = path.resolve(__dirname, '')

var config = {
  entry: {
    todomvc: APP_DIR + '/TodoMVC/index.js',
    todomvcstore1: APP_DIR + '/TodoMVC-Store-1/index.js',
    todomvcstore2: APP_DIR + '/TodoMVC-Store-2/index.js',
    recyclereact: APP_DIR + '/CombiningWithReact/index.js',
    clickcounter: APP_DIR + '/ClickCounter/index.js',
    websocket: APP_DIR + '/Websocket/index.js',
    autocomplete: APP_DIR + '/Autocomplete/index.js'
  },
  output: {
    path: APP_DIR + '/bundles',
    filename: '[name].js'
  },
  module: {
    loaders: [
      {
        test: /\.js?/,
        exclude: path.resolve(__dirname, '../node_modules'),
        loader: 'babel'
      },
      {
        test: /\.css$/,
        loader: 'style!css'
      }
    ]
  }
}

module.exports = config
