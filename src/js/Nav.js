import React from 'react';
import ReactDOM from 'react-dom';
import { Link } from 'react-router';

require('./css/bootstrap.css');
require('./css/landing-page.css');

class Nav extends React.Component {
	render() {
		return (
			<nav className="navbar navbar-default topnav" role="navigation">
        <div className="container topnav">
            <div className="navbar-header">
                <button type="button" className="navbar-toggle" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1">
                    <span className="sr-only">Toggle navigation</span>
                    <span className="icon-bar"></span>
                    <span className="icon-bar"></span>
                    <span className="icon-bar"></span>
                </button>
                <Link to="home" className="navbar-brand topnav">Conjurer</Link>
            </div>
            <div className="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
                <ul className="nav navbar-nav navbar-right">
                    <li>
                        <Link to="home">Home</Link>
                    </li>
                    <li>
                        <Link to="instructions">Instructions</Link>
                    </li>
                    <li>
                        <Link to="magic-room">Magic Room</Link>
                    </li>
                </ul>
            </div>
        </div>
    	</nav>
		);
	}
}

export default Nav;