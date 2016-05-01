import React from 'react';
import ReactCanvas from 'react-canvas';
import Draggable from './Draggable';
import Circle from './shapes/Circle';

let Group = ReactCanvas.Group;

class DraggableCircle extends React.Component {
  componentWillMount() {
    if (this.props.hasOwnProperty('setDragSize')) {
      this.props.setDragSize(180, 180);
    }
  }

	getCircleStyle() {
		return {
			top: this.props.yCoord,
			left: this.props.xCoord,
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
      <Group>
        <Circle style={circleStyle} />
      </Group>
		);
	}
}

DraggableCircle.propTypes = {
  xCoord: React.PropTypes.number.isRequired,
  yCoord: React.PropTypes.number.isRequired,
  setDragSize: React.PropTypes.func
}

DraggableCircle.defaultProps = {
  xCoord: 0,
  yCoord: 0
}

export default DraggableCircle;
