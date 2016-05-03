import React from 'react';
import ReactCanvas from 'react-canvas';

/**
 * Circle component
 *
 * Styles:
 * top
 * left
 * width
 * height
 * backgroundColor
 * borderColor
 * borderWidth
 * shadowColor
 * shadowOffsetX
 * shadowOffsetY
 * shadowBlur
 */

ReactCanvas.registerLayerType('circle', function (ctx, layer) {
    var x = layer.frame.x; 
    var y = layer.frame.y;
    var width = layer.frame.width;
    var height = layer.frame.height;
    var centerX = x + width / 2;
    var centerY = y + height / 2;

    var fillColor = layer.backgroundColor || '#800000';
    var strokeColor = layer.borderColor || '#000000';
    var strokeWidth = layer.borderWidth || 0;
  
    var shadowColor = layer.shadowColor || 0;
    var shadowOffsetX = layer.shadowOffsetX || 0;
    var shadowOffsetY = layer.shadowOffsetY || 0;
    var shadowBlur = layer.shadowBlur || 0;

    var radius = Math.min(width / 2, height / 2) - Math.ceil(strokeWidth / 2);
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);

    // Set shadow properties
    if (shadowOffsetX || shadowOffsetY) {
      ctx.shadowColor = shadowColor;
      ctx.shadowBlur = shadowBlur;
      ctx.shadowOffsetX = shadowOffsetX;
      ctx.shadowOffsetY = shadowOffsetY;
    }
  
    // Set fill properties
    ctx.fillStyle = fillColor;
    ctx.fill();

    // Set stroke properties
    if (strokeWidth > 0) {
      ctx.lineWidth = strokeWidth;
      ctx.strokeStyle = strokeColor;
      ctx.stroke();
    }
});

var Circle = ReactCanvas.createCanvasComponent({
  displayName: 'Circle',
  layerType: 'circle',
  
  applyCustomProps: function (prevProps, props) {
    var style = props.style || {};
    var layer = this.node;

    layer.shadowColor = style.shadowColor || 0;
    layer.shadowOffsetX = style.shadowOffsetX || 0;
    layer.shadowOffsetY = style.shadowOffsetY || 0;
    layer.shadowBlur = style.shadowBlur || 0;
  }
});

export default Circle;