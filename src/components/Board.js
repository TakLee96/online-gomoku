import React from 'react';
import State from '../libraries/state'
import Grid from './Grid';

import skygear from 'skygear';
import { saveHistory } from '../libraries/util'

export default class Board extends React.Component {
  static propTypes = {
    myself: React.PropTypes.shape({
      id: React.PropTypes.string.isRequired,
      nickname: React.PropTypes.string.isRequired
    }),
    // opponent: React.PropTypes.shape({
    //   id: React.PropTypes.string,
    //   nickname: React.PropTypes.string
    // }),
    player: React.PropTypes.number.isRequired,
    exit: React.PropTypes.func.isRequired,
    history: React.PropTypes.object
  };
  constructor (props) {
    super(props);
    this.last = null;
    this.state = { winner: null, canBackward: false, canForward: true };
    this.index = 0;
    this._state = new State();
    this.play = this.play.bind(this);
    this.exit = this.exit.bind(this);
    this.updateDisplay = this.updateDisplay.bind(this);
    this.rewindDisplay = this.rewindDisplay.bind(this);
    this.canBackward = this.canBackward.bind(this);
    this.canForward = this.canForward.bind(this);
    this.backward = this.backward.bind(this);
    this.forward = this.forward.bind(this);
  }
  componentDidMount () {
    skygear.off(this.props.myself.id);
    if (!this.props.history) {
      skygear.on('game-'+this.props.myself.id, (data) => {
        this.updateDisplay(data.i, data.j);
        this.refs[data.i+'-'+data.j].setState({ player: State.other(this.props.player) });
      });
    }
  }
  render () {
    var that = this;
    return (<div>
      <h3>Blue: { (this.props.player === State.BLACK) ? this.props.myself.nickname : this.props.opponent.nickname }</h3>
      <h3>Green: { (this.props.player === State.WHITE) ? this.props.myself.nickname : this.props.opponent.nickname }</h3>
      <div>{ (this.state.winner) ? (<div>
        <h3>{`The winner is ${this.state.winner}! History saved.`}</h3>
        <button onClick={this.exit}>Back</button>
      </div>) : '' }</div>
      <table className="board">
        <tbody>{this._state._board.map((row, i) => (
          <tr key={i}>{row.map((col, j) => (
            <td className="grid" key={i+'-'+j}>
              <Grid i={i} j={j} player={col} play={that.play} ref={i+'-'+j} />
            </td>))}
          </tr>))}
        </tbody>
      </table>
      <div>{ (this.props.history) ? (<div>
        <button onClick={this.backward} disabled={!this.state.canBackward}>&lt;</button>
        <button onClick={this.forward} disabled={!this.state.canForward}>&gt;</button>
        <button onClick={this.exit}>Back</button></div>) : ''}
      </div>
    </div>);
  }
  play (i, j, cb) {
    if (!this.props.history && this._state.canMove(i, j, this.props.player)) {
      this.updateDisplay(i, j);
      cb(this._state.get(i, j));
      skygear.pubsub.publish('game-'+this.props.opponent.id, { i, j });
    }
  }
  updateDisplay (i, j) {
    if (this.last !== null) {
      this.refs[this.last[0]+'-'+this.last[1]].highlight(0);
    }
    this._state.play(i, j);
    this.last = this._state.last;
    this.refs[this.last[0]+'-'+this.last[1]].highlight(1);
    if (this._state.isWin) {
      this._state.highlight.forEach((pos) => {
        this.refs[pos[0]+'-'+pos[1]].highlight(2);
      });
      if (!this.props.history) {
        saveHistory({
          moves: this._state._history,
          opponent: this.props.opponent,
          isBlack: this.props.player === State.BLACK,
          win: State.other(this._state.next) === this.props.player
        }).then(() => {
          this.setState({ winner: ((State.other(this._state.next) === State.BLACK) ? 'Blue' : 'Green') });
        }, (error) => console.error(error));
      }
    }
  }
  rewindDisplay () {
    var [i, j, highlight] = this._state.rewind();
    this.refs[i+'-'+j].setState({ player: State.EMPTY });
    if (highlight) {
      highlight.forEach((pos) => {
        this.refs[pos[0]+'-'+pos[1]].highlight(0);
      });
    }
    this.refs[this.last[0]+'-'+this.last[1]].highlight(0);
    if (this.canBackward()) {
      this.last = this._state.last;
      this.refs[this.last[0]+'-'+this.last[1]].highlight(1);
    }
  }
  exit () {
    return this.props.exit();
  }
  canBackward () {
    return this.index > 0;
  }
  canForward () {
    return this.index < this.props.history.moves.length;
  }
  backward () {
    if (this.canBackward()) {
      this.index -= 1;
      this.rewindDisplay();
    }
    this.setState({ canBackward: this.canBackward(), canForward: this.canForward() });
  }
  forward () {
    if (this.canForward()) {
      var [i, j] = this.props.history.moves[this.index];
      this.updateDisplay(i, j);
      this.index += 1;
    }
    this.setState({ canBackward: this.canBackward(), canForward: this.canForward() });
  }
}
