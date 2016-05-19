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
import Anchor from './Anchor';
import Shape from './Shape';

//import NumberPrimitive from './shapes/NumberPrimitive';

import TextBox from './TextBox';

let Surface = ReactCanvas.Surface;
let Group = ReactCanvas.Group;

let Event = require('./event/EventNames');
let ee = require('./event/EventEmitter');

// TODO: remove this if it is unused
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

  handleClick(e) {
    // Let each "Number Primitive component" figures out if it is clicked or not
    // This allows a previously clicked "number primitive component" to check
    // if it is not clicked anymore so it removes its key event listeners
    ee.emitEvent(Event.CONJURER_CLICK, [{X: e.clientX, Y: e.clientY}]);
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

    // TODO: TEST
    //return;

    this.isDrawing = true;
    this.x_orig = e.clientX;
    this.y_orig = e.clientY;

    var obj = new Obj({
      id: this.dragref,
      ref: this.dragref,
      x: this.x_orig,
      y: this.y_orig,
      shapes: [new Shape()]
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
    var collidee = null,
        origin = null,
        candidates = this.state.objects.filter(other => obj.id !== other.id);
    
    ({collidee, origin} = obj.getCollision(candidates));
    if (collidee) {
      this.mount(obj, collidee, origin);
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

    this.setState({
      objects: this.state.objects.filter(obj => obj.id !== child.id)
    });
  }

  renderObject(obj) {
    var onChange = function (x, y) {
      this.updatePosition(x, y, obj);
    }.bind(this);
    
    function renderSimpleObject(child) {
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
    
    var family = obj.getFamily().map(renderSimpleObject);
    
    return (
        <Draggable xCoord={obj.x} yCoord={obj.y} onChange={onChange}>
          <Generic
              key={obj.id}
              width={obj.width}
              height={obj.height}
              shapes={obj.shapes}
              constrain={true}
              />
          {family}
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
        var shape = wrapper.shapes[0].copy();
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
    var anchor = new Anchor({
      id: this.dragref,
      ref: this.dragref,
      x: this.x_orig,
      y: this.y_orig
    });

    this.setState({
      newShapes: this.state.newShapes.concat(anchor)
    });

    this.dragref++;
  }
  
  /*
  <Draggable xCoord={300} yCoord={300}>
          <Generic 
            key={getNewKey()}
            shapes={[
              {
                type: 'number',
                top: 0,
                left: 0,
                width: 200,
                height: 200
              }
            ]} />
        </Draggable>
  */

  render() {
    var surfaceWidth = window.innerWidth;
    var surfaceHeight = window.innerHeight;
    
    return (
      <Surface width={surfaceWidth} height={surfaceHeight} left={0} top={0}>
        <PartsBin style={this.getPartsBinStyle()} />
        <Group style={this.getWrapperStyle()} onMouseDown={this.handleMouseDown.bind(this)} onClick={this.handleClick.bind(this)}>
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
        <TextBox style={{
          top: 300,
          left: 300
        }} />
        <CodeEditor style={this.getCodeEditorStyle()} />
      </Surface>
    );
  }
}

var OBJ_KEY = 0;
var getNewKey = function () {return ++OBJ_KEY;};

ReactDOM.render(
  <Conjurer />,
  document.getElementById('main')
);

export default Conjurer;
