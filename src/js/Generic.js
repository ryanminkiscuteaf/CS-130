import React from 'react';
import ReactCanvas from 'react-canvas';

import DraggableComponent from './DraggableComponent';

let Layer = ReactCanvas.Layer;

class Generic extends DraggableComponent {
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
      <Layer
        style={objStyle}
        onMouseDown={this.handleMouseDown}
        onMouseMove={this.handleMouseMove}
        onMouseUp={this.handleMouseUp}
      >
      </Layer>
    );
  }
}

Generic.propTypes = {
  width: React.PropTypes.number.isRequired,
  height: React.PropTypes.number.isRequired
};

export default Generic;
