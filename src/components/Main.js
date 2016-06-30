require('normalize.css/normalize.css');
require('styles/App.css');

import skygear from 'skygear';
import React from 'react';
import Board from './Board';
import Input from './Input';

import { setStatus, getUsersWithStatus } from '../libraries/util';

export default class App extends React.Component {
  constructor () {
    super();
    this.state = {
      username: '',
      password: '',
      user: skygear.currentUser,
      onlineUsers: []
    };
    this.changeUsername = this.changeUsername.bind(this);
    this.changePassword = this.changePassword.bind(this);
    this.login = this.login.bind(this);
    this.signup = this.signup.bind(this);
    this.logout = this.logout.bind(this);
    this.refresh = this.refresh.bind(this);
    this.challenge = this.challenge.bind(this);
  }
  render() {
    if (this.state.user) {
      if (this.state.game) {
        return <Board />
      } else {
        return (<div>
          <table><tbody>{this.state.onlineUsers.map((user, i) => (<tr key={i}>
            <td>{user._id}</td>
            <td>{user.status}</td>
            <td><button onClick={ () => this.challenge(user) }>Challenge</button></td>
          </tr>))}</tbody></table>
          <button onClick={this.refresh}>Refresh</button>
          <button onClick={this.logout}>Log Out</button>
        </div>);
      }
    } else {
      return (<div>
        <Input id='username' label='Username: ' type='text' update={this.changeUsername} />
        <Input id='password' label='Password: ' type='password' update={this.changePassword} />
        <button onClick={this.login}>Log In</button>
        <button onClick={this.signup}>Sign Up</button>
      </div>);
    }
  }
  componentDidMount () {
    const that = this;
    if (this.state.user) {
      setStatus('online', this.state.user.id);
      this.refresh(this.state.user.id);
    }
    skygear.onUserChanged((user) => {
      that.setState({ user: user });
      if (user) {
        setStatus('online', user.id);
        that.refresh(user.id);
      }
    });
  }
  changeUsername (username) {
    this.setState({
      username: username
    });
  }
  changePassword (password) {
    this.setState({
      password: password
    });
  }
  login () {
    const that = this;
    skygear.loginWithUsername(this.state.username, this.state.password)
      .then((user) => {
        console.log('login success');
        that.setState({ user: user });
      }, (error) => {
        console.error(error);
        alert(error.error.message);
      });
  }
  signup () {
    const that = this;
    skygear.signupWithUsername(this.state.username, this.state.password)
      .then((user) => {
        console.log('signup success');
        that.setState({ user: user });
      }, (error) => {
        console.error(error);
        alert(error.error.message);
      });
  }
  logout () {
    const that = this;
    skygear.logout().then(() => {
      that.setState({ user: null });
    }, (error) => {
      console.error(error);
    });
  }
  refresh (userid) {
    const that = this;
    const id = userid || skygear.currentUser.id;
    getUsersWithStatus('online', id, (onlineUsers) => {
      that.setState({ onlineUsers })
    }, (error) => {
      console.error(error);
    });
  }
  challenge (user) {
    console.log('I am challenging', user.id);
  }
}
