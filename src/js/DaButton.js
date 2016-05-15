import React from 'react';
import ReactCanvas from 'react-canvas';

let Group = ReactCanvas.Group;
let Text = ReactCanvas.Text;
let FontFace = ReactCanvas.FontFace;
let measureText = ReactCanvas.measureText;

class DaButton extends React.Component {
	constructor() {
		super();
	}

	componentWillMount() {
		var style = this.props.style;
		this.style = {
			top: style.top || 0,
			left: style.left || 0,
			topPadding: style.topPadding || 10,
			leftPadding: style.leftPadding || 20,
			fontSize: style.fontSize || 14,
			fontFace: style.fontFace || FontFace('Helvetica'),
			color: style.color || "#ffffff",
			backgroundColor: style.backgroundColor || "purple",
		};

		// IMPORTANT: Magic formula to vertically center the text in the button
		this.style.lineHeight = this.style.fontSize + 4;

		// Fixed style properties
		if (style.width) {
			this.style.width = style.width;
			this.style.leftPadding = (style.width - Math.ceil(this.measureTextWidth(this.props.children))) / 2;
		} else {
			this.style.width = Math.ceil(this.measureTextWidth(this.props.children)) + (this.style.leftPadding * 2);
		}

		if (style.height) {
			this.style.height = style.height;
			this.style.topPadding = (style.height - this.style.lineHeight) / 2;
		} else {
			this.style.height = this.style.lineHeight + (this.style.topPadding * 2);
		}

		// Click handler
		if (this.props.onClick)
			this.handleClick = this.props.onClick;
	}

	/**
	 * Misc
	 */

	measureTextWidth(t) {
		var textSize = measureText(t, 200, this.style.fontFace, this.style.fontSize, this.style.lineHeight);
		return textSize.width;
	}

	/**
	 * Render
	 */

	getStyle() {
  	return {
	  	top: this.style.top,
	  	left: this.style.left,
	  	width: this.style.width,
	  	height: this.style.height,
	  	backgroundColor: this.style.backgroundColor
  	};
  }

  getTextStyle() {
  	return {
      top: this.style.top + ((this.style.height - this.style.lineHeight) / 2),
      left: this.style.left,
      width: this.style.width,
      height: this.style.lineHeight,
      lineHeight: this.style.lineHeight,
      fontSize: this.style.fontSize,
      fontFace: this.style.fontFace,
      color: this.style.color,
      //backgroundColor: "red", // TEST
      textAlign: "center",
    };
  }

	render() {
		return (
			<Group key={this.props.key + "-btn-box"} style={this.getStyle()} onClick={this.handleClick}>
  			<Text key={this.props.key + "-btn-text"} style={this.getTextStyle()}>{this.props.children}</Text>	
  		</Group>
		);
	}
}

DaButton.propTypes = {
	style: React.PropTypes.object.isRequired,
};

export default DaButton;