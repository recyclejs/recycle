var path = require('path')

var BUILD_DIR = path.resolve(__dirname, '')
var APP_DIR = path.resolve(__dirname, '')

var config = {
  entry: APP_DIR + '/index.js',
  output: {
    path: BUILD_DIR,
    filename: 'bundle.js'
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
