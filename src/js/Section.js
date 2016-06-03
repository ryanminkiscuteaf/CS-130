import React from 'react';
import ReactDOM from 'react-dom';
import { Link } from 'react-router';

class Section extends React.Component {

	renderList() {
		var list = this.props.list;
		var elems = [];
		for (var i = 0; i < list.length; i++) {
			elems.push(<li className="list-group-item">{list[i]}</li>);
		}

		return (
			<ul className="list-group">
				{elems}
			</ul>
		);
	}

	renderButton() {
		return (
			<ul className="list-inline">
          <li>
          		<Link to="magic-room" className="btn btn-default btn-lg">{this.props.button}</Link>
          </li>
      </ul>
		);
	}

	renderA() {
		return (
			<div className="content-section-a">
	        <div className="container">
	            <div className="row">
	                <div className="col-lg-5 col-sm-6">
	                    <hr className="section-heading-spacer"/>
	                    <div className="clearfix"></div>
	                    <h2 className="section-heading">{this.props.title}</h2>
	                    <p className="lead">{this.props.body}</p>
	                    {this.props.list.length > 0 && this.renderList()}
	                    {this.props.button != "" && this.renderButton()}
	                </div>
	                <div className="col-lg-5 col-lg-offset-2 col-sm-6">
	                    <img className="img-responsive" src={this.props.img} alt=""/>
	                </div>
	            </div>
	        </div>
	    </div>
		);
	}

	renderB() {
		return (
			<div className="content-section-b">
	        <div className="container">
	            <div className="row">
	                <div className="col-lg-5 col-lg-offset-1 col-sm-push-6  col-sm-6">
	                    <hr className="section-heading-spacer"/>
	                    <div className="clearfix"></div>
	                    <h2 className="section-heading">{this.props.title}</h2>
	                    <p className="lead">{this.props.body}</p>
	                    {this.props.list.length > 0 && this.renderList()}
	                    {this.props.button != "" && this.renderButton()}
	                </div>
	                <div className="col-lg-5 col-sm-pull-6  col-sm-6">
	                    <img className="img-responsive" src={this.props.img} alt=""/>
	                </div>
	            </div>
	        </div>
	    </div>
		);
	}

	render() {
		return this.props.left ? this.renderA() : this.renderB();
	}
}

export default Section;