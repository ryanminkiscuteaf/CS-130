import React from 'react';
import ReactCanvas from 'react-canvas';
import Rectangle from '../shapes/Rectangle';

let Group = ReactCanvas.Group;

class Cursor extends React.Component {
	constructor() {
		super();
	}

	componentWillMount() {
		this.state = {
			showCursor: true
		};

		var that = this;
		this.timer = setInterval(function() {
			var curState = that.state;
			curState.showCursor = that.props.isMoving ? true : !that.state.showCursor;
			that.setState(curState);
		}, 666);
	}

	componentWillUnmount() {
		// IMPORTANT: Stop timer to prevent memory leaks
		clearInterval(this.timer);
	}

	getCursorStyle() {
  	return {
  		top: this.props.style.top,
  		left: this.props.style.left,
  		width: this.props.style.width,
  		height: this.props.style.height,
  		backgroundColor: this.props.style.backgroundColor
  	};
  }

	renderCursor() {
		return (
			<Rectangle style={this.getCursorStyle()} />
		);
	}

	render() {
		return (
			<Group>
				{this.props.isVisible && this.state.showCursor && this.renderCursor()}
			</Group>
		);
	}
}

export default Cursor;