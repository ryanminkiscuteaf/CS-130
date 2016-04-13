/**
 * Created by lowellbander on 4/12/16.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import ReactCanvas from 'react-canvas';

var Surface = ReactCanvas.Surface;
var Image = ReactCanvas.Image;
var Text = ReactCanvas.Text;

var App = React.createClass({
    render: function () {
        var surfaceWidth = window.innerWidth;
        var surfaceHeight = window.innerHeight;
        var textStyle = this.getTextStyle();

        return (
            <Surface width={surfaceWidth} height={surfaceHeight} left={0} top={0}>
                <Text style={textStyle}>
                    Here is some text.
                </Text>
            </Surface>
        );
    },

    getTextStyle: function () {
        return {
            top: 0,
            left: 0,
            width: window.innerWidth,
            height: 20,
            lineHeight: 20,
            fontSize: 12
        };
    }
});

ReactDOM.render(
  <App />,
  document.getElementById('main')
)
