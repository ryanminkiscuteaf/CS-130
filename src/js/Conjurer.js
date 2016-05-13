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
let DEFAULT_COLOR = "#0000ff";

let CIRCLE_SHAPE = {
  type: 'circle',
  top: 0,
  left: 0,
  width: 50,
  height: 50,
  color: DEFAULT_COLOR
};

class Conjurer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};

    // Listener for event from the Parts Bin
    ee.addListener(Event.PARTS_BIN_CLONE_ITEM_EVENT, this.cloneItem.bind(this));

    // coordinate data for drawing shapes
    this.x_orig = 0;
    this.y_orig = 0;
    
    // TODO: these are unused, so delete them
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

    // TODO: abstract out to factory
    var obj = makeObj({
      id: this.dragref,
      ref: this.dragref,
      x: this.x_orig,
      y: this.y_orig,
      shapes: [CIRCLE_SHAPE]
    }); 
    
    /*var defaultShape = {
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
        color: DEFAULT_COLOR
      }]
    };*/
    
    this.dragref++;
    
    this.setState({
      newShapes: this.state.newShapes.concat(obj)
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

  updatePosition(x, y, obj) {
    obj.x = x;
    obj.y = y;
    this.handleCollision(obj);
  }

  // TODO: check for collisions on both this.state.objects and their children, recursively, to allow for grandchildren
  handleCollision(obj) {
    // get obj's bounds
    var objBounds =  {
      left : obj.x,
      top : obj.y,
      right : getRight(obj),
      bottom : getBottom(obj)
    };

    function inBounds(point, bounds) {
      return ((point.x > bounds.left)
          && (point.x < bounds.right)
          && (point.y > bounds.top)
          && (point.y < bounds.bottom));
    }
    
    var newOrigin = null;
    
    function didCollide(candidate) {
      // get shapes that are anchors
      // TODO: cannot read property 'shapes' of undefined
      var anchors = candidate.shapes.filter(shape => shape.color === ANCHOR_COLOR);

      // get absolute coordinates for anchors
      var coordinates = anchors.map(anchor => ({x: anchor.left + candidate.x, y: anchor.top + candidate.y}));

      // check to see if any of candidate's anchors are in obj's bounding rectangle
      // side note : apparently this is how you do a for ... in in javascript
      for (let coordinate of coordinates) {
        if (inBounds(coordinate, objBounds)) {
          newOrigin = {x: coordinate.x - candidate.x, y: coordinate.y - candidate.y};
          return true;
        }
      }
      return false;
    }

    var getCollision = function (candidates) {
      if (candidates.length === 0) return null;
      var collision = candidates.find(didCollide);
      return collision
          ? collision
          : getCollision([].concat(...candidates.map(c => c.children)));
    };
    
    var collision = getCollision(this.state.objects.filter(other => obj.id !== other.id));
    if (collision) {
      this.mount(obj, collision, newOrigin);
    }
  }
  
  mount(child, parent, origin) {
    //parent.children = parent.children || [];
    child = copyObj(child);
    child.key = getNewKey();
    
    // update the relative position of the child's shapes
    child.shapes = child.shapes.map(function(shape) {
      shape.left += origin.x;
      shape.top += origin.y;
      return shape;
    });
    parent.children.push(child);
    
    var newObjects = this.state.objects.slice();
    newObjects.splice(
        newObjects.findIndex(obj => obj.id === parent.id),
        1, // deleteCount
        parent
    );
    
    this.setState({
      objects: newObjects
    }, function () {
      var killedChild = this.state.objects.slice();
      killedChild.splice(
          killedChild.findIndex(obj => obj.id === child.id),
          1 // deleteCount
      );
      this.setState({
        objects: killedChild
      });
    });
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
      console.error("no new shapes to save");
      return;
    }
    
    var minX =  Math.min(...this.state.newShapes.map(wrapper => wrapper.x));
    var minY =  Math.min(...this.state.newShapes.map(wrapper => wrapper.y));
    var newObject = makeObj({
      id: this.dragref,
      ref: this.dragref,
      x: minX,
      y: minY,
      shapes: this.state.newShapes.slice().map(function (wrapper) {
        var shape = wrapper.shapes[0];
        shape.left = wrapper.x - minX;
        shape.top = wrapper.y - minY;
        return shape;
      })
    });
    /*}var newObject = {
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
    };*/
    
    // TODO: the two calls below are doing the same thing?

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
      }]
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

// TODO: abstract out to factory
var makeObj = function ({id, ref, x, y, shapes}={}) {
  return {
    id: id,
    ref: ref,
    width: 180,
    height: 180,
    x: x,
    y: y,
    children: [],
    shapes: shapes
  };
};

var copyShape = function(shape) {
  return {
    type: shape.type,
    top: shape.top,
    left: shape.left,
    width: shape.width,
    height: shape.height,
    color: shape.color
  };
};

var copyObj = function(obj) {
  debugger;
  return {
    id: obj.id,
    ref: obj.ref,
    width: obj.width,
    height: obj.height,
    x: obj.x,
    y: obj.y,
    shapes: obj.shapes.map(copyShape),
    children: obj.children.map(copyObj)
  };
};

var getRight = function (obj) {
  return obj.x
      + Math.max(...obj.shapes.map(shape => shape.left + shape.width));
};

var getBottom = function (obj) {
  return obj.y
      + Math.max(...obj.shapes.map(shape => shape.top + shape.height));
};

var OBJ_KEY = 0;
var getNewKey = function () {return ++OBJ_KEY;};

ReactDOM.render(
  <Conjurer />,
  document.getElementById('main')
);

export default Conjurer;
