import React from 'react';
import ReactCanvas from 'react-canvas';
import DraggableComponent from './DraggableComponent';
import Circle from './shapes/Circle';

export default class DraggableCircle extends DraggableComponent {
	getCircleStyle() {
		return {
			top: this.state.y, 
			left: this.state.x, 
			width: 180,
			height: 180,
			backgroundColor: '#003fd1', 
			borderColor: '#000', 
			borderWidth: 2,
			//shadowColor: '#999',
			//shadowOffsetX: 15,
			//shadowOffsetY: 15,
			//shadowBlur: 20
	    };
	}

	render() {
		var circleStyle = this.getCircleStyle();

		return (
			<Circle 
				style={circleStyle} 
	        	onMouseDown={this.handleMouseDown}
	    	  	onMouseMove={this.handleMouseMove}
	    	  	onMouseUp={this.handleMouseUp} />
		);
	}
}

