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
//import CodeEditor from './CodeEditor';

let Surface = ReactCanvas.Surface;
let Group = ReactCanvas.Group;
let Image = ReactCanvas.Image;
let Text = ReactCanvas.Text;

let Event = require('./event/EventNames');
let ee = require('./event/EventEmitter');

let sampleItems = require('./SampleItems');

let ANCHOR_COLOR = "#903fd1";

class Conjurer extends React.Component {
  constructor(props) {
    super(props);
    console.log("HEY yo");
    this.state = {};

    // Listener for event from the Parts Bin
    ee.addListener(Event.PARTS_BIN_CLONE_ITEM_EVENT, this.cloneItem.bind(this));

    // coordinate data for drawing shapes
    this.x_orig = 0;
    this.y_orig = 0;
    this.x_curr = 0;
    this.y_curr = 0;

    this.updatePosition = this.updatePosition.bind(this);
    this.renderObject = this.renderObject.bind(this);
    this.handleCollision = this.handleCollision.bind(this);
    this.mount = this.mount.bind(this);

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
      }],
      children: []
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

  getCodeEditorStyle() {
    return {
      top: 100,
      left: 300,
      width: 400,
      height: 300,
      backgroundColor: "#000000",
      textColor: "#ffffff"
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
    
    // handle anchoring
    var obj = shape;
    this.handleCollision(obj);
  }
  
  handleCollision(obj) {
    // get obj's bounds
    var objBounds =  {
      left : obj.x,
      top : obj.y,
      right : getRight(obj),
      bottom : getBottom(obj)
    }

    function inBounds(point, bounds) {
      return ((point.x > bounds.left)
          && (point.x < bounds.right)
          && (point.y > bounds.top)
          && (point.y < bounds.bottom));
    }
    
    var newOrigin = null;
    
    function didCollide(candidate) {
      // get shapes that are anchors
      var anchors = candidate.shapes.filter(shape => shape.color === ANCHOR_COLOR);

      // get absolute coordinates for anchors
      var coordinates = anchors.map(anchor => ({x: anchor.left + candidate.x, y: anchor.top + candidate.y}));

      // check to see if any of candidate's anchors are in obj's bounding rectangle
      // side note : apparently this is how you do a for ... in in javascript
      for (let coordinate of coordinates) {
        if (inBounds(coordinate, objBounds)) {
          newOrigin = coordinate;
          return true;
        }
      }
      return false;
    }

    var collisions = this.state.objects.filter(other => obj.id !== other.id).filter(didCollide);

    if (collisions.length !== 0) {
      //should only be one collision
      if (collisions.length !== 1) throw "too many collisions";
      
      var collision = collisions.pop();
      console.log(collision);

      this.mount(obj, collision, newOrigin);
    } 
  }
  
  mount(child, parent, origin) {
    parent.children = parent.children || [];
    parent.children.push(child);
    
    // TODO: need to modify state with this.setState
    //debugger;
    /*this.setState({
      objects: this.state.objects.splice(
          this.state.objects.findIndex()
      )
    })*/
  }

  renderObject(obj) {
    var onChange = function (x, y) {
      this.updatePosition(x, y, obj);
    }.bind(this);
    
    function renderChild(child) {
      return (
          <Generic
              key={child.id}
              width={child.width}
              height={child.height}
              shapes={child.shapes}
              constrain={true}
          />
      )
    }

    var children = (obj.children) ? obj.children.map(renderChild) : <Group/>;
    debugger;

    return (
        <Draggable xCoord={obj.x} yCoord={obj.y} onChange={onChange}>
          <Generic
              key={obj.id}
              width={obj.width}
              height={obj.height}
              shapes={obj.shapes}
              constrain={true}
              />
          {children}
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

    // TODO: this object definition is really similar to handleMouseDown's defaultShape, so the two should be unified
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
        color: ANCHOR_COLOR
      }],
      children: []
    };

    this.setState({
      newShapes: this.state.newShapes.concat(anchor)
    });

    this.dragref++;
  }
//<CodeEditor style={this.getCodeEditorStyle()} />
  render() {
    var surfaceWidth = window.innerWidth;
    var surfaceHeight = window.innerHeight;
    var textStyle = this.getTextStyle();

    return (
      <Surface width={surfaceWidth} height={surfaceHeight} left={0} top={0}>
        <PartsBin style={this.getPartsBinStyle()} items={this.state.parts} />
        <Group style={this.getWrapperStyle()} onMouseDown={this.handleMouseDown.bind(this)}>
          {this.state.objects.map(this.renderObject)}
          {this.state.newShapes.map(this.renderObject)}
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

var getRight = function (obj) {
  return obj.x
      + Math.max(...obj.shapes.map(shape => shape.left + shape.width));
}

var getBottom = function (obj) {
  return obj.y
      + Math.max(...obj.shapes.map(shape => shape.top + shape.height));
}

ReactDOM.render(
  <Conjurer />,
  document.getElementById('main')
);

export default Conjurer;
