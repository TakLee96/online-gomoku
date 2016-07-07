import React from 'react';
import { Link } from 'react-router';

import Board from './Board';
import { getHistory } from '../libraries/util';

export default class History extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: {
        blue: 'loading',
        green: 'loading',
        moves: []
      }
    };
  }

  componentDidMount() {
    getHistory(this.props.params.historyId).then((records) => {
      this.setState({ history: records[0] });
    }, (error) => console.error(error));
  }

  render() {
    return (<div>
      <Link to="/home">Home</Link>
      <Board blue={this.state.history.blue}
             green={this.state.history.green}
             moves={this.state.history.moves}/>
    </div>);
  }
}
