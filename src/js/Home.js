import React from 'react';
import ReactDOM from 'react-dom';
import { Link } from 'react-router';

import Nav from './Nav';

class Home extends React.Component {
	render() {
		return (
			<div>
				<Nav />
				<div className="intro-header">
		        <div className="container">
		            <div className="row">
		                <div className="col-lg-12">
		                    <div className="intro-message">
		                    		<img src={require("./img/conjurer.png")} width="300"/>
		                        <h1>Welcome to Conjurer</h1>
		                        <h4>Computer coding is complicated.</h4>
													  <h4>Coding is written for a computer to understand.</h4>
													  <h4>Conjurer turns code into visualizations that people can understand.</h4>
		                        <hr className="intro-divider"></hr>
		                        <ul className="list-inline intro-social-buttons">
		                            <li>
		                            		<Link className="btn btn-default btn-lg" to="instructions"><span className="network-name">Show me da magic</span></Link>
		                            </li>
		                        </ul>
		                    </div>
		                </div>
		            </div>
		        </div>
	    	</div>
	    </div>
		);
	}
}

export default Home;