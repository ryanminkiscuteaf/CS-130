import React from 'react';
import ReactDOM from 'react-dom';

class Header extends React.Component {
	render() {
		var bannerClass = this.props.alt ? "banner altbanner" : "banner";

		return (
			<div className={bannerClass}>
	        <div className="container">
	            <div className="row">
	                <div className="col-lg-12">
	                    <h2 className="text-center">{this.props.title}</h2>
	                </div>
	            </div>
	        </div>
	    </div>
		);
	}
}

export default Header;
