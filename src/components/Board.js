import React from 'react';
import { Link } from 'react-router';

import State from '../libraries/state'
import Grid from './Grid';

export default class Board extends React.Component {
  static propTypes = {
    blue: React.PropTypes.string.isRequired,
    green: React.PropTypes.string.isRequired,
    report: React.PropTypes.func,
    end: React.PropTypes.func,
    history: React.PropTypes.array
  };

  constructor (props) {
    super(props);
    this.state = {
      blue: props.blue,
      green: props.green,
      canBackward: false,
      canForward: false
    };
    this._state = new State();
    this.index = 0;
    this.last = null;
    this.player = State.EMPTY;
  }

  componentWillReceiveProps(props) {
    this.setState({
      blue: props.blue,
      green: props.green,
      canForward: true
    });
    this.player = (props.isBlue) ? State.BLACK : State.WHITE;
  }

  render () {
    return (<div>
      <h2>Blue: {this.state.blue}</h2>
      <h2>Green: {this.state.green}</h2>
      <div>{ (this.state.winner && !this.props.moves) ? (<div>
        <h3>{`The winner is ${this.state.winner}! History saved.`}</h3>
        <Link to='/home'>Home</Link>
      </div>) : '' }</div>
      <table className='board'>
        <tbody>{this._state._board.map((row, i) => (
          <tr className='grid' key={i}>{row.map((col, j) => (
            <td className='grid' key={i+'-'+j}>
              <Grid i={i} j={j} player={col} play={this.play} ref={i+'-'+j} />
            </td>))}
          </tr>))}
        </tbody>
      </table>
      <h3>{ (this.props.moves) ? (<div>
        <button onClick={this.backward} disabled={!this.state.canBackward}>&lt;</button>
        <button onClick={this.forward} disabled={!this.state.canForward}>&gt;</button>
        <Link to='/home'>Home</Link></div>) : ''}
      </h3>
    </div>);
  }

  play = (i, j, cb) => {
    if (!this.props.moves && this._state.canMove(i, j, this.player)) {
      this.updateDisplay(i, j);
      cb(this._state.get(i, j));
      this.props.report(i, j);
    }
  };
  respond = (i, j) => {
    this.updateDisplay(i, j);
    this.refs[i+'-'+j].setState({ player: this._state.get(i, j) });
  };
  updateDisplay = (i, j) => {
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
      var name = {
        [State.EMPTY]: 'None',
        [State.BLACK]: 'Blue',
        [State.WHITE]: 'Green'
      };
      if (this.props.end)
        this.props.end(this._state).then(() => {
          this.setState({ winner: name[this._state.winner()] });
        }, (error) => console.error(error));
    }
  };
  rewindDisplay = () => {
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
  };
  canBackward = () => {
    return this.index > 0;
  };
  canForward = () => {
    return this.index < this.props.moves.length;
  };
  backward = () => {
    if (this.canBackward()) {
      this.index -= 1;
      this.rewindDisplay();
    }
    this.setState({ canBackward: this.canBackward(), canForward: this.canForward() });
  };
  forward = () => {
    if (this.canForward()) {
      var [i, j] = this.props.moves[this.index];
      this.updateDisplay(i, j);
      this.index += 1;
    }
    this.setState({ canBackward: this.canBackward(), canForward: this.canForward() });
  };
}
