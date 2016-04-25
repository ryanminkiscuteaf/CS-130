import React from 'react';
import ReactCanvas from 'react-canvas'

import DraggableComponent from './DraggableComponent';

var Text = ReactCanvas.Text;

class Test extends DraggableComponent {
  componentWillMount() {
    this.setState({
      x: this.props.xCoord,
      y: this.props.yCoord
    });

    if (this.props.hasOwnProperty('setDragSize')) {
      this.props.setDragSize(window.innerWidth, 50);
    }
  }

  getTextStyle() {
    return {
      top: this.props.yCoord,
      left: this.props.xCoord,
      width: window.innerWidth,
      height: 50,
      lineHeight: 20,
      fontSize: 25
    };
  }

  render() {
    var textStyle = this.getTextStyle();

    return (
      <Text style={textStyle}>
        hello world
      </Text>
    );
  }
}

Test.propTypes = {
  xCoord: React.PropTypes.number.isRequired,
  yCoord: React.PropTypes.number.isRequired,
  setDragSize: React.PropTypes.func
}

Test.defaultProps = {
  xCoord: 0,
  yCoord: 0
}

export default Test;
