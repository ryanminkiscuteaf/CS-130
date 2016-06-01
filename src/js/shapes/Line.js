import React from 'react';
import ReactCanvas from 'react-canvas';

/**
 * Line component
 *
 * Styles:
 * top
 * left
 * width
 * height
 * direction
 */

ReactCanvas.registerLayerType('line', function(ctx, layer) {
	var x = layer.frame.x;
	var y = layer.frame.y;
	var width = layer.frame.width;
	var height = layer.frame.height;

	var direction = layer.direction || 0;

	// TEST: Set fill properties
  //ctx.fillStyle = "#FFD700";
  //ctx.fillRect(x, y, width, height);

	var fromX = x;
	var fromY = direction ? y : y + height;
	var toX = x + width;
	var toY = direction ? y + height : y;

	ctx.beginPath();
	ctx.moveTo(fromX, fromY);
	ctx.lineTo(toX, toY);
	ctx.stroke();
});

var Line = ReactCanvas.createCanvasComponent({
	displayName: 'Line',
	layerType: 'line',

	applyCustomProps: function(prevProps, props) {
		var style = props.style || {};
		var layer = this.node;
		layer.direction = style.direction || 0;
	}
});

export default Line;