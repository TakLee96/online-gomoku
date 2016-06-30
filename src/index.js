import 'core-js/fn/object/assign';
import React from 'react';
import { render } from 'react-dom';
import App from './components/Main';

import skygear from 'skygear';
import config from 'config';
import { setStatus } from './libraries/util';

skygear.config(config.skygear)
  .then(() => {
    render(<App />, document.getElementById('app'));
  }, (error) => {
    console.error(error);
  });

window.onbeforeunload = function () {
  if (skygear.currentUser) {
    setStatus('offline', skygear.currentUser.id);
  }
};
