import React from 'react';
import ReactCanvas from 'react-canvas';

let Group = ReactCanvas.Group;

class Draggable extends React.Component {
  constructor() {
    super();

    this.mouseX = 0;
    this.mouseY = 0;
    this.isLifted = false;

    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
  }

  componentWillMount() {
    this.state = {
      x: this.props.xCoord,
      y: this.props.yCoord,
      offset: [0, 0]
    }
  }

  setDragSize(w, h, off_x = 0, off_y = 0) {
    this.setState({
      width: w,
      height: h,
      offset: [off_x, off_y]
    });
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

  getWrapperStyle() {
    return {
      top: this.state.y + this.state.offset[1],
      left: this.state.x + this.state.offset[0],
      width: this.state.width,
      height: this.state.height,
      backgroundColor: '#ff0000'
    };
  }

  render() {
    let clones = React.Children.map(
      this.props.children,
      (child) => React.cloneElement(
        child,
        {
          xCoord: this.state.x + child.props.xCoord,
          yCoord: this.state.y + child.props.yCoord,
          setDragSize: this.setDragSize.bind(this)
        }
      )
    );

    let style = this.getWrapperStyle();

    return (
      <Group
        style={style}
        onMouseDown={this.handleMouseDown}
        onMouseMove={this.handleMouseMove}
        onMouseUp={this.handleMouseUp}
      >
        {clones}
      </Group>
    );
  }
}

Draggable.propTypes = {
  xCoord: React.PropTypes.number.isRequired,
  yCoord: React.PropTypes.number.isRequired
}

export default Draggable;
