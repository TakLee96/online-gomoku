require('normalize.css/normalize.css');
require('styles/App.css');

import React from 'react';
import { Link } from 'react-router';
import DropZone from 'react-dropzone';

import Input from './Input';
import { login, signup, online } from '../libraries/util';

export class App extends React.Component {
  constructor (props) {
    super(props);
  }
  componentDidMount() {
    if (online()) this.props.router.push('/home');
  }
  render() {
    return (<div>
      <Link to="/login">Log In</Link>
      <span> | </span>
      <Link to="/signup">Sign Up</Link>
    </div>)
  }
}

export class LogIn extends React.Component {
  constructor (props) {
    super(props);
    this.onClick = this.onClick.bind(this);
  }
  componentDidMount() {
    if (online()) this.props.router.push('/home');
  }
  render() {
    return (<div>
      <Link to="/signup">Sign Up</Link>
      <Input ref='username' id='username' label='Username: ' type='text' />
      <Input ref='password' id='password' label='Password: ' type='password' />
      <button onClick={this.onClick}>Log In</button>
    </div>);
  }
  onClick() {
    login(this.refs['username'].state.value, this.refs['password'].state.value)
      .then(() => this.props.router.push('/home'), (error) => {
        console.error(error); alert(error.error.message);
      });
  }
}

export class SignUp extends React.Component {
  constructor (props) {
    super(props);
    this.onClick = this.onClick.bind(this);
    this.onDrop = this.onDrop.bind(this);
    this.state = { file: {} }
  }
  componentDidMount() {
    if (online()) this.props.router.push('/home');
  }
  render() {
    return (<div>
      <Link to="/login">Log In</Link>
      <Input ref='username' id='username' label='Username: ' type='text' />
      <Input ref='nickname' id='nickname' label='Nickname: ' type='text' />
      <Input ref='password' id='password' label='Password: ' type='password' />
      <DropZone id="dropZone" onDrop={this.onDrop} multiple={false} accept="image/*">
        <div>{this.state.file.name || 'Drop your avatar image here, or click to select.'}</div>
      </DropZone>
      <button onClick={this.onClick}>Sign Up</button>
    </div>);
  }
  onDrop(files) {
    this.setState({ file: files[0] });
  }
  onClick() {
    const username = this.refs['username'].state.value;
    const nickname = this.refs['nickname'].state.value;
    const password = this.refs['password'].state.value;
    if (username && nickname && password && this.state.file) {
      signup(username, nickname, password, this.state.file)
        .then(() => this.props.router.push('/home'), (error) => {
          console.error(error); alert(error.error.message);
        });
    } else {
      alert('Missing required fields');
    }
  }
}
