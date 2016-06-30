import 'core-js/fn/object/assign';
import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/Main';

import skygear from 'skygear';
import config from 'config';

skygear.config(config.skygear)
  .then(
    (cntnr) => { console.log('nice!'); },
    (error) => { console.error(error); }
  );

// Render the main component into the dom
ReactDOM.render(<App />, document.getElementById('app'));
