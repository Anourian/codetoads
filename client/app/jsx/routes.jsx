import React from 'react';
import { Route, IndexRoute } from 'react-router';

import HomeContent from './home/homeContent';
import Lobby from './lobby/lobby';
import Layout from './layout';
import Game from './game/game';
import Game2 from './game/game2';


function checkAuth(nextState, replace) {

  var authenticated = localStorage.getItem('id_token') ? true : false;
  if (!authenticated) {
    replace({
      pathname: '/',
      state: {
        nextPathname: nextState.location.pathname,
      },
    });
  }
}

export default (
    <Route path='/' component={Layout}>
      <IndexRoute component={HomeContent} />
      <Route path='/lobby' component={Lobby} onEnter={checkAuth} />
      <Route path='/play' component={Game} />
      <Route path='/play/:test' component={Game2} />
      <Route path="*" component={HomeContent}/>
    </Route>
)
