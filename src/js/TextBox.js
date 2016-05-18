import React from 'react';
import ReactCanvas from 'react-canvas';

import Cursor from './code-editor/Cursor';

let Group = ReactCanvas.Group;
let Text = ReactCanvas.Text;
let FontFace = ReactCanvas.FontFace;
let measureText = ReactCanvas.measureText;

let Event = require('./event/EventNames');
let ee = require('./event/EventEmitter');

class TextBox extends React.Component {

	constructor() {
		super();

		this.handleKeyDown = this.handleKeyDown.bind(this);
		this.handleKeyPress = this.handleKeyPress.bind(this);

		// Add event listeners
		ee.addListener(Event.CONJURER_CLICK, this.handleClick.bind(this));
	}

	componentWillMount() {
		var style = this.props.style;
		this.style = {
			top: style.top || 0,
			left: style.left || 0,
			padding: style.padding || 5,
			backgroundColor: style.backgroundColor || "#E21212",
			textColor: style.textColor || "#ffffff",
			cursorColor: style.cursorColor || "#000000",
			fontSize: style.fontSize || 16,
			fontFace: style.fontFace || FontFace('Monaco'),
		};

		// Measure and cache char width
		this.style.charWidth = this.measureCharWidth("X");
		this.style.charTotalMax = 20;

		// Calculate line height, width, and height dynamically
		this.style.lineHeight = this.style.fontSize + 4;
		this.style.width = this.style.charWidth * this.style.charTotalMax + (this.style.padding * 2);
		this.style.height = this.style.lineHeight + (this.style.padding * 2);

		// Placeholder number
		this.defaultValue = "Fill me!";

		this.state = {
			value: this.defaultValue,
			curColNum: this.defaultValue.length,
			cursorX: this.getLeftmostPos() + (this.defaultValue.length * this.style.charWidth),
			cursorY: this.props.style.top + this.style.padding,
			isCursorMoving: false,
			hasKeyEvents: false 
		};

		// TEST: measure width of all valid chars
		/*for (var i = 32; i < 126; i++) {
			var c = String.fromCharCode(i);
			console.log(c + " : " + this.measureCharWidth(c));
		}*/
	}

	handleClick(position) {
		var withinXBounds = (position.X >= this.props.style.left) && (position.X <= this.props.style.left + this.style.width);
		var withinYBounds = (position.Y >= this.props.style.top) && (position.Y <= this.props.style.top + this.style.height);

		if (withinXBounds && withinYBounds) {
			this.listenToKeyEvents();
		} else {
			this.unlistenToKeyEvents();
		}
	}

	listenToKeyEvents() {	
		// Add event listeners for key presses
		if ( !this.state.hasKeyEvents ) {
			var curState = this.state;
			curState.hasKeyEvents = true;
			this.setState(curState);
			
			window.addEventListener('keydown', this.handleKeyDown, false);
			window.addEventListener('keypress', this.handleKeyPress, false);
		}
	}

	unlistenToKeyEvents() {	
		// IMPORTANT: Remove all event registers for key presses
		if (this.state.hasKeyEvents) {
			var curState = this.state;
			curState.hasKeyEvents = false;
			this.updateState(curState);

			window.removeEventListener('keydown', this.handleKeyDown, false);
			window.removeEventListener('keypress', this.handleKeyPress, false);
		}
	}

	/**
	 * Key Event Handlers
	 */

	handleKeyDown(e) {
		var keyCode = e.which;

		switch(keyCode) {
			case 8: 
				// Delete key
				e.preventDefault();
				this.handleDeleteKey();
				break;

			default:
				return;
		}
	}

	handleDeleteKey() {
		var curState = this.state;
		var value = curState.value;

		if (value.length > 0) {
			/* There are numbers in the box */

			if (curState.curColNum > 0) {
				/* Cursor NOT at the leftmost column */
				
				var newValue = this.stringWithDeletedCharAt(value, curState.curColNum - 1);
				curState.value = newValue;
				curState.curColNum--;
				this.updateState(curState);
			} 
		}
	}

	handleKeyPress(e) {
		var keyCode = e.which;

		if (keyCode === 13) {
			// Enter key
			e.preventDefault();
			this.handleEnterKey();
		} else if (this.isValidCharCode(keyCode)) {
			// Char key
			e.preventDefault();
			this.handleNumberCharKey(String.fromCharCode(keyCode));
		}	
	}

	handleEnterKey() {
		// Save value and remove event listeners
		this.unlistenToKeyEvents();
	}

	handleNumberCharKey(newChar) {
		var curState = this.state;
		var value = curState.value;

		if (value.length < this.style.charTotalMax) {
			/* Total number of numbers is less than total max */

			var lhs = value.slice(0, curState.curColNum);
			var rhs = value.slice(curState.curColNum, value.length);
			var newValue = lhs + newChar + rhs;

			curState.value = newValue;
			curState.curColNum++;
			this.updateState(curState);
		}
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
			backgroundColor: this.style.backgroundColor
		};
	}

	getTextStyle() {
		return {
			top: this.props.style.top + this.style.padding,
      left: this.getLeftmostPos(),
      width: this.style.width - (this.style.padding * 2),
      height: this.style.lineHeight,
      lineHeight: this.style.lineHeight,
      fontSize: this.style.fontSize,
      fontFace: this.style.fontFace,
      color: this.style.textColor,
      textAlign: this.state.hasKeyEvents ? "left" : "center",
		};
	}

	getCursorStyle() {
		return {
			top: this.state.cursorY,
  		left: this.state.cursorX,
  		width: 2,
  		height: this.style.lineHeight,
  		backgroundColor: this.style.cursorColor
		};
	}

	render() {
		return (
			<Group key={"text-box-group"} style={this.getStyle()}>
				<Text key={"text-box-text"} style={this.getTextStyle()}>{this.state.value}</Text>
				<Cursor style={this.getCursorStyle()} isMoving={this.state.isCursorMoving} isVisible={this.state.hasKeyEvents} />
			</Group>
		);
	}

	/**
	 * Misc
	 */

	updateState(state) {
		// Calculate cursor position based on the column number
		var cursorX = this.getLeftmostPos() + (this.style.charWidth * state.curColNum);
		
		// Update cursor position
		state.cursorX = cursorX;
		
		// Finally update the state once
		this.setState(state);
	}

	isValidCharCode(code) {
		// Reference: http://unicode-table.com/en/
		return code >= 32 && code <= 126;
	}

	getLeftmostPos() {
		return this.props.style.left + this.style.padding; 
	}

	measureCharWidth(c) {
		var charSize = measureText(c, 10, this.style.fontFace, this.style.fontSize, this.style.lineHeight);
		return charSize.width;
	}

	stringWithDeletedCharAt(str, i) {
		var leftStr = str.slice(0, i);
		var rightStr = str.slice(i + 1, str.length);

		return leftStr + rightStr;
	}
}

export default TextBox;