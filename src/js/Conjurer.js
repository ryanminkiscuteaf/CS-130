/**
 * Created by lowellbander on 4/12/16.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import ReactCanvas from 'react-canvas';

import Test from './Test';
import DraggableCircle from './DraggableCircle';
import Rectangle from './shapes/Rectangle';

var Surface = ReactCanvas.Surface;
var Image = ReactCanvas.Image;
var Text = ReactCanvas.Text;

var EventEmitter = require('wolfy87-eventemitter');
var ee = new EventEmitter();

class Conjurer extends React.Component {

  constructor(props) {
    super(props);
    this.state = {};
    ee.addListener('foo', function() {console.log('foo called');});
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

    ee.emitEvent('foo');

    return (
      <Surface width={surfaceWidth} height={surfaceHeight} left={0} top={0}>
        <Text style={textStyle}>
          Here is some text.
        </Text>
        <Test xCoord={0} yCoord={50}/>

        <Rectangle style={{top: 200, left: 300, width: 100, height: 200, borderWidth: 5}}/>
        <DraggableCircle xCoord={50} yCoord={150}/>
      </Surface>
    );
  }
}

ReactDOM.render(
  <Conjurer />,
  document.getElementById('main')
);

export default Conjurer;
