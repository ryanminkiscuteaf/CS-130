import React from 'react';
import ReactCanvas from 'react-canvas';

class DraggableComponent extends React.Component {
  constructor() {
    super();

    this.mouseX = 0;
    this.mouseY = 0;
    this.isLifted = false;

    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseMove = this.debounce(this.handleMouseMove.bind(this), 5);
    this.handleMouseUp = this.handleMouseUp.bind(this);
  }

  componentWillMount() {
    this.setState({
      x: this.props.xCoord,
      y: this.props.yCoord
    });
  }

  debounce(func, wait) {
    var timeout;
    return function() {
      var context = this, args = arguments;
      var later = function () {
        timeout = null;
      };
      var call = !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (call) func.apply(context, args);
    };
  }

  handleMouseDown(e) {
    this.isLifted = true;
    this.mouseX = e.clientX;
    this.mouseY = e.clientY;
  }

  handleMouseMove(e) {
    if (this.isLifted) {
      var diffX = e.clientX - this.mouseX;
      var diffY = e.clientY - this.mouseY;
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;

      var newX = this.state.x + diffX;
      var newY = this.state.y + diffY;

      this.setState({
        x: newX,
        y: newY
      });
    }
  }

  handleMouseUp(e) {
    this.isLifted = false;
  }
}

DraggableComponent.propTypes = {
  xCoord: React.PropTypes.number.isRequired,
  yCoord: React.PropTypes.number.isRequired
};

export default DraggableComponent;
