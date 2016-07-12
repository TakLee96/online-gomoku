import React from 'react';

// TODO: how can I fix this
var e = require('../images/grid-empty.jpg');
var b = require('../images/grid-blue.jpg');
var g = require('../images/grid-green.jpg');

const images = [
  e.slice(1), b.slice(1), g.slice(1)
];
images.forEach((src) => {
  var image = new Image();
  image.src = src;
}); // image preloading

export default class Grid extends React.Component {
  static propTypes = {
    i: React.PropTypes.number.isRequired,
    j: React.PropTypes.number.isRequired,
    player: React.PropTypes.number.isRequired,
    play: React.PropTypes.func.isRequired
  };
  static highlight = [ '', 'red', 'yellow' ];
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
