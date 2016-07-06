require('normalize.css/normalize.css');
require('styles/App.css');

import skygear from 'skygear';
import React from 'react';
import Board from './Board';
import Input from './Input';

import {
  setStatus,
  getUsersWithStatus,
  setProfile,
  getProfile,
  getAllHistory
} from '../libraries/util';

export default class App extends React.Component {
  constructor () {
    super();
    this.state = {
      username: '', // username input
      password: '', // password input
      nickname: '', // nickname input
      updating: false, // is loading online users?

      myNickname: 'loading', // my nickname
      win: 0, // my win number
      onlineUsers: [], // current online users
      histories: [], // my histories

      history: null, // selected history of my histories
      game: false, // show the gomoku board?
      challenge: false, // do we have a challenger?
      timer: null // timer for waiting reply`
    };
    this.change = this.change.bind(this);
    this.goOnline = this.goOnline.bind(this);
    this.login = this.login.bind(this);
    this.signup = this.signup.bind(this);
    this.logout = this.logout.bind(this);
    this.refresh = this.refresh.bind(this);
    this.challenge = this.challenge.bind(this);
    this.exit = this.exit.bind(this);
    this.view = this.view.bind(this);
    this.challengeAI = this.challengeAI.bind(this);
  }
  java() {
    var html = `<applet code="gomoku.Main.class" width="750" height="750">
                  <div>Please enable Java in your browser.</div>
                  <param name="cache_option" value="no">
                </applet>`;
    return { __html: html };
  }
  render() {
    if (skygear.currentUser) {
      if (this.state.ai) {
        return (<div style="border: 10px solid black;" dangerouslySetInnerHTML={this.java()}></div>);
      } else if (this.state.game) {
        return (<Board exit={this.exit} history={this.state.history}
          myself={ {id: skygear.currentUser.id, nickname: this.state.myNickname} }
          opponent={ this.state.challenge || this.state.history.opponent }
          player={(this.state.black) ? 1 : 2} />);
      } else {
        return (<div>
          <hr/>
          <h3>Current Online Users</h3>
          <table>
            <thead>
              <tr>
                <th>Nickname</th>
                <th>Status</th>
                <th>Num Win</th>
                <th>Num Lose</th>
                <th>Last Online</th>
                <th>Challenge</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><b>{this.state.myNickname}</b></td>
                <td>online</td>
                <td>{this.state.win || '0'}</td>
                <td>{this.state.lose || '0'}</td>
                <td>{(new Date()).toUTCString().slice(0, -4)}</td>
                <td></td>
              </tr>
              <tr>
                <td>AI</td>
                <td>local</td>
                <td>0</td>
                <td>0</td>
                <td>anytime</td>
                <td><button onClick={ this.challengeAI }>Challenge</button></td>
              </tr>
              {this.state.onlineUsers.map((user, i) => (
              <tr key={'ou'+i}>
                <td>{user.nickname}</td>
                <td>{user.status}</td>
                <td>{user.win || '0'}</td>
                <td>{user.lose || '0'}</td>
                <td>{user.updatedAt.toUTCString().slice(0, -4)}</td>
                <td><button onClick={ () => this.challenge(user) }
                  disabled={this.state.challenge}>Challenge</button></td>
              </tr>))}
            </tbody>
          </table>
          <p>
            <button onClick={this.logout}>Log Out</button>
            <button onClick={this.refresh} disabled={this.state.updating}>Refresh</button>
          </p>
          <hr />
          <h3>Game History</h3>
          <table>
            <thead>
              <tr>
                <th>Nickname</th>
                <th>Match Result</th>
                <th>Who First</th>
                <th>Num Moves</th>
                <th>Match Time</th>
                <th>View</th>
              </tr>
            </thead>
            <tbody>{ this.state.histories.map((history, i) => (
              <tr key={'h'+i}>
                <td>{history.opponent.nickname}</td>
                <td>{(history.win) ? 'win' : 'lose'}</td>
                <td>{(history.isBlack) ? 'blue' : 'green'}</td>
                <td>{history.moves.length}</td>
                <td>{history.createdAt.toUTCString().slice(0, -4)}</td>
                <td><button onClick={() => this.view(history)}>view</button></td>
              </tr>)) }
            </tbody>
          </table>
        </div>);
      }
    } else {
      return (<div>
        <Input id='username' label='Username: ' type='text' update={this.change} />
        <Input id='nickname' label='Nickname: ' type='text' update={this.change} />
        <Input id='password' label='Password: ' type='password' update={this.change} />
        <button onClick={this.login}>Log In</button>
        <button onClick={this.signup} disabled={
          !(this.state.username && this.state.nickname && this.state.password)
        }>Sign Up</button>
      </div>);
    }
  }
  goOnline (userid) {
    userid = (skygear.currentUser) ? skygear.currentUser.id : userid;
    if (userid) {
      setStatus('online', userid);
      getProfile(userid)
        .then((records) => {
          console.log(records[0].nickname);
          this.setState({
            myNickname: records[0].nickname,
            win: records[0].win,
            lose: records[0].lose
          });
        }, (error) => console.error(error));
      getAllHistory(userid).then((histories) => {
        console.log(histories);
        this.setState({ histories });
      }, (error) => console.error(error));
      skygear.on(userid, (data) => {
        if (data.challenge) {
          let accept = confirm(`${data.nickname} challenges you. Accept?`);
          skygear.pubsub.publish(data.id, { accept });
          if (accept) {
            setStatus('ingame', userid);
            this.setState({ game: true, challenge: data, black: false });
          }
        } else if (this.state.challenge) {
          if (data.accept) {
            alert(`${this.state.challenge.nickname} accepted your challenge.`);
            clearTimeout(this.state.timer);
            setStatus('ingame', userid);
            this.setState({ game: true, timer: null, black: true });
          } else {
            alert(`${this.state.challenge.nickname} refused your challenge.`);
            clearTimeout(this.state.timer);
            this.setState({ timer: null, challenge: false });
          }
        }
      });
      this.refresh();
    }
  }
  componentDidMount () {
    this.goOnline()
    skygear.onUserChanged((user) => {
      if (user) {
        this.goOnline(user.id);
      }
    });
  }
  change (id, value) {
    this.setState({ ['' + id]: value });
  }
  login () {
    skygear.loginWithUsername(this.state.username, this.state.password)
      .then((user) => {
        console.log('login success');
        return getProfile(user.id);
      }).then((profiles) => {
        this.setState({ myNickname: profiles[0].nickname });
      }, (error) => {
        console.error(error);
        alert(error.error.message);
      });
  }
  signup () {
    skygear.signupWithUsername(this.state.username, this.state.password)
      .then((user) => setProfile({
        nickname: this.state.nickname,
        win: 0
      }, user.id))
      .then((record) => {
        console.log('signup success');
        this.setState({ myNickname: this.state.nickname });
      }, (error) => {
        console.error(error);
        alert(error.error.message);
      });
  }
  logout () {
    setStatus('offline', skygear.currentUser.id)
      .then(() => {
        return skygear.logout();
      }).then(() => {
        this.forceUpdate();
      }, (error) => console.error(error));
  }
  refresh (event) {
    const id = skygear.currentUser.id;
    this.setState({ updating: true })
    getUsersWithStatus('online', id).then((onlineUsers) => {
      this.setState({ onlineUsers, updating: false });
    }, (error) => console.error(error));
  }
  challenge (user) {
    skygear.pubsub.publish(user._id, {
      challenge: true,
      nickname: this.state.myNickname,
      id: skygear.currentUser.id
    });
    let timer = setTimeout(() => {
      alert(`${this.state.challenge.nickname} might not be online.`)
      this.setState({ challenge: false, timer: null });
    }, 8000);
    this.setState({ challenge: { id: user._id, nickname: user.nickname }, timer });
  }
  exit () {
    console.log('exit is called with this being: %o', this);
    this.goOnline();
    this.setState({ challenge: false, game: false, history: null });
  }
  view (history) {
    setStatus('view', skygear.currentUser.id);
    this.setState({ game: true, history });
  }
  challengeAI () {
    this.setState({ ai: true });
  }
}
