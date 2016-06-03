import React from 'react';
import ReactCanvas from 'react-canvas';

import Circle from './shapes/Circle';
import Hook from './shapes/Hook';
import Rectangle from './shapes/Rectangle';
import OperatorPrimitive from './shapes/OperatorPrimitive';
import NumberPrimitive from './shapes/NumberPrimitive';
import Line from './shapes/Line';

let Group = ReactCanvas.Group;
let Color = require('./ColorConstants');

class Generic extends React.Component {
  constructor() {
    super();

    this.ratio = 1;

    this.calculateBoundingBox = this.calculateBoundingBox.bind(this);
  }

  componentWillMount() {
    this.state = {
      shapes: this.props.shapes,
      top: this.props.yCoord,
      left: this.props.xCoord
    };

    var box = this.calculateBoundingBox();
    var size = box.size;
    var offset = box.offset;
    var absolute_offset = box.absolute_offset;

    this.setState({
      width: size[0],
      height: size[1],
      offset: offset,
      absolute_offset: absolute_offset
    });

    if (this.props.hasOwnProperty('constrain') && this.props.constrain) {
      let wFits = this.props.width / size[0];
      let hFits = this.props.height / size[1];
      let ratio = wFits > hFits ? hFits : wFits;
      this.ratio = ratio;

      // recalculate with new constraints
      let newBox = this.calculateBoundingBox();
      size = newBox.size;

      this.setState({
        width: size[0],
        height: size[1],
        absolute_offset: newBox.absolute_offset
      });
    }

    // if this was instantiated by a draggable
    if (this.props.hasOwnProperty('setDragSize')) {
      this.props.setDragSize(size[0], size[1], offset[0] * this.ratio, offset[1] * this.ratio);
      this.setState({
        top: this.props.yCoord / this.ratio,
        left: this.props.xCoord / this.ratio,
        absolute_offset: {'x': 0, 'y': 0}
      });
    }
  }

  componentWillReceiveProps(nextProps) {
    // if this was instantiated by a draggable
    if (this.props.hasOwnProperty('setDragSize')) {
      this.setState({
        top: nextProps.yCoord / this.ratio,
        left: nextProps.xCoord / this.ratio
      });
    }
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

    max_x *= this.ratio;
    max_y *= this.ratio;
    min_x *= this.ratio;
    min_y *= this.ratio;

    var size = [max_x - min_x, max_y - min_y];
    var offset = [min_x, min_y];

    let pos_x = (this.state.left * this.ratio) + min_x;
    let pos_y = (this.state.top * this.ratio) + min_y;
    var abs_offset = {
      'x': this.state.left - pos_x,
      'y': this.state.top - pos_y
    };

    return {'size': size, 'offset': offset, 'absolute_offset': abs_offset};
  }

  getStyle() {
    let pos_x = (this.state.left + this.state.offset[0]) * this.ratio;
    let pos_y = (this.state.top + this.state.offset[1]) * this.ratio;

    return {
      top: pos_y + this.state.absolute_offset.y,
      left: pos_x + this.state.absolute_offset.x,
      width: this.state.width,
      height: this.state.height
    };
  }

  renderShape(pos_x, pos_y, shape) {

    switch (shape.type) {
      case 'circle':
        return this.renderCircle(pos_x, pos_y, shape);

      case 'hook':
        return this.renderHook(pos_x, pos_y, shape);

      case 'operator':
        return this.renderOperatorPrimitive(pos_x, pos_y, shape);
        
      case 'number':
        return this.renderNumberPrimitive(pos_x, pos_y, shape);

      case 'line':
        return this.renderLine(pos_x, pos_y, shape);

      case 'group':
        return this.renderGroup(pos_x, pos_y, shape);
        
      default:
        return this.renderCircle(pos_x, pos_y, shape);
    } 
  }
  
  renderCircle(pos_x, pos_y, shape) {
    return (
      <Circle
        key={shape.id}
        style={{
          top: pos_y + this.state.absolute_offset.y,
          left: pos_x + this.state.absolute_offset.x,
          width: shape.width * this.ratio,
          height: shape.height * this.ratio,
          backgroundColor: shape.color || Color.NODE
        }} />
    );
  }

  renderHook(pos_x, pos_y, shape) {
    return (
      <Hook
        key={shape.id}
        style={{
          top: pos_y + this.state.absolute_offset.y,
          left: pos_x + this.state.absolute_offset.x,
          width: shape.width * this.ratio,
          height: shape.height * this.ratio,
          backgroundColor: shape.color || Color.ANCHOR
        }} />
    );
  }

  renderOperatorPrimitive(pos_x, pos_y, shape) {
    return (
      <OperatorPrimitive 
        key={shape.id}
        id={shape.id}
        value={shape.value}
        style={{
          top: pos_y + this.state.absolute_offset.y,
          left: pos_x + this.state.absolute_offset.x, 
          width: shape.width * this.ratio,
          height: shape.height * this.ratio,
          backgroundColor: shape.color || Color.OPERATOR_PRIMITIVE
        }} />
    );
  }

  renderNumberPrimitive(pos_x, pos_y, shape) {
    return (
      <NumberPrimitive 
        key={shape.id}
        id={shape.id}
        value={shape.value}
        shape={shape}
        style={{
          top: pos_y + this.state.absolute_offset.y,
          left: pos_x + this.state.absolute_offset.x, 
          width: shape.width * this.ratio,
          height: shape.height * this.ratio,
          backgroundColor: shape.color || Color.NUMBER_PRIMITVE
        }} />
    );
  }

  renderLine(pos_x, pos_y, shape) {
    return (
      <Line
        key={shape.id}
        id={shape.id}
        style={{
          top: pos_y + this.state.absolute_offset.y,
          left: pos_x + this.state.absolute_offset.x, 
          width: shape.width * this.ratio,
          height: shape.height * this.ratio,
          direction: shape.direction
        }} />
    );
  }

  renderGroup(pos_x, pos_y, shape) {
    return (
      <Group
        key={shape.id}
        style={{
          top: pos_y + this.state.absolute_offset.y,
          left: pos_x + this.state.absolute_offset.x, 
          width: shape.width * this.ratio,
          height: shape.height * this.ratio,
        }} />
    );
  }

  render() {
    var objStyle = this.getStyle();

    return (
      <Group style={objStyle}>
        {
          this.state.shapes.map(function(shape) {
            let pos_x = (this.state.left + shape.left) * this.ratio;
            let pos_y = (this.state.top + shape.top) * this.ratio;
            // Render shape according to its type
            return this.renderShape(pos_x, pos_y, shape);
          }.bind(this))
        }
      </Group>
    );
  }
}

Generic.propTypes = {
  xCoord: React.PropTypes.number.isRequired,
  yCoord: React.PropTypes.number.isRequired,
  width: React.PropTypes.number,
  height: React.PropTypes.number,
  shapes: React.PropTypes.arrayOf(
    React.PropTypes.shape({
      type: React.PropTypes.string.isRequired,
      top: React.PropTypes.number.isRequired,
      left: React.PropTypes.number.isRequired,
      width: React.PropTypes.number.isRequired,
      height: React.PropTypes.number.isRequired
    })
  ),
  setDragSize: React.PropTypes.func,
  constrain: React.PropTypes.bool
};

Generic.defaultProps = {
  xCoord: 0,
  yCoord: 0,
  shapes: [],
  constrain: false
};

export default Generic;
