import React, {FC} from 'react';
import {render} from 'react-dom';
import {App} from './app';
import {BrowserRouter as Router} from 'react-router-dom';

const Main: FC = () => {
  return (
    <>
      <Router>
        <App />
      </Router>
    </>
  );
};

render(<Main />, document.getElementById('main'));
