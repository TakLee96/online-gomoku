import 'core-js/fn/object/assign';
import React from 'react';
import { render } from 'react-dom';
import App from './components/Main';

import skygear from 'skygear';
import config from 'config';

skygear.config(config.skygear)
  .then(() => {
    render(<App />, document.getElementById('app'));
  }, (error) => {
    alert(JSON.stringify(error));
  });
