/**
 * Created by lowellbander on 4/12/16.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import ReactCanvas from 'react-canvas';
import { Router, Route, hashHistory, Link } from 'react-router';

import Home from './Home';
import Instructions from './Instructions';
import Workspace from './Workspace';

class Conjurer extends React.Component {
  render() {
    return (
      <div>
      </div>
    );
  }
}

ReactDOM.render(
  <Router history={hashHistory}>
    <Route path="/" component={Home}></Route>
    <Route name="home" path="home" component={Home}></Route>
    <Route name="instructions" path="instructions" component={Instructions}/>
    <Route name="magic-room" path="magic-room" component={Workspace}></Route>
  </Router>,
  document.getElementById('main')
);

export default Conjurer;
