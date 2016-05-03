'use strict';

import React from 'react';
import ReactCanvas from 'react-canvas';

import Draggable from '../Draggable';
import Generic from '../Generic';

var Group = ReactCanvas.Group;
var Event = require('../event/EventNames');
var ee = require('../event/EventEmitter');

class Item extends React.Component {
  constructor() {
    super();

    this.mouseX = 0;
    this.mouseY = 0;
    this.isLifted = false;
    this.hasCloned = false;

    // Initialize mouse handlers
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  componentWillMount() {
    this.calculateGenericAttributes();
  }

  componentWillReceiveProps() {
    this.calculateGenericAttributes();
  }

  renderGeneric() {
    return (
      <Draggable xCoord={this.state.x} yCoord={this.state.y}>
        <Generic
          key={this.state.id}
          width={this.state.width}
          height={this.state.height}
          shapes={this.state.shapes} />
      </Draggable>
    );
  }

  /*
  onMouseDown={this.handleMouseDown}
  onMouseMove={this.handleMouseMove}
  onMouseUp={this.handleMouseUp}
  */

	render() {
    return (
      <Group 
        style={this.getStyle()}
        onClick={this.handleClick}>
        {this.renderGeneric()}
      </Group>
    );
	}

	getStyle() {
		return {
      top: this.props.parentTop,
      left: this.props.parentLeft,
      width: this.props.width,
      height: this.props.height,
      backgroundColor: (this.props.itemIndex % 2) ? '#eee' : '#a5d2ee',
    };
	}

  /**
   * Mouse Events
   */

  handleMouseDown(e) {
    console.log("Mouse down123");

    this.isLifted = true;
    this.mouseX = e.clientX;
    this.mouseY = e.clientY;
  }

  handleMouseMove(e) {
    if (this.isLifted) {
      console.log("Mouse move on item with id: " + this.props.id);

      var deltaX = Math.abs(this.mouseX - e.clientX);
      var deltaY = Math.abs(this.mouseY - e.clientY);

      console.log(e.clientX);
      console.log(e.clientY);

      // Clone item if mouse moves for a certain distance
      if (!this.hasCloned && (deltaX > 10 || deltaY > 10)) {
        this.cloneItem(e.clientX, e.clientY);
      }

    }
  }

  handleMouseUp(e) {
    console.log("Mouse up123");
    this.isLifted = false;
  }

  handleClick(e) {
    this.cloneItem(e.clientX, e.clientY);
  }

  /**
   * Misc
   */

  cloneItem(x, y) {
    console.log("Clone item with id: " + this.props.id);
    this.hasCloned = true;
    var clone = this.state;
    clone.x = x;
    clone.y = y;
    ee.emitEvent(Event.PARTS_BIN_CLONE_ITEM_EVENT, [clone]);
  }

  calculateGenericAttributes() {
    var width = this.props.width;
    var height = this.props.height;
    var padding = this.props.padding;
    var doublePadding = padding * 2;

    var top = 0;
    var left = 0;
    var side = 0;
    if (width >= height) {
      top = this.props.parentTop + padding;
      left = this.props.parentLeft + ((width - height + doublePadding) / 2);
      side = height - doublePadding;
    } else {
      top = this.props.parentTop + ((height - width + doublePadding) / 2);
      left = this.props.parentLeft + padding; 
      side = width - doublePadding;
    }

    // Calculate generic size
    // Assume that one of the children has top: 0 and
    // one has left: 0
    var defWidth = Math.max(...this.props.shapes.map(child => child.left + child.width));
    var defHeight = Math.max(...this.props.shapes.map(child => child.top + child.height));

    //console.log("w: " + defWidth);
    //console.log("h: " + defHeight);

    var maxSide = Math.max(defWidth, defHeight);
    var newTop = top;
    var newLeft = left;

    // Resize all the children of the generic
    var factor = side / maxSide;
    var resizedShapes = this.props.shapes.map(function(c) {
      return {
        type: c.type,
        top: c.top * factor,
        left: c.left * factor,
        width: c.width * factor,
        height: c.height * factor
      };
    });

    if (defWidth >= defHeight) {

      newTop = top + (((defWidth - defHeight) / 2) * factor);
      
    } else {

      newLeft = left + (((defHeight - defWidth) / 2) * factor);

    }

    // Save states
    this.setState({
      id: this.props.id,
      x: newLeft,
      y: newTop,
      width: side,
      height: side,
      shapes: resizedShapes
    });
  }
}

Item.propTypes = {
  parentTop: React.PropTypes.number.isRequired,
  parentLeft: React.PropTypes.number.isRequired,
	width: React.PropTypes.number.isRequired,
  height: React.PropTypes.number.isRequired,
  padding: React.PropTypes.number.isRequired,
  itemIndex: React.PropTypes.number.isRequired,
  id: React.PropTypes.number.isRequired,
  shapes: React.PropTypes.array.isRequired
};

export default Item;