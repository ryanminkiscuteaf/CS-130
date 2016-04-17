import React from 'react';
import ReactCanvas from 'react-canvas'

import DraggableComponent from './DraggableComponent';

var Text = ReactCanvas.Text;

class Test extends DraggableComponent {
  getTextStyle() {
    return {
      top: this.state.y,
      left: this.state.x,
      width: window.innerWidth,
      height: 50,
      lineHeight: 20,
      fontSize: 25
    };
  }

  render() {
    var textStyle = this.getTextStyle();

    return (
      <Text
        style={textStyle}
        onMouseDown={this.handleMouseDown}
        onMouseMove={this.handleMouseMove}
        onMouseUp={this.handleMouseUp}
      >
        hello world
      </Text>
    );
  }
}

export default Test;
