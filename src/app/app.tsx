import {Redirect, Route, Switch} from 'react-router-dom';

import React, {FC} from 'react';
import {Search} from './search';

import {Detail} from './detail';

export const App: FC = () => {
  return (
    <>
      <Switch>
        <Redirect from="/" to="/search" exact={true} />
        <Route path="/search" component={Search} />
        <Route path="/detail" component={Detail} />
      </Switch>
    </>
  );
};
