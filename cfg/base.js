'use strict';
let path = require('path');
let defaultSettings = require('./defaults');

// Additional npm or bower modules to include in builds
// Add all foreign plugins you may need into this array
// @example:
// let npmBase = path.join(__dirname, '../node_modules');
// let additionalPaths = [ path.join(npmBase, 'react-bootstrap') ];
let additionalPaths = [];

module.exports = {
  additionalPaths: additionalPaths,
  port: defaultSettings.port,
  debug: true,
  devtool: 'eval',
  output: {
    path: path.join(__dirname, '/../dist/assets'),
    filename: 'app.js',
    publicPath: defaultSettings.publicPath
  },
  devServer: {
    contentBase: './src/',
    historyApiFallback: true,
    hot: true,
    port: defaultSettings.port,
    publicPath: defaultSettings.publicPath,
    noInfo: false
  },
  resolve: {
    extensions: ['', '.js', '.jsx'],
    alias: {
      components: `${defaultSettings.srcPath}/components/`,
      styles: `${defaultSettings.srcPath}/styles/`
    }
  },
  externals: {
    'react-native': 'undefined', // avoid loading react-native
    'localStorage': 'undefined', // we don't need this package
    'config': JSON.stringify({
      'skygear': {
        'endPoint': 'https://gomoku.skygeario.com/',
        'apiKey': '37605245dbe14eebbb2378666fa864c9'
      },
      'GRID_SIZE': 15
    }) // it's better to save configuration for your skygear container here
  },
  module: {}
};
