/*
 * Webpack configuration
 */

'use strict';

var webpack = require('webpack');

module.exports = {
  entry: './src/js/main.js',

  output: {
    publicPath: './dist/assets/',
    path: './dist/assets/',
    filename: 'bundle.js'
  },

  module: {
    loaders: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      },

      {
        test: /\.js$/,
        include: /linebreak/,
        loader: 'transform?brfs'
      }
    ],

    postLoaders: [{
      loader: 'transform?brfs'
    }]
  },

  node: {
    fs: "empty"
  }
}
