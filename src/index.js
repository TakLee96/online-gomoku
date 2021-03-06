import 'core-js/fn/object/assign';
import 'core-js/fn/array/includes';
import 'core-js/fn/string/includes';

import React from 'react';
import { render } from 'react-dom';
import { Router, Route, IndexRoute, hashHistory, withRouter } from 'react-router';

import { App, LogIn, SignUp } from './components/Main';
import Home from './components/Home';
import Java from './components/Java';
import Game from './components/Game';
import History from './components/History';

import skygear from 'skygear';
import config from 'config';

skygear.config(config.skygear).then(() => {
  if (window) {
    window.skygear = skygear;
  } else {
    console.error('window is not defined');
  }
  console.log('skygear is configured');

  class Container extends React.Component {
    componentDidMount() {
      skygear.onUserChanged((user) => {
        if (!user) {
          this.props.router.push('/');
        } else {
          this.props.router.push('/home');
        }
      });
    }
    render() { return <div>{this.props.children}</div>; }
  }

  class Empty extends React.Component {
    render() { return <div>404</div>; }
  }

  render((<Router history={hashHistory}>
    <Route path="/" component={withRouter(Container)}>
      <IndexRoute component={withRouter(App)}></IndexRoute>
      <Route path="login" component={withRouter(LogIn)}></Route>
      <Route path="signup" component={withRouter(SignUp)}></Route>
      <Route path="home" component={withRouter(Home)}></Route>
      <Route path="java" component={Java}></Route>
      <Route path="game/:gameId" component={Game}></Route>
      <Route path="history/:historyId" component={History}></Route>
      <Route path="*" component={Empty}></Route>
    </Route>
  </Router>), document.getElementById('app'));
}, (error) => {
  console.error(error);
});

console.log('index finish executed');
window.skygear = skygear;

