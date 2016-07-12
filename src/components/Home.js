import React from 'react';
import { Link } from 'react-router';

import * as util from '../libraries/util';

export default class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      profile: {
        win: 'loading',
        lose: 'loading',
        status: 'loading',
        nickname: 'loading',
        unfinished: 'loading',
        avatar: { url: '' }
      },
      games: [],
      users: [],
      refreshing: false,
      challenging: false,
      timer: null
    };
    this.defaultImageURL = 'https://crunchbase-production-res.cloudinary.com/image/upload/c_pad,h_140,w_140/v1398245600/rr1njzmn7pdha7z5av4r.png';
  }

  componentDidMount() {
    if (!util.online()) return this.props.router.push('/');

    util.setStatus('online');
    util.getProfile().then((profiles) => {
      this.setState({ profile: profiles[0] });
    }, (error) => console.error(error));
    util.getGames().then((games) => {
      this.setState({ games });
    }, (error) => console.error(error));
    util.getUsers().then((users) => {
      this.setState({ users });
    }, (error) => console.error(error));
    util.waitChallenge(this.challengeReceived, this.challengeAccepted,
                  this.challengeRefused, this.challengeConfirmed);

    this.props.router.setRouteLeaveHook(this.props.route, this.routerWillLeave);
  }

  routerWillLeave = (nextLocation) => {
    var pathname = nextLocation.pathname;
    if (['/login', '/signup', '/'].includes(pathname)) {
      return !util.online();
    }
    if (pathname === '/java') {
      util.setStatus('ingame');
    } else if (pathname.includes('history')) {
      util.setStatus('history');
    } else if (pathname.includes('game')) {
      util.setStatus('ingame');
    } else {
      console.log('unrecognized location:', nextLocation);
    }
    return true;
  };

  challengeAI = () => {
    this.props.router.push('/java');
  };

  challenge = (user) => {
    util.postChallenge(user._id, {
      challenge: true,
      nickname: this.state.profile.nickname
    });
    this.setState({ challenging: user, timer: setTimeout(() => {
      alert(`${user.nickname} seems not to be online...`);
      this.setState({ challenging: false });
    }, 8000) });
  };
  challengeReceived = (data) => {
    if (!this.state.challenging) {
      let late = false;
      let timer = setTimeout(() => {
        late = true;
        alert(`You respond to ${data.nickname} too late...`);
      }, 4000);
      let accept = confirm(`${data.nickname} challenges you. Accept?`);
      if (!late) {
        clearTimeout(timer);
        if (accept) this.setState({ challenging: data, timer: setTimeout(() => {
          alert(`${data.nickname} didn't receive your reply :(`);
          this.setState({ challenging: false });
        }, 4000) });
        util.postChallenge(data._id, { accept, nickname: this.state.profile.nickname });
      }
    }
  };
  challengeAccepted = (data) => {
    if (this.state.challenging) {
      alert(`${this.state.challenging.nickname} accepted your challenge.`);
      clearTimeout(this.state.timer);
      util.postChallenge(data._id, { confirm: true, nickname: this.state.profile.nickname });
      this.game(data);
    }
  };
  challengeRefused = (data) => {
    if (this.state.challenging && this.state.challenging._id === data._id) {
      alert(`${this.state.challenging.nickname} refused your challenge.`);
      clearTimeout(this.state.timer);
      this.setState({ challenging: false });
    }
  };
  challengeConfirmed = (data) => {
    clearTimeout(this.state.timer);
    this.game(data);
  };

  game = (data) => {
    util.terminateWaitChallenge();
    util.saveGameAndHistory(data, this.state.profile.nickname).then((result) => {
      if (result.errors[0] || result.errors[1]) console.error(result.errors);
      this.props.router.push(`/game/${result.savedRecords[1]._id}`);
    }, (error) => console.error(error));
  };

  logout = () => {
    util.logoutUser().then(() => {
      console.log('log out success');
    });
  };

  refresh = () => {
    this.setState({ refreshing: true });
    util.getUsers().then((users) => {
      this.setState({ users, refreshing: false });
    }, (error) => console.error(error));
  };

  safeURL = (avatar) => {
    if (avatar) return avatar.url;
    return false;
  };

  render() {
    return (<div>
      <hr/>
      <h3>Current Online Users</h3>
      <table>
        <thead>
          <tr>
            <th>Avatar</th>
            <th>Nickname</th>
            <th>Status</th>
            <th>#Win</th>
            <th>#Lose</th>
            <th>#Run</th>
            <th>Last Online</th>
            <th>Challenge</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><img src={this.safeURL(this.state.profile.avatar) || this.defaultImageURL} alt="loading" className="avatar" /></td>
            <td><b>{this.state.profile.nickname}</b></td>
            <td>online</td>
            <td>{this.state.profile.win}</td>
            <td>{this.state.profile.lose}</td>
            <td>{this.state.profile.unfinished}</td>
            <td>{(new Date()).toUTCString().slice(0, -4)}</td>
            <td></td>
          </tr>
          <tr>
            <td><img src="http://d3gnp09177mxuh.cloudfront.net/tech-page-images/java.png" alt="loading" className="avatar" /></td>
            <td>Tak's AI</td>
            <td>local</td>
            <td></td>
            <td></td>
            <td></td>
            <td>anytime</td>
            <td><button onClick={ this.challengeAI }>Challenge</button></td>
          </tr>
          {this.state.users.map((user, i) => (
          <tr key={'ou'+i}>
            <td><img src={this.safeURL(user.avatar) || this.defaultImageURL} alt="loading" className="avatar" /></td>
            <td>{user.nickname}</td>
            <td>{user.status}</td>
            <td>{user.win}</td>
            <td>{user.lose}</td>
            <td>{user.unfinished}</td>
            <td>{user.updatedAt.toUTCString().slice(0, -4)}</td>
            <td><button onClick={ () => this.challenge(user) } disabled={this.state.challenging}>Challenge</button></td>
          </tr>))}
        </tbody>
      </table>

      <p>
        <button onClick={this.logout}>Log Out</button>
        <button onClick={this.refresh} disabled={this.state.refreshing}>Refresh</button>
      </p>

      <hr/>
      <h3>Game History</h3>
      <table>
        <thead>
          <tr>
            <th>Nickname</th>
            <th>Match Result</th>
            <th>Side</th>
            <th>#Moves</th>
            <th>Match Time</th>
            <th>View</th>
          </tr>
        </thead>
        <tbody>{ this.state.games.map((game, i) => (
          <tr key={'h'+i}>
            <td>{game.opponentNickname}</td>
            <td>{game.status}</td>
            <td>{(game.isBlue) ? 'blue' : 'green'}</td>
            <td>{game.numMoves}</td>
            <td>{game.createdAt.toUTCString().slice(0, -4)}</td>
            <td><Link to={`/${game.history.id}`}>view</Link></td>
          </tr>)) }
        </tbody>
      </table>
    </div>);
  }
}
