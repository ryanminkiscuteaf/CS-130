import React from 'react';
import ReactCanvas from 'react-canvas';

import Circle from './Circle';

let Group = ReactCanvas.Group;
let Text = ReactCanvas.Text;
let FontFace = ReactCanvas.FontFace;
let measureText = ReactCanvas.measureText;

class OperatorPrimitive extends React.Component {

	constructor() {
		super();
	}

	componentWillMount() {
		var style = this.props.style;
		this.style = {
			width: style.width || 100,
			height: style.height || 100,
			padding: style.padding || 4,
			textColor: style.textColor || "#ffffff",
			fontSize: style.fontSize || 16,
			fontFace: style.fontFace || FontFace('Monospace'),
		};

		// Measure and cache char width
		this.style.charWidth = this.measureCharWidth("0");

		// Calculate line height
		this.style.lineHeight = this.style.fontSize + 6;

		// Number of chars
		var charTotal = Math.floor((this.style.width - (this.style.padding * 2)) / this.style.charWidth);
		this.style.charTotalMax = Math.min(charTotal, 7);
	}

	/**
	 * Render
	 */

	getStyle() {
		return {
			top: this.props.style.top,
			left: this.props.style.left,
			width: this.style.width,
			height: this.style.height,
			backgroundColor: this.props.style.backgroundColor
		};
	}

	getTextStyle() {
		return {
			top: this.getTextTop(),
      left: this.getLeftmostPos(),
      width: this.style.width - (this.style.padding * 2),
      height: this.style.lineHeight,
      lineHeight: this.style.lineHeight,
      fontSize: this.style.fontSize,
      fontFace: this.style.fontFace,
      color: this.style.textColor,
      textAlign: "center",
      //backgroundColor: "black" // TEST
		};
	}

	render() {
		return (
			<Group key={"operator-group"}>
				<Circle style={this.getStyle()} />
				<Text key={"operator-text"} style={this.getTextStyle()}>{this.props.value.toString()}</Text>
			</Group>
		);
	}

	/**
	 * Misc
	 */

	getTextTop() {
		return this.props.style.top + ((this.style.height - this.style.lineHeight) / 2);
	}

	getLeftmostPos() {
		return this.props.style.left + this.style.padding; 
	}

	measureCharWidth(c) {
		var charSize = measureText(c, 10, this.style.fontFace, this.style.fontSize, this.style.lineHeight);
		return charSize.width;
	}
}

export default OperatorPrimitive;