import React from 'react';

export default class Input extends React.Component {
  static propTypes = {
    id: React.PropTypes.string.isRequired,
    label: React.PropTypes.string.isRequired,
    type: React.PropTypes.string.isRequired
  };
  constructor (props) {
    super(props);
    this.state = { value: '' };
    this.update = this.update.bind(this);
  }
  render () {
    return (<div>
      <label for={this.props.id}>{this.props.label}</label>
      <input type={this.props.type} id={this.props.id}
             onInput={this.update} value={this.state.value}/>
    </div>);
  }
  update (event) {
    this.setState({ value: event.target.value });
  }
}
