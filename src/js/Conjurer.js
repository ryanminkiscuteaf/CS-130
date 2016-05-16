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
import CodeEditor from './CodeEditor';
import Obj from './Obj';

let Surface = ReactCanvas.Surface;
let Group = ReactCanvas.Group;

let Event = require('./event/EventNames');
let ee = require('./event/EventEmitter');

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
    // IMPORTANT: detect if CodeEditor is clicked or
    // anything outside the CodeEditor is clicked
    var codeEditorStyle = this.getCodeEditorStyle();

    var ceX = parseInt(codeEditorStyle.left);
    var ceY = parseInt(codeEditorStyle.top);
    var ceX2 = ceX + parseInt(codeEditorStyle.width);
    var ceY2 = ceY + parseInt(codeEditorStyle.height);

    var isWithinCodeEditorXBoundaries = (e.clientX >= ceX) && (e.clientX <= ceX2);
    var isWithinCodeEditorYBoundaries = (e.clientY >= ceY) && (e.clientY <= ceY2);

    if (isWithinCodeEditorXBoundaries && isWithinCodeEditorYBoundaries) {
      // CodeEditor is clicked
      ee.emitEvent(Event.CODE_EDITOR_ON_CLICK);

      // IMPORTANT: Return right away so we don't create objects where the code editor is
      // because if the objects are created behind the code editor
      // it will still overwrite code editor's onClick handler
      return;

    } else {
      // CodeEditor is not clicked
      ee.emitEvent(Event.CODE_EDITOR_OFF_CLICK);
    }

    this.isDrawing = true;
    this.x_orig = e.clientX;
    this.y_orig = e.clientY;

    // TODO: abstract out to factory
    var obj = new Obj({
      id: this.dragref,
      ref: this.dragref,
      x: this.x_orig,
      y: this.y_orig,
      shapes: [CIRCLE_SHAPE]
    }); 
    
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

  getWrapperStyle() {
    return {
      top: 0,
      left: 200,
      width: window.innerWidth,
      height: window.innerHeight
    };
  }

  getCodeEditorStyle() {
    var w = 400;
    return {
      top: 0,
      left: window.innerWidth - w - 15,
      width: w,
      height: 400,
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

  updatePosition(x, y, obj) {
    obj.x = x;
    obj.y = y;
    this.handleCollision(obj);
  }

  // TODO: check for collisions on both this.state.objects and their children, recursively, to allow for grandchildren
  handleCollision(obj) {
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
    child = child.copy();
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
    var newObject = new Obj({
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

    // Emit an event to parts bin to add a new item, and clean the scene
    ee.emitEvent(Event.PARTS_BIN_ADD_ITEM_EVENT, [newObject]);
    this.setState({newShapes: []});
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

  render() {
    var surfaceWidth = window.innerWidth;
    var surfaceHeight = window.innerHeight;
    
    return (
      <Surface width={surfaceWidth} height={surfaceHeight} left={0} top={0}>
        <PartsBin style={this.getPartsBinStyle()} />
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
        <CodeEditor style={this.getCodeEditorStyle()} />
      </Surface>
    );
  }
}

// TODO: make all of these methods on Obj

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
