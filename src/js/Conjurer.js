/**
 * Created by lowellbander on 4/12/16.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import ReactCanvas from 'react-canvas';

import Draggable from './Draggable';
import Generic from './Generic';
import PartsBin from './PartsBin';

let Surface = ReactCanvas.Surface;
let Group = ReactCanvas.Group;
let Image = ReactCanvas.Image;
let Text = ReactCanvas.Text;

let Event = require('./event/EventNames');
let ee = require('./event/EventEmitter');
let TEST_EVENT = "event handler test";

let sampleItems = require('./SampleItems');

class Conjurer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    ee.addListener(TEST_EVENT, function() {console.log('event handler seems to be working');});

    // Listener for event from the Parts Bin
    ee.addListener(Event.PARTS_BIN_CLONE_ITEM_EVENT, this.cloneItem.bind(this));

    // coordinate data for drawing shapes
    this.x_orig = 0;
    this.y_orig = 0;
    this.x_curr = 0;
    this.y_curr = 0;

    this.dragref = 0;
  }

  componentWillMount() {
    this.state = {
      isDrawing: false,
      objects: [],
      clone: null
    };
  }

  handleMouseDown(e) {
    this.isDrawing = true;
    this.x_orig = e.clientX;
    this.y_orig = e.clientY;

    // Emit an event to parts bin to add a new item
    ee.emitEvent(Event.PARTS_BIN_ADD_ITEM_EVENT, [this.getSampleGeneric()]);

    /*this.setState({
      objects: this.state.objects.concat(
        {
          id: this.dragref,
          ref: this.dragref,
          width: 180,
          height: 180,
          x: this.x_orig,
          y: this.y_orig,
          shapes: [{
            type: 'circle',
            top: 10,
            left: 10,
            width: 50,
            height: 50
          },
          {
            type: 'circle',
            top: 50,
            left: 50,
            width: 60,
            height: 60
          }
          ]
        }
      )
    });

    this.dragref++;*/
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

  render() {
    var surfaceWidth = window.innerWidth;
    var surfaceHeight = window.innerHeight;
    var textStyle = this.getTextStyle();

    ee.emitEvent(TEST_EVENT);

    return (
      <Surface width={surfaceWidth} height={surfaceHeight} left={0} top={0}>
        <PartsBin style={this.getPartsBinStyle()} items={sampleItems} />
        <Group style={this.getWrapperStyle()} onMouseDown={this.handleMouseDown.bind(this)}>
          {this.state.objects.map(function(obj) {
            return (
              <Draggable xCoord={obj.x} yCoord={obj.y}>
                <Generic
                  key={obj.id}
                  width={50}
                  height={220}
                  shapes={obj.shapes}
                  constrain={true}
                />
              </Draggable>
            );
          })}
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
