/*
 * Webpack configuration
 */

'use strict';

var webpack = require('webpack');

module.exports = {
  entry: './src/js/main.js',

  output: {
    publicPath: './dist/js/',
    path: './dist/js/',
    filename: 'bundle.js'
  }
}
