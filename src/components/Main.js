require('normalize.css/normalize.css');
require('styles/App.css');

import skygear from 'skygear';
import React from 'react';
import Board from './Board';
import Input from './Input';

import {
  setStatus,
  getUsersWithStatus,
  setNickname,
  getMyNickname
} from '../libraries/util';

export default class App extends React.Component {
  constructor () {
    super();
    this.state = {
      username: '',
      password: '',
      nickname: '',
      myNickname: 'loading',
      game: false,
      updating: false,
      onlineUsers: [],
      challenge: false,
      timer: null
    };
    this.change = this.change.bind(this);
    this.goOnline = this.goOnline.bind(this);
    this.login = this.login.bind(this);
    this.signup = this.signup.bind(this);
    this.logout = this.logout.bind(this);
    this.refresh = this.refresh.bind(this);
    this.challenge = this.challenge.bind(this);
  }
  render() {
    if (skygear.currentUser) {
      if (this.state.game) {
        return <Board />
      } else {
        return (<div>
          <div>Welcome {this.state.myNickname}</div>
          <h3>Current Online Users</h3>
          <table><tbody>{this.state.onlineUsers.map((user, i) => (<tr key={i}>
            <td>{user._id}</td>
            <td>{user.nickname}</td>
            <td>{user.status}</td>
            <td><button onClick={ () => this.challenge(user) } disabled={this.state.challenge}>Challenge</button></td>
          </tr>))}</tbody></table>
          <button onClick={this.refresh} disabled={this.state.updating}>Refresh</button>
          <button onClick={this.logout}>Log Out</button>
        </div>);
      }
    } else {
      return (<div>
        <Input id='username' label='Username: ' type='text' update={this.change} />
        <Input id='nickname' label='Nickname: ' type='text' update={this.change} />
        <Input id='password' label='Password: ' type='password' update={this.change} />
        <button onClick={this.login}>Log In</button>
        <button onClick={this.signup}>Sign Up</button>
      </div>);
    }
  }
  goOnline (userid) {
    const that = this;
    userid = (skygear.currentUser) ? skygear.currentUser.id : userid;
    if (userid) {
      setStatus('online', userid);
      getMyNickname(userid)
        .then((records) => {
          this.setState({ myNickname: records[0].nickname });
        }, (error) => {
          console.error(error)
        });
      skygear.on(userid, (data) => {
        if (data.challenge) {
          let accept = confirm(`${data.nickname} challenges you. Accept?`);
          skygear.pubsub.publish(data.id, { accept });
          if (accept) {
            that.setState({ game: true });
          }
        } else if (that.state.challenge) {
          if (data.accept) {
            alert(`${that.state.challenge.nickname} accepted your challenge.`);
            clearTimeout(that.state.timer);
            that.setState({ game: true, timer: null });
          } else {
            alert(`${that.state.challenge.nickname} refused your challenge.`);
            clearTimeout(that.state.timer);
            that.setState({ timer: null, challenge: false });
          }
        }
      });
      this.refresh();
    }
  }
  componentDidMount () {
    const that = this;
    this.goOnline()
    skygear.onUserChanged((user) => {
      if (user) {
        that.goOnline(user.id);
      }
    });
  }
  change (id, value) {
    this.setState({ ['' + id]: value });
  }
  login () {
    const that = this;
    skygear.loginWithUsername(this.state.username, this.state.password)
      .then((user) => {
        return setNickname()
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
      .then((user) => setNickname(that.state.nickname, user.id))
      .then((record) => {
        console.log('signup success');
        that.setState({ user: skygear.currentUser });
      }, (error) => {
        console.error(error);
        alert(error.error.message);
      });
  }
  logout () {
    const that = this;
    setStatus('offline', skygear.currentUser.id)
      .then(() => {
        return skygear.logout();
      }).then(() => {
        that.forceUpdate();
      }, (error) => {
        console.error(error);
      });
  }
  refresh (event) {
    const that = this;
    const id = skygear.currentUser.id;
    this.setState({ updating: true })
    getUsersWithStatus('online', id).then((onlineUsers) => {
      that.setState({ onlineUsers, updating: false });
    }, (error) => {
      console.error(error);
    });
  }
  challenge (user) {
    skygear.pubsub.publish(user._id, {
      challenge: true,
      nickname: user.nickname,
      id: skygear.currentUser.id
    });
    let timer = setTimeout(() => {
      alert(`${this.state.challenge.nickname} might not be online.`)
      this.setState({ challenge: false, timer: null });
    }, 5000);
    this.setState({ challenge: user, timer });
  }
}
