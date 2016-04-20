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

var Surface = ReactCanvas.Surface;
var Image = ReactCanvas.Image;
var Text = ReactCanvas.Text;

var EventEmitter = require('wolfy87-eventemitter');
var ee = new EventEmitter();

var TEST_EVENT = "event handler test";

class Conjurer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    ee.addListener(TEST_EVENT, function() {console.log('event handler seems to be working');});
  }

  componentWillMount() {
    this.state = {
      objects: [
        {
          id: 1,
          width: 100,
          height: 50
        },
        {
          id: 2,
          width: 50,
          height: 100
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

  render() {
    var surfaceWidth = window.innerWidth;
    var surfaceHeight = window.innerHeight;
    var textStyle = this.getTextStyle();

    ee.emitEvent(TEST_EVENT);

    return (
      <Surface width={surfaceWidth} height={surfaceHeight} left={0} top={0}>
        <Text style={textStyle}>
          Here is some text.
        </Text>
        <Draggable xCoord={0} yCoord={50}>
          <Test />
        </Draggable>

        <Rectangle style={{top: 200, left: 300, width: 100, height: 200, borderWidth: 5}}/>
        <Draggable xCoord={50} yCoord={150}>
          <DraggableCircle />
        </Draggable>
        {this.state.objects.map(function(obj) {
          return (
            <Generic
              key={obj.id}
              xCoord={50}
              yCoord={50}
              width={obj.width}
              height={obj.height}
            />
          );
        })}
      </Surface>
    );
  }
}

ReactDOM.render(
  <Conjurer />,
  document.getElementById('main')
);

export default Conjurer;
