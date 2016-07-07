import React from 'react';

import { getGame, gameActive, reportMove, saveHistory } from '../libraries/util';
import Board from './Board';

export default class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      game: {
        $transient: {
          history: {
            blue: 'loading',
            green: 'loading'
          }
        }
      }
    };
    this.report = this.report.bind(this);
    this.end = this.end.bind(this);
  }

  componentDidMount() {
    getGame(this.props.params['gameId']).then((records) => {
      this.setState({ game: records[0] });
      gameActive((i, j) => this.refs['board'].respond(i, j));
    }, (error) => console.error(error));
  }

  render() {
    return <Board blue={ this.state.game.$transient['history'].blue }
                  green={ this.state.game.$transient['history'].green }
                  report={ this.report } end={ this.end } ref='board'
                  isBlue={ this.state.game.isBlue } />;
  }

  report(i, j) {
    reportMove(i, j, this.state.game.opponentId);
  }

  end(state) {
    return saveHistory(this.props.params['gameId'], state);
  }
}
