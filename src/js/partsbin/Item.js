'use strict';

import React from 'react';
import ReactCanvas from 'react-canvas';

import Generic from '../Generic';
import Obj from '../Obj';

var Group = ReactCanvas.Group;
var Event = require('../event/EventNames');
var ee = require('../event/EventEmitter');

class Item extends React.Component {
  constructor() {
    super();

    // Initialize mouse handlers
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
      <Generic
        key={this.state.obj.id}
        xCoord={this.state.obj.x}
        yCoord={this.state.obj.y}
        shapes={this.state.obj.shapes} />
    );
  }

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

  handleClick(e) {
    this.cloneItem(e.clientX, e.clientY);
  }

  /**
   * Misc
   */

  cloneItem(x, y) {
    console.log("Clone item with id: " + this.props.id);
    var clone = this.state.obj;
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

    var maxSide = Math.max(defWidth, defHeight);
    var newTop = top;
    var newLeft = left;

    // Resize all the children of the generic
    var factor = side / maxSide;
    var resizedShapes = this.props.shapes.map(function(c) {
      c.top = c.top * factor;
      c.left = c.left * factor;
      c.width = c.width * factor;
      c.height = c.height * factor;

      return c;
    });

    if (defWidth >= defHeight) {
      newTop = top + (((defWidth - defHeight) / 2) * factor);
    } else {
      newLeft = left + (((defHeight - defWidth) / 2) * factor);
    }

    // Save states
    var obj = new Obj({
      id: this.props.id,
      x: newLeft,
      y: newTop,
      width: side,
      height: side,
      shapes: resizedShapes
    });
    this.setState({obj: obj});
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