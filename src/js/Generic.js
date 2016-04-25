import React from 'react';
import ReactCanvas from 'react-canvas';

import DraggableComponent from './DraggableComponent';
import Circle from './shapes/Circle';
import Rectangle from './shapes/Rectangle';

let Layer = ReactCanvas.Layer;

class Generic extends DraggableComponent {
  constructor() {
    super();

    this.setState({
      shapes: [],
      anchors: []
    });
  }

  addShape(shape) {
    relative_x = this.state.x - shape.left;
    relative_y = this.state.y - shape.top;

    this.setState({
      shapes: this.state.shapes.concat(
        {
          type: shape.type,
          width: shape.width,
          height: shape.height,
          top: shape.top,
          left: shape.left
        }
      )
    });
  }

  calculateBoundingBox() {

  }

  getStyle() {
    return {
      top: this.state.y,
      left: this.state.x,
      width: this.props.width,
      height: this.props.height,
      backgroundColor: '#ff0000'
    };
  }

  render() {
    var objStyle = this.getStyle();

    return (
      <Group
        style={objStyle}
        onMouseDown={this.handleMouseDown}
        onMouseMove={this.handleMouseMove}
        onMouseUp={this.handleMouseUp}
      >
        {
          this.state.shapes.map(function(shape) {
            return (
              <Circle
                key={shape.id}
                style={{
                  top: shape.top,
                  left: shape.left,
                  width: shape.width,
                  height: shape.height,
                  borderWidth: 1
                }}
              />
            );
          })
        }
      </Group>
    );
  }
}

Generic.propTypes = {
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
  )
};

export default Generic;
