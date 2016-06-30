import React from 'react';
import State from '../libraries/state'

const images = [
  require('../images/grid-empty.jpg'),
  require('../images/grid-blue.jpg'),
  require('../images/grid-green.jpg')
];

class Grid extends React.Component {
  static propTypes = {
    i: React.PropTypes.number.isRequired,
    j: React.PropTypes.number.isRequired,
    player: React.PropTypes.number.isRequired,
    play: React.PropTypes.func.isRequired
  };
  static highlight = [ '', 'red', 'yellow'  ]
  constructor (props) {
    super(props);
    this.i = props.i;
    this.j = props.j;
    this.player = props.player;
    this.play = props.play;
    this.state = { player: this.player, on: false };
    this.update = this.update.bind(this);
    this.highlight = this.highlight.bind(this);
  }
  componentWillReceiveProps (nextProps) {
    this.setState({ player: nextProps.player });
  }
  render () {
    return <img height="40" width="40"
      src={images[this.state.player]}
      onClick={this.update} className={Grid.highlight[this.state.on]} />;
  }
  update () {
    this.play(this.i, this.j, (player) => {
      this.setState({ player });
    });
  }
  highlight (on) {
    this.setState({ on });
  }
}

export default class Board extends React.Component {
  constructor (props) {
    super(props);
    this.last = null;
    this.play = this.play.bind(this);
    this._state = new State();
  }
  render () {
    var that = this;
    return (<table><tbody>
      { this._state._board.map((row, i) => (<tr key={i}>
        { row.map((col, j) => <td key={i+'-'+j}><Grid i={i} j={j} player={col} play={that.play} ref={i+'-'+j} /></td>) }
      </tr>)) }
    </tbody></table>);
  }
  play (i, j, cb) {
    // being silly here
    if (this._state.canMove(i, j, this._state.next)) {
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
      }
      cb(this._state.get(i, j));
    }
  }
}
