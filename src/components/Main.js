require('normalize.css/normalize.css');
require('styles/App.css');

import React from 'react';
import Board from './Board';

// let yeomanImage = require('../images/yeoman.png');

export default class App extends React.Component {
  render() {
    return <Board />
  }
}
