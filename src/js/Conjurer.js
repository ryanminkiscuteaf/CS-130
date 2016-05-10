/**
 * Created by lowellbander on 4/12/16.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import ReactCanvas from 'react-canvas';

import Draggable from './Draggable';
import Generic from './Generic';
import PartsBin from './PartsBin';

import Button from './Button';

let Surface = ReactCanvas.Surface;
let Group = ReactCanvas.Group;
let Image = ReactCanvas.Image;
let Text = ReactCanvas.Text;

let Event = require('./event/EventNames');
let ee = require('./event/EventEmitter');

let sampleItems = require('./SampleItems');

class Conjurer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};

    // Listener for event from the Parts Bin
    ee.addListener(Event.PARTS_BIN_CLONE_ITEM_EVENT, this.cloneItem.bind(this));

    // coordinate data for drawing shapes
    this.x_orig = 0;
    this.y_orig = 0;
    this.x_curr = 0;
    this.y_curr = 0;

    this.updatePosition = this.updatePosition.bind(this);
    this.renderChild = this.renderChild.bind(this);

    this.dragref = 0;
  }

  componentWillMount() {
    this.state = {
      isDrawing: false,
      objects: [],
      parts: [],
      clone: null,
      newShapes: []
    };
  }

  handleMouseDown(e) {
    this.isDrawing = true;
    this.x_orig = e.clientX;
    this.y_orig = e.clientY;

    var defaultShape = {
      id: this.dragref,
      ref: this.dragref,
      width: 180,
      height: 180,
      x: this.x_orig,
      y: this.y_orig,
      shapes: [{
        type: 'circle',
        top: 0,
        left: 0,
        width: 50,
        height: 50
      }]
    };
    
    this.dragref++;
    
    this.setState({
      newShapes: this.state.newShapes.concat(defaultShape)
    });
  }

  getPartsBinStyle() {
    return {
      top: 0,
      left: 0,
      width: 180,
      height: window.innerHeight,
      backgroundColor: 'red',
      itemHeight: 180,
      itemPadding: 10
    };
  }

  getSampleGeneric() {
    var id = Math.floor((Math.random() * 1000) + 1);
    return {
      id: id,
      ref: id,
      shapes: [{
            type: 'circle',
            top: 0, //10
            left: 0, //10
            width: 50,
            height: 50
          },
          {
            type: 'circle',
            top: 150,
            left: 50,
            width: 60,
            height: 60
          }
          ]
    };
  }

  getTextStyle() {
    return {
      top: 0,
      left: 0,
      width: window.innerWidth,
      height: 50,
      lineHeight: 20,
      fontSize: 25
    };
  }

  getWrapperStyle() {
    return {
      top: 0,
      left: 200,
      width: window.innerWidth,
      height: window.innerHeight
    };
  }

  // Clone parts bin item given an emitted event
  cloneItem(item) {
    console.log("Clone item conjurer - id: " + item.id);

    item.id = this.dragref;
    item.ref = this.dragref;
    item.x = window.innerWidth/2;
    item.y = window.innerHeight/2;

    this.setState({
      objects: this.state.objects.concat(item)
    });

    this.dragref++;
  }

  /*
  REPLACE DRAGGABLE OBJECT IN RENDER WITH THIS GENERIC
  BELOW IF YOU DONT WANT IT TO BE DRAGGABLE

<Generic
  xCoord={obj.x}
  yCoord={obj.y}
  key={obj.id}
  width={obj.width}
  height={obj.height}
  shapes={obj.shapes} />
  */

  updatePosition(x, y, shape) {
    shape.x = x;
    shape.y = y;
  }

  renderChild(child) {
    var onChange = function (x, y) {
      this.updatePosition(x, y, child);
    }.bind(this);
    return (
        <Draggable xCoord={child.x} yCoord={child.y} onChange={onChange}>
          <Generic
              key={child.id}
              width={child.width}
              height={child.height}
              shapes={child.shapes}
              constrain={true}
              />
        </Draggable>
    );
  }

  saveObject() {
    
    if (this.state.newShapes.length === 0) {
      console.log("no new shapes to save");
      return;
    }
    
    var minX =  Math.min(...this.state.newShapes.map(wrapper => wrapper.x));
    var minY =  Math.min(...this.state.newShapes.map(wrapper => wrapper.y));
    var newObject = {
      id: this.dragref,
      ref: this.dragref,
      width: 180,
      height: 180,
      x: minX,
      y: minY,
      shapes: this.state.newShapes.slice().map(function (wrapper) {
        var shape = wrapper.shapes[0];
        shape.left = wrapper.x - minX;
        shape.top = wrapper.y - minY;
        return shape;
      })
    };

    // Emit an event to parts bin to add a new item
    ee.emitEvent(Event.PARTS_BIN_ADD_ITEM_EVENT, [newObject]);

    this.setState({
      parts: this.state.parts.concat(newObject),
      newShapes: []
    });
  }
  
  addAnchor() {
    this.x_orig = 300;
    this.y_orig = 200;

    var anchor = {
      id: this.dragref,
      ref: this.dragref,
      width: 180,
      height: 180,
      x: this.x_orig,
      y: this.y_orig,
      shapes: [{
        type: 'circle',
        top: 0,
        left: 0,
        width: 50,
        height: 50,
        color: "#903fd1"
      }]
    };

    this.setState({
      newShapes: this.state.newShapes.concat(anchor)
    });

    this.dragref++;
  }

  render() {
    var surfaceWidth = window.innerWidth;
    var surfaceHeight = window.innerHeight;
    var textStyle = this.getTextStyle();

    return (
      <Surface width={surfaceWidth} height={surfaceHeight} left={0} top={0}>
        <PartsBin style={this.getPartsBinStyle()} items={this.state.parts} />
        <Group style={this.getWrapperStyle()} onMouseDown={this.handleMouseDown.bind(this)}>
          <Text style={textStyle}>
            Here is some text.
          </Text>
          {this.state.objects.map(this.renderChild)}
          {this.state.newShapes.map(this.renderChild)}
          <Button xCoord={260} yCoord={10} onClick={this.saveObject.bind(this)}>
            <Generic
                key={12321}
                width={100}
                height={100}
                shapes={[{
            type: 'circle',
            top: 10,
            left: 10,
            width: 50,
            height: 50
          }]}
                />
          </Button>
          <Button xCoord={400} yCoord={10} onClick={this.addAnchor.bind(this)}>
            <Generic
                key={12321}
                width={100}
                height={100}
                shapes={[{
            type: 'circle',
            top: 10,
            left: 10,
            width: 30,
            height: 30
          }]}
            />
          </Button>
        </Group>
      </Surface>
    );
  }
}

ReactDOM.render(
  <Conjurer />,
  document.getElementById('main')
);

export default Conjurer;
