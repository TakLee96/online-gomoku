import 'core-js/fn/object/assign';
import 'core-js/fn/array/includes';
import 'core-js/fn/string/includes';

import React from 'react';
import { render } from 'react-dom';
import { Router, Route, IndexRoute, Redirect, hashHistory, withRouter } from 'react-router';

import { App, LogIn, SignUp } from './components/Main';
import Home from './components/Home';
import Java from './components/Java';
import Game from './components/Game';
import History from './components/History';

import skygear from 'skygear';
import config from 'config';

class Container extends React.Component {
  render() {
    return <div>{this.props.children}</div>;
  }
}

const app = (<Router history={hashHistory}>
  <Route path="/" component={Container}>
    <IndexRoute component={withRouter(App)}></IndexRoute>
    <Route path="login" component={withRouter(LogIn)}></Route>
    <Route path="signup" component={withRouter(SignUp)}></Route>
    <Route path="home" component={withRouter(Home)}></Route>
    <Route path="java" component={Java}></Route>
    <Route path="game/:gameId" component={Game}></Route>
    <Route path="history/:historyId" component={History}></Route>
    <Redirect from="*" to="home"></Redirect>
  </Route>
</Router>);

skygear.config(config.skygear).then(() => {
  window.skygear = skygear;
  render(app, document.getElementById('app'));
}, (error) => {
  console.error(error);
});
