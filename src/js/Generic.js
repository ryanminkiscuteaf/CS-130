import React from 'react';
import ReactCanvas from 'react-canvas';

import DraggableComponent from './DraggableComponent';
import Circle from './shapes/Circle';
import Rectangle from './shapes/Rectangle';

let Group = ReactCanvas.Group;

class Generic extends React.Component {
  constructor() {
    super();

    this.state = {
      shapes: [],
      anchors: []
    };

    this.calculateBoundingBox = this.calculateBoundingBox.bind(this);
  }

  componentWillMount() {
    this.state = {
      shapes: this.props.shapes,
      height: this.props.height,
      width: this.props.width
    };

    var box = this.calculateBoundingBox();
    var size = box.size;
    var offset = box.offset;

    if (this.props.hasOwnProperty('setDragSize')) {
      this.props.setDragSize(size[0], size[1], offset[0], offset[1]);
    }

    this.setState({
      width: size[0],
      height: size[1],
      offset: offset
    });
  }

  addShape(shape) {
    relative_x = this.props.xCoord - shape.left;
    relative_y = this.props.yCoord - shape.top;

    this.setState({
      shapes: this.state.shapes.concat(
        {
          type: shape.type,
          width: shape.width,
          height: shape.height,
          top: relative_y,
          left: relative_x
        }
      )
    });
  }

  calculateBoundingBox() {
    var min_x = Number.MAX_SAFE_INTEGER,
        min_y = Number.MAX_SAFE_INTEGER,
        max_x = 0,
        max_y = 0;

    for (var i = 0; i < this.state.shapes.length; i++) {
      var shape = this.state.shapes[i];
      if (shape.top < min_y) { min_y = shape.top; }
      if (shape.left < min_x) { min_x = shape.left; }
      if (shape.top + shape.height > max_y) { max_y = shape.top + shape.height; }
      if (shape.left + shape.width > max_x) { max_x = shape.left + shape.width; }
    }

    var size = [max_x - min_x, max_y - min_y];
    var offset = [min_x, min_y];
    return {'size': size, 'offset': offset};
  }

  getStyle() {
    return {
      top: this.props.yCoord + this.state.offset[1],
      left: this.props.xCoord + this.state.offset[0],
      width: this.state.width,
      height: this.state.height,
      backgroundColor: '#00ff00'
    };
  }

  render() {
    var objStyle = this.getStyle();

    return (
      <Group style={objStyle}>
        {
          this.state.shapes.map(function(shape) {
            return (
              <Circle
                key={shape.id}
                style={{
                  top: this.props.yCoord + shape.top,
                  left: this.props.xCoord + shape.left,
                  width: shape.width,
                  height: shape.height,
                  borderWidth: 1
                }}
              />
            );
          }.bind(this))
        }
      </Group>
    );
  }
}

Generic.propTypes = {
  xCoord: React.PropTypes.number.isRequired,
  yCoord: React.PropTypes.number.isRequired,
  width: React.PropTypes.number.isRequired,
  height: React.PropTypes.number.isRequired,
  shapes: React.PropTypes.arrayOf(
    React.PropTypes.shape({
      type: React.PropTypes.string.isRequired,
      top: React.PropTypes.number.isRequired,
      left: React.PropTypes.number.isRequired,
      width: React.PropTypes.number.isRequired,
      height: React.PropTypes.number.isRequired
    })
  ),
  setDragSize: React.PropTypes.func
};

Generic.defaultProps = {
  xCoord: 0,
  yCoord: 0,
  shapes: []
}

export default Generic;
