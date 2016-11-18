var path = require('path')

var APP_DIR = path.resolve(__dirname, '')

var config = {
  entry: {
    todomvc: APP_DIR + '/TodoMVC/index.js',
    todomvcstore: APP_DIR + '/TodoMVC-Store/index.js',
    recyclereact: APP_DIR + '/CombiningWithReact/index.js',
    clickcounter: APP_DIR + '/ClickCounter/index.js'
  },
  output: {
    path: APP_DIR + '/__build__',
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
