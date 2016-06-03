import React from 'react';
import ReactDOM from 'react-dom';
import ReactCanvas from 'react-canvas';

import Nav from './Nav';

import DaButton from './DaButton';
import PartsBin from './PartsBin';
import CodeEditor from './CodeEditor';

import Draggable from './Draggable';
import Generic from './Generic';

import Obj from './Obj';
import Anchor from './Anchor';
import Shape from './Shape';
import NumberShape from './NumberShape';
import NumberPrimitive from './shapes/NumberPrimitive';
import LineShape from './LineShape';
import Line from './shapes/Line';

let Surface = ReactCanvas.Surface;
let Group = ReactCanvas.Group;

let Event = require('./event/EventNames');
let ee = require('./event/EventEmitter');

let Color = require('./ColorConstants');

class Workspace extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};

    // Event handlers 
    this.cloneItem = this.cloneItem.bind(this);
    this.highlightNodes = this.highlightNodes.bind(this);
    this.createOperatorTree = this.createOperatorTree.bind(this);

    // coordinate data for drawing shapes
    this.x_orig = 0;
    this.y_orig = 0;
    
    this.updatePosition = this.updatePosition.bind(this);
    this.renderObject = this.renderObject.bind(this);
    this.handleCollision = this.handleCollision.bind(this);
    this.mount = this.mount.bind(this);

    // Unique id
    this.dragref = 0;

    // Creating Mode
    this.creatingMode = false;

     // List of ids to highlight
    this.highlightData = {};

    // Canvas size
    this.canvasWidth = window.innerWidth;
    this.canvasHeight = window.innerHeight - 50 - 20;
  }

  componentWillMount() {
    console.log("Workspace mount");

    this.state = {
      isDrawing: false,
      objects: [],
      parts: [],
      clone: null,
      newShapes: []
    };

    // Listener for event from the Parts Bin
    ee.addListener(Event.PARTS_BIN_CLONE_ITEM_EVENT, this.cloneItem);

    // Listener for event from code editor
    ee.addListener(Event.HIGHLIGHT_NODES, this.highlightNodes);
    ee.addListener(Event.CREATE_OPERATOR_TREE, this.createOperatorTree); 
  }

  componentWillUnmount() {
    console.log("Workspace unmount");

    // Listener for event from the Parts Bin
    ee.removeListener(Event.PARTS_BIN_CLONE_ITEM_EVENT, this.cloneItem);

    // Listener for event from code editor
    ee.removeListener(Event.HIGHLIGHT_NODES, this.highlightNodes);
    ee.removeListener(Event.CREATE_OPERATOR_TREE, this.createOperatorTree);
  }

  highlightNodeRecursive(id, obj) {
    var oldColor;
    
    if (obj.id == id) {
      oldColor = obj.getHead().color;
      obj.getHead().color = this.highlightData.ids.length <= 0 && this.highlightData.isSearch && this.highlightData.isNodeFound ? Color.HIGHLIGHTED_FOUND_NODE : Color.HIGHLIGHTED_NODE;

      //console.log("Force update id: " + id);
      
      var that = this;
      this.forceUpdate(function() {
        //console.log("Done force update id: " + id);

        setTimeout(function() {
          obj.getHead().color = oldColor;
          that.forceUpdate(function() {
            setTimeout(function() {
              if (that.highlightData.ids.length > 0)
                that.highlightNode(that.highlightData.ids.shift());
              else if ( that.highlightData.isSearch && !that.highlightData.isNodeFound )
                window.alert("Number not found! =(");
            }, 555);
          });

        }, that.highlightData.ids.length <= 0 && that.highlightData.isSearch && that.highlightData.isNodeFound ? 2222 : 555);

      });

    } else {
      var that = this;
      obj.children.forEach(function(c) {
        that.highlightNodeRecursive(id, c);
      });
    }
  }

  highlightNode(id) {
    var obj = this.state.objects[0];
    this.highlightNodeRecursive(id, obj);
  }

  highlightNodes(data) {
    this.highlightData = data;

    if (this.highlightData.ids.length > 0)
      this.highlightNode(this.highlightData.ids.shift());
  }

  createOperatorTree(obj) {
    this.setState({
      objects: [obj]
    }, function() {
      ee.emitEvent(Event.OBJECTS_STATE_UPDATED, [this.state.objects[0]]);
    });
  }

  // Clone parts bin item given an emitted event
  cloneItem(item) {
    var newItem = item.copy();
    newItem.id = this.dragref;
    newItem.ref = this.dragref;
    newItem.x = this.canvasWidth/2;
    newItem.y = this.canvasHeight/2;
    
    var that = this;
    newItem.shapes.map(function(shape, i) {
      shape.id = that.dragref + "-" + i;
      return shape;
    });

    this.dragref++;

    // Control what objects can appear on the workspace according to the mode
    if (this.creatingMode) {
      // In creating mode
      if (newItem.shapes.length > 1) {
        window.alert("Cannot add the selected object in creating mode!\n\nPlease exit creating mode. =)");
        return;
      } else {
        this.setState({
          newShapes: this.state.newShapes.concat(newItem)
        });
      }
    } else {
      // NOT in creating mode
      if (newItem.shapes.length == 1 && (newItem.shapes[0].type == 'operator' || newItem.shapes[0].type == 'hook')) {
        window.alert("Cannot add the selected object in non-creating mode!\n\nPlease enter creating mode. =)");
        return;
      } else {
        this.setState({
          objects: this.state.objects.concat(newItem)
        }, function() {
          ee.emitEvent(Event.OBJECTS_STATE_UPDATED, [this.state.objects[0]]);
        });
      }
    }
  }

  updateObjPosition(x, y, obj) {
    obj.x = x;
    obj.y = y;

    // Update its children's position as well
    var that = this;
    obj.children.forEach(function(child) {
      that.updateObjPosition(x, y, child);
    });

  }

  updatePosition(x, y, obj) {
    // IMPORTANT: update all the children's position
    this.updateObjPosition(x, y, obj);
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
  
  mount(aChild, parent, origin) {
    var child = aChild.copy();
    child.key = getNewKey();
    
    // update the relative position of the child's shapes
    child.shapes = child.shapes.map(function(shape) {
      shape.left += origin.x;
      shape.top += origin.y;
      return shape;
    });

    child.x = parent.x;
    child.y = parent.y;

    parent.children.push(child);

    /*if (parent.children.length == 2) {
      parent.shapes = parent.shapes.filter(function(shape) {
        return shape.color !== Color.ANCHOR;
      });

      this.forceUpdate();

      console.log("Parent has 2 children");
      console.log(parent.shapes);
    }*/

    // Render all the objects except the old/unattached child
    this.setState({
      objects: this.state.objects.filter(obj => obj.id !== child.id)
    });
  }

  renderObject(obj) {
    var onChange = function (x, y) {
      this.updatePosition(x, y, obj);
    }.bind(this);
    
    function renderSimpleObject(child) {
      // Calculate generic size
      // Assume that one of the children has top: 0 and
      // one has left: 0
      var defWidth = Math.max(...child.shapes.map(c => c.left + c.width));
      var defHeight = Math.max(...child.shapes.map(c => c.top + c.height));
      var maxSide = Math.max(defWidth, defHeight);
      
      // Resize all the children of the generic
      //var factor = side / maxSide;
      var factor = 50 / child.shapes[0].width;
      var resizedShapes = child.shapes.map(function(c) {
        c.top = c.top * factor;
        c.left = c.left * factor;
        c.width = c.width * factor;
        c.height = c.height * factor;
        return c;
      });

      return (
          <Generic
              key={child.id}
              shapes={resizedShapes} />
      )
    }
    
    // TEST
    /*var theFamily = obj.getFamily().sort(function(a, b) {
      if (a.id < b.id)
        return -1;

      if (a.id > b.id)
        return 1;

      return 0;
    });*/
    var theFamily = obj.getFamily();
    var family = theFamily.map(renderSimpleObject); // TEST: sort

    console.log("My family");
    console.log(theFamily);
    console.log(family);

    var familia = obj.getFamily();
    var maxWidth = Math.max(...familia.map(o => Math.max(...o.shapes.map(c => c.left + c.width))));
    var maxHeight = Math.max(...familia.map(o => Math.max(...o.shapes.map(c => c.top + c.height))));
    var minLeft = Math.min(...familia.map(o => Math.min(...o.shapes.map(c => c.left))));

    return (
        <Draggable xCoord={obj.x} yCoord={obj.y} onChange={onChange}>
          {family}
          <Generic 
            key={getNewKey()}
            shapes={[{
              type: 'group',
              top: 0,
              left: minLeft,
              width: maxWidth + Math.abs(minLeft),
              height: maxHeight
            }]} />
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

    var shapes = this.state.newShapes.slice().map(function (wrapper) {
        var shape = wrapper.shapes[0].copy();
        shape.left = wrapper.x - minX;
        shape.top = wrapper.y - minY;
        return shape;
    });

    var head = shapes.filter(shape => shape.type === 'number' || shape.type === 'operator');

    if (head.length != 1) {
      window.alert("There must be exactly one head (number or operator), you %&#@!");
      return;
    }

    var children = shapes.filter(function(c) {
      //return c.color === Color.ANCHOR;
      return c.type === 'hook';
    });

    if (children.length != 2) {
      window.alert("There must be exactly two hooks, you dumbass!");
      return;
    }

    // Sort the children such that the left child appears before the right child
    children.sort(function(a, b) {
      if (a.left < b.left)
        return -1;

      if (a.left > b.left)
        return 1;

      return 0;
    });

    // Add lines connecting the parent and its children

    // TODO
    // Head must either be red or green
    // There must be only one head

    // There must be two children
    // Child must be purple

    // Otherwise error

    head = head[0];
    var lc = children[0];
    var rc = children[1];

    var ll = new LineShape({
                type: 'line',
                top: head.top + head.height,
                left: lc.left + lc.width,
                width: head.left - (lc.left + lc.width),
                height: lc.top - (head.top + head.height),
                direction: 0
              });

    var rl = new LineShape({
                type: 'line',
                top: head.top + head.height,
                left: head.left + head.width,
                width: rc.left - (head.left + head.width),
                height: rc.top - (head.top + head.height),
                direction: 1
              });

    shapes.push(ll);
    shapes.push(rl);

    var newObject = new Obj({
      id: this.dragref,
      ref: this.dragref,
      x: minX,
      y: minY,
      shapes: shapes
    });

    // Emit an event to parts bin to add a new item, and clean the scene
    ee.emitEvent(Event.PARTS_BIN_ADD_ITEM_EVENT, [newObject]);
    this.setState({newShapes: []});
  }
  
  
  /**
   * Parts Bin
   */
  
  getPartsBinInitialItems() {
    var primitives = []
    primitives.push(this.getAnchor());
    primitives.push(this.getNumberPrimitive(69));
    primitives.push(this.getOperatorPrimitive("+"));
    primitives.push(this.getOperatorPrimitive("-"));
    primitives.push(this.getOperatorPrimitive("*"));
    primitives.push(this.getOperatorPrimitive("/"));

    return primitives;
  }

  getAnchor() {
    this.x_orig = 300;
    this.y_orig = 200;

    // TODO: this object definition is really similar to handleMouseDown's defaultShape, so the two should be unified
    var anchor = new Anchor({
      id: this.dragref,
      ref: this.dragref,
      x: this.x_orig,
      y: this.y_orig
    });

    this.dragref++;

    return anchor;
  }

  getNumberPrimitive(value) {
    var numPrimitive = {
      x: 300,
      y: 300,
      id: this.dragref,
      ref: this.dragref,
      shapes: [new NumberShape({
                id: this.dragref + "-0", 
                type: 'number',
                top: 0,
                left: 0,
                width: 80,
                height: 80,
                color: Color.NUMBER_PRIMITIVE,
                value: value || 7
              })]
    };

    this.dragref++;

    return numPrimitive;
  }

  getOperatorPrimitive(operator) {
    var newObject = new Obj({
      x: 300,
      y: 300,
      id: this.dragref,
      ref: this.dragref,
      width: 180,
      height: 180,
      shapes: [new NumberShape({
                id: this.dragref + "-0", 
                type: 'operator',
                top: 0,
                left: 0,
                width: 80,
                height: 80,
                color: Color.OPERATOR_PRIMITIVE,
                value: operator.toString()
              })]
    });

    this.dragref++;

    return newObject;
  }

  clearWorkspace() {
    this.setState({
      objects: [],
      newShapes: []
    });

    this.highlightData = {};
  }

  toggleCreatingMode() {
    this.clearWorkspace();
    this.creatingMode = !this.creatingMode;
    this.forceUpdate();
  }

  /**
   * Mouse Events
   */

  handleDoubleClick(e) {
    // Let each "Number Primitive component" figures out if it is clicked or not
    // This allows a previously clicked "number primitive component" to check
    // if it is not clicked anymore so it removes its key event listeners

    // IMPORTANT: subtract the width of the nav bar from mouse Y
    ee.emitEvent(Event.CONJURER_CLICK, [{X: e.clientX, Y: e.clientY - 50}]);
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
  }

  /**
   * Render
   */ 

  getPartsBinStyle() {
    return {
      top: 0,
      left: 0,
      width: 180,
      height: this.canvasHeight,
      backgroundColor: 'grey',
      itemHeight: 180,
      itemPadding: 10
    };
  }

  getWrapperStyle() {
    return {
      top: 0,
      left: 200,
      width: this.canvasWidth,
      height: this.canvasHeight
    };
  }

  getCodeEditorStyle() {
    var w = 300;
    return {
      top: 0,
      left: this.canvasWidth - w,
      width: w,
      height: 600,
      backgroundColor: "#000000",
      textColor: "#ffffff"
    };
  }

  getToggleModeButtonStyle() {
    return {
      top: 10,
      left: 260,
      width: 160,
      height: 36,
      color: "#ffffff",
      backgroundColor: this.creatingMode ? Color.WARNING_BUTTON : Color.GO_BUTTON
    };
  }

  getClearButtonStyle() {
    return {
      top: 10,
      left: 440,
      width: 70,
      height: 36,
      color: "#ffffff",
      backgroundColor: Color.WARNING_BUTTON
    };
  }

  getSaveButtonStyle() {
    return {
      top: 10,
      left: 530,
      width: 150,
      height: 36,
      color: "#ffffff",
      backgroundColor: Color.DEFAULT_BUTTON
    };
  }

  render() {
    var modeText = this.creatingMode ? "Exit Creating Mode" : "Enter Creating Mode";
    var renderSaveButton = this.creatingMode && <DaButton key={"workspace-save-button"} style={this.getSaveButtonStyle()} onClick={this.saveObject.bind(this)}>Save to Parts Bin</DaButton>;
    
    return (
      <div>
        <Nav />
        <Surface width={this.canvasWidth} height={this.canvasHeight} left={0} top={0}>
          <PartsBin style={this.getPartsBinStyle()} initialItems={this.getPartsBinInitialItems()} />
          <Group style={this.getWrapperStyle()} onMouseDown={this.handleMouseDown.bind(this)} onDoubleClick={this.handleDoubleClick.bind(this)}>
            {this.state.objects.map(this.renderObject)}
            {this.state.newShapes.map(this.renderObject)}
            <DaButton key={"workspace-creating-mode-button"} 
                      style={this.getToggleModeButtonStyle()} 
                      onClick={this.toggleCreatingMode.bind(this)}>
                {modeText}
            </DaButton>
            <DaButton key={"workspace-clear-button"} style={this.getClearButtonStyle()} onClick={this.clearWorkspace.bind(this)}>Clear</DaButton>
            {renderSaveButton}
          </Group>
          <CodeEditor style={this.getCodeEditorStyle()} />
        </Surface>
      </div>
    );
  }
}

var OBJ_KEY = 0;
var getNewKey = function () {return ++OBJ_KEY;};

export default Workspace;
