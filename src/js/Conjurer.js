/**
 * Created by lowellbander on 4/12/16.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import ReactCanvas from 'react-canvas';

import Test from './Test';
import Draggable from './Draggable';
import DraggableCircle from './DraggableCircle';
import Rectangle from './shapes/Rectangle';
import Generic from './Generic';

let Surface = ReactCanvas.Surface;
let Group = ReactCanvas.Group;
let Image = ReactCanvas.Image;
let Text = ReactCanvas.Text;

var EventEmitter = require('wolfy87-eventemitter');
var ee = new EventEmitter();

var TEST_EVENT = "event handler test";

class Conjurer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    ee.addListener(TEST_EVENT, function() {console.log('event handler seems to be working');});

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
      objects: []
    };
  }

  handleMouseDown(e) {
    this.isDrawing = true;
    this.x_orig = e.clientX;
    this.y_orig = e.clientY;

    this.setState({
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

    this.dragref++;
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
      left: 0,
      width: window.innerWidth,
      height: window.innerHeight
    };
  }

  render() {
    var surfaceWidth = window.innerWidth;
    var surfaceHeight = window.innerHeight;
    var textStyle = this.getTextStyle();

    ee.emitEvent(TEST_EVENT);

    return (
      <Surface width={surfaceWidth} height={surfaceHeight} left={0} top={0}>
        <Group style={this.getWrapperStyle()} onMouseDown={this.handleMouseDown.bind(this)}>
          <Text style={textStyle}>
            Here is some text.
          </Text>
          <Draggable xCoord={50} yCoord={150}>
            <DraggableCircle />
          </Draggable>
          <Rectangle style={{top: 200, left: 300, width: 100, height: 200, borderWidth: 5}}/>
          {this.state.objects.map(function(obj) {
            return (
              <Draggable xCoord={obj.x} yCoord={obj.y}>
                <Generic
                  key={obj.id}
                  width={obj.width}
                  height={obj.height}
                  shapes={obj.shapes}
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
