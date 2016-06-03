/*
 * Webpack configuration
 */

'use strict';

var webpack = require('webpack');

module.exports = {
  entry: './src/js/Conjurer.js',

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
      },

      {
        test: /\.css$/,
        loader: 'style!css!'
      },

      {
        test: /\.(eot|svg|ttf|woff|woff2)$/,
        loader: 'file?name=public/fonts/[name].[ext]'
      },

      {
        test: /\.(jpg|png|gif)$/,
        loader: 'url-loader?limit=1000000'
      },
    ],

    postLoaders: [{
      loader: 'transform?brfs'
    }]
  },

  node: {
    fs: "empty"
  }
}
