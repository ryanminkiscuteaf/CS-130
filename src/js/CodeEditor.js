import React from 'react';
import ReactCanvas from 'react-canvas';
import Cursor from './code-editor/Cursor';
import DaButton from './DaButton';
import Obj from './Obj';
import NumberShape from './NumberShape';
import LineShape from './LineShape';

let Group = ReactCanvas.Group;
let Text = ReactCanvas.Text;
let FontFace = ReactCanvas.FontFace;
let measureText = ReactCanvas.measureText;

let Event = require('./event/EventNames');
let ee = require('./event/EventEmitter');

let Color = require('./ColorConstants');
let NODE_SPACE = 50 + 30;

class CodeEditor extends React.Component {
	constructor() {
		super();

		this.currentObject = {};

		// Key event listeners
		this.handleKeyDown = this.handleKeyDown.bind(this);
		this.handleKeyUp = this.handleKeyUp.bind(this);
		this.handleKeyPress = this.handleKeyPress.bind(this);

		// Event listeners
		this.listenToKeyEvents = this.listenToKeyEvents.bind(this);
		this.unlistenToKeyEvents = this.unlistenToKeyEvents.bind(this);
		this.setCurrentObject = this.setCurrentObject.bind(this);

		// Nodes
		this.highlightNode = this.highlightNode.bind(this);
		this.performOperation = this.performOperation.bind(this);
		this.performDFS = this.performDFS.bind(this);

		this.nodes = [];
		this.foundNode = "";
		this.isNodeFound = false;
		this.isSearch = false;
		this.mathTraces = [];

		// Global ID
		this.nodeId = 6669990;
	}

	componentWillMount() {
		var style = this.props.style;
		this.style = {
			top: style.top || 0,
			left: style.left || 0,
			width: style.width || 400,
			height: style.height || 300,
			padding: style.padding || 10,
			backgroundColor: style.backgroundColor || "#000000",
			textColor: style.textColor || "#ffffff",
			lineNumColor: style.lineNumColor || "#ff4d4d",
			cursorColor: style.cursorColor || "#66e0ff",
			lineHeight: style.lineHeight || 20,
			fontSize: style.fontSize || 12,
			fontFace: style.fontFace || FontFace('Monaco'),
			lineNumWidth: style.lineNumWidth || 30,
			divHeight: 50,
			divBackgroundColor: "#333333",
			buttonHeight: 36,
			buttonWidth: 70,
			buttonColor: "#ffffff",
			buttonBackgroundColor: Color.DEFAULT_BUTTON
		};

		// Measure and cache char width
		this.style.charWidth = this.measureCharWidth("X");

		var lineWidth = this.style.width - (this.style.padding * 2) - this.style.lineNumWidth;
		this.style.charTotalMax = Math.floor(lineWidth / this.style.charWidth);
		this.style.lineTotalMax = Math.floor((this.style.height - this.style.padding - this.style.divHeight) / this.style.lineHeight);

		this.state = {
			texts: [[""]],
			lineTotal: 1,
			curLineNum: 0,
			curColNum: 0,
			cursorX: this.getLeftmostLinePos(),
			cursorY: this.style.top + this.style.padding,
			isCursorMoving: false,
			hasKeyEvents: false
		};

		// Add event listeners
		ee.addListener(Event.CODE_EDITOR_ON_CLICK, this.listenToKeyEvents);
		ee.addListener(Event.CODE_EDITOR_OFF_CLICK, this.unlistenToKeyEvents);
		ee.addListener(Event.OBJECTS_STATE_UPDATED, this.setCurrentObject);
	}

	componentWillUnmount() {
		// Remove event listeners
		ee.removeListener(Event.CODE_EDITOR_ON_CLICK, this.listenToKeyEvents);
		ee.removeListener(Event.CODE_EDITOR_OFF_CLICK, this.unlistenToKeyEvents);
		ee.removeListener(Event.OBJECTS_STATE_UPDATED, this.setCurrentObject);
	}

	listenToKeyEvents() {	
		// Add event listeners for key presses
		if ( !this.state.hasKeyEvents ) {
			var curState = this.state;
			curState.hasKeyEvents = true;
			this.setState(curState);

			window.addEventListener('keydown', this.handleKeyDown, false);
			window.addEventListener('keyup', this.handleKeyUp, false);
			window.addEventListener('keypress', this.handleKeyPress, false);
		}
	}

	unlistenToKeyEvents() {	
		// IMPORTANT: Remove all event registers for key presses
		if (this.state.hasKeyEvents) {
			var curState = this.state;
			curState.hasKeyEvents = false;
			this.setState(curState);

			window.removeEventListener('keydown', this.handleKeyDown, false);
			window.removeEventListener('keyup', this.handleKeyUp, false);
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

			case 9:
				// Tab key
				e.preventDefault();
				this.handleCharKey("  ")
				break;

			case 37:
				// Arrow left key
				e.preventDefault();
				this.handleArrowLeftKey();
				break;

			case 38:
				// Arow up key
				e.preventDefault();
				this.handleArrowUpKey();
				break;

			case 39:
				// Arrow right key
				e.preventDefault();
				this.handleArrowRightKey();
				break;

			case 40:
				// Arrow down key
				e.preventDefault();
				this.handleArrowDownKey();
				break;

			default:
				return;
		}
	}

	handleArrowLeftKey() {
		var curState = this.state;

		if (curState.curColNum <= 0) {
			/* Cursor at the leftmost column */
			if (curState.curLineNum > 0) {
				
				// Move cursor
				var aboveLine = this.getSubText(curState.curLineNum - 1);
				var newColNum = curState.curColNum;
				
				if (this.isLastSubline(curState.curLineNum - 1)) {
					// The above line is the last subline
					newColNum = aboveLine.length;
				} else {
					newColNum = aboveLine.length - 1;
				}

				// Update state
				curState.curLineNum--;
				curState.curColNum = newColNum;
				curState.isCursorMoving = true;
				this.updateState(curState);
			}

		}	else {
			/* Cursor NOT at the leftmost column */

			// Update state
			curState.curColNum--;
			curState.isCursorMoving = true;
			this.updateState(curState);
		}
	}

	handleArrowUpKey() {
		var curState = this.state;

		if (curState.curLineNum > 0) {
			/* Cursor NOT at the highest line */
			
			var aboveLine = this.getSubText(curState.curLineNum-1);

			if (aboveLine.length < curState.curColNum) {

				curState.curColNum = aboveLine.length;

			} else if (this.isCursorAtRightmostCol() && !this.isLastSubline(curState.curLineNum-1)) {
					//	Cursor at the rightmost column
					//	Above line is NOT the last subline in its group
					curState.curColNum = aboveLine.length - 1;
			}

			// Update state
			curState.curLineNum--;
			curState.isCursorMoving = true;
			this.updateState(curState);

		} else {
			/* Cursor at highest line */

			// Update state
			curState.curColNum = 0;
			curState.isCursorMoving = true;
			this.updateState(curState);
		}
	}

	handleArrowRightKey() {
		var curState = this.state;
		var newColNum = curState.curColNum;
		var newLineNum = curState.curLineNum;
		
		if (curState.curColNum >= this.getSubText(curState.curLineNum).length) {
			/* Cursor at the rightmost column */
			
			if (curState.curLineNum < curState.lineTotal - 1) {
				/* Cursor NOT at the last line */

				// Update state
				newColNum = 0;
				newLineNum++;
			}

		} else { /* Cursor NOT at the rightmost column */

			var curLine = this.getSubText(curState.curLineNum);

			if ( !this.isLastSubline(curState.curLineNum) && this.sublineHasMaxWidth(curState.curLineNum) && curState.curColNum >= curLine.length-1) {
				
				newColNum = 0;
				newLineNum++;

			} else {
				newColNum++;
			}
		}

		// Update state
		curState.curColNum = newColNum;
		curState.curLineNum = newLineNum;
		curState.isCursorMoving = true;
		this.updateState(curState);
	}

	handleArrowDownKey() {
		var curState = this.state;
		var newColNum = curState.curColNum;
		var newLineNum = curState.curLineNum;

		if (curState.curLineNum < curState.lineTotal - 1) {
			/* Cursor NOT at the lowest line */
			
			var belowLine = this.getSubText(curState.curLineNum + 1);

			if (belowLine.length >= curState.curColNum) {

				if (this.isCursorAtRightmostCol() && !this.isLastSubline(curState.curLineNum + 1))
					newColNum = belowLine.length - 1;

			} else {
				newColNum = belowLine.length;
			}

			// Update state
			newLineNum++;

		} else {
			/* Cursor at the lowest line */
			
			// Update state
			var curLine = this.getSubText(curState.curLineNum);
			newColNum = curLine.length;
		}

		// Update state
		curState.curColNum = newColNum;
		curState.curLineNum = newLineNum;
		curState.isCursorMoving = true;
		this.updateState(curState);
	}

	handleDeleteKey() {
		var curState = this.state;
		var texts = curState.texts;
		var lineTotal = curState.lineTotal;
		var curLineNum = curState.curLineNum;
		var curColNum = curState.curColNum;
		var curLine = this.getSubText(curState.curLineNum);
		var textInfo = this.getTextInfo(curState.curLineNum);

		if (curLine.length <= 0) {
			/* There are no characters in the current line */

			if (curLineNum > 0) {
				
				lineTotal--;
				curLineNum--;
				curColNum = this.getSubText(curLineNum).length;

				// Remove the line group
				texts.splice(textInfo.textsIndex, 1);
			}

		} else {
			/* There is one or more character in the current line */

			if (curState.curColNum > 0) {
				/* Cursor NOT at the leftmost column */

				var deletedCharIndex = curState.curColNum - 1;
				var newLine = this.stringWithDeletedCharAt(curLine, deletedCharIndex);

				var i = textInfo.textIndex;
				while (i < textInfo.textLen) {

					if (i + 1 < textInfo.textLen) {
						var firstChar = texts[textInfo.textsIndex][i+1].substring(0, 1);
						texts[textInfo.textsIndex][i] = newLine + firstChar;

						// The new line for the below line 
						newLine = texts[textInfo.textsIndex][i+1].substring(1);
					} else {
						// We are currently at the last subline
						texts[textInfo.textsIndex][i] = newLine;
					}

					// Increment the index
					i++;
				}

				// Check if the last subline is empty
				if (texts[textInfo.textsIndex][textInfo.textLen - 1].length == 0) {
					/* Last subline is empty */

					var newLastSubline = textInfo.textLen > 1 ? texts[textInfo.textsIndex][textInfo.textLen - 2] : null;

					// Check if cursor is at the last subline and there is only one char at the subline
					if (this.isLastSubline(curState.curLineNum)) {
						/* Cursor at the last subline */

						if (newLastSubline == null) {
							/* Cursor at the only subline */

							curColNum = 0;

						} else {
							/* Cursor NOT at the only subline */

							// Remove subline from line group
							texts[textInfo.textsIndex].pop();

							lineTotal--;
							curLineNum--;
							curColNum = newLastSubline.length;
						}

					} else {
						/* Cursor NOT at the last subline */

						// Remove subline from line group
						texts[textInfo.textsIndex].pop();

						lineTotal--;
						curColNum--;
					}

				} else {
					/* Last subline is NOT empty  */

					curColNum--;
				}

			} else {
				/* Cursor at the leftmost column */

				var textInfo = this.getTextInfo(curState.curLineNum);

				if (textInfo.textIndex <= 0) {
					/* Cursor at the first subline  */

					if (textInfo.textsIndex <= 0) {
						/* Cursor at the first line group */

						// None bcos you're fucking stupid

					} else {
						/* Cursor NOT at the first line group */

						var aboveLine = this.getSubText(curState.curLineNum - 1);
						var prevAboveLine = aboveLine;
						var neededCharTotal = this.style.charTotalMax - aboveLine.length;
						var aboveTextInfo = this.getTextInfo(curState.curLineNum - 1);

						var i = textInfo.textIndex;
						var aboveSublineIndex = aboveTextInfo.textIndex;
						while (i < textInfo.textLen) {

							var neededChars = texts[textInfo.textsIndex][i].substring(0, neededCharTotal);
							var remainingChars = texts[textInfo.textsIndex][i].substring(neededCharTotal);
							texts[aboveTextInfo.textsIndex][aboveSublineIndex] = aboveLine + neededChars;

							if (remainingChars.length > 0)
								texts[aboveTextInfo.textsIndex].concat("");

							aboveLine = remainingChars;

							// Increment index
							i++;
							aboveSublineIndex++;
						}

						// Check if the last subline is empty
						if (aboveLine.length > 0) {
							/* Last subline is NOT empty */
							texts[aboveTextInfo.textsIndex][aboveSublineIndex] = aboveLine;
						} 

						// Remove the current line group
						texts.splice(textInfo.textsIndex, 1);

						lineTotal--;
						curLineNum--;
						curColNum = prevAboveLine.length;
					}

				} else {
					/* Cursor NOT at the first subline */

					var aboveLine = texts[textInfo.textsIndex][textInfo.textIndex - 1];
					var lastChar = aboveLine.substring(aboveLine.length - 1);
					var topLine = this.stringWithDeletedCharAt(aboveLine, aboveLine.length - 1);
					var newLine = topLine;

					var i = textInfo.textIndex;
					while (i < textInfo.textLen) {

						// Get first character of the current line
						var curFirstChar = texts[textInfo.textsIndex][i].substring(0, 1);

						// Update above line
						texts[textInfo.textsIndex][i-1] = newLine + curFirstChar;

						// Update new line
						newLine = this.stringWithDeletedCharAt(texts[textInfo.textsIndex][i], 0);

						// Increment index
						i++;
					}

					// Update the last line
					texts[textInfo.textsIndex][i-1] = newLine;

					// Check if the last subline is empty
					if (texts[textInfo.textsIndex][textInfo.textLen-1].length == 0) {
						// Remove subline from line group
						texts[textInfo.textsIndex].pop();
						lineTotal--;
					}

					curLineNum--;
					curColNum = topLine.length;
				}
			}
		}

		// Update state
		curState.texts = texts;
		curState.lineTotal = lineTotal;
		curState.curLineNum = curLineNum;
		curState.curColNum = curColNum;
		this.updateState(curState);
	}

	handleKeyUp(e) {
		// Handle direction keys separately
		if (this.isDirectionKey(e.which)) {
			var curState = this.state;
			curState.isCursorMoving = false;
			this.setState(curState);
			return;
		}
	}

	handleKeyPress(e) {
		var keyCode = e.which;
		
		if (keyCode === 13) {
			// Enter key
			e.preventDefault();
			this.handleEnterKey();
		} else if (this.isValidCharCode(keyCode)) {
			e.preventDefault();
			this.handleCharKey(String.fromCharCode(keyCode));
		}		
	}

	handleEnterKey() {
		var curState = this.state;
		var texts = curState.texts;
		var textInfo = this.getTextInfo(curState.curLineNum);
		var curLine = this.getSubText(curState.curLineNum);

		var newLine = curLine.substring(0, curState.curColNum);
		var remainingLine = curLine.substring(curState.curColNum, curLine.length);
		var neededCharTotal = this.style.charTotalMax - remainingLine.length;

		// ***
		// Check if enter results in line total > line total max
		var numOfNewLinesToBeAdded = 0;

		if (textInfo.textLen == 1) {
			numOfNewLinesToBeAdded = 1;
		} else {
			if ((remainingLine.length + texts[textInfo.textsIndex][textInfo.textLen-1].length) > this.style.charTotalMax)
				numOfNewLinesToBeAdded = 1;
			else
				numOfNewLinesToBeAdded = 0;
		}

		if ((curState.lineTotal + numOfNewLinesToBeAdded) > this.style.lineTotalMax) {
			return;
		}

		// ****

		// Update current line
		texts[textInfo.textsIndex][textInfo.textIndex] = newLine;
		
		// Insert a new line below the current line
		texts.splice(textInfo.textsIndex + 1, 0, [""]);

		var belowLineIndex = textInfo.textsIndex + 1;
		var belowSublineIndex = 0;
		var i = textInfo.textIndex + 1;

		while (i < textInfo.textLen) {

			var neededChars = texts[textInfo.textsIndex][i].substring(0, neededCharTotal);
			var remainingChars = texts[textInfo.textsIndex][i].substring(neededCharTotal);
			texts[belowLineIndex][belowSublineIndex] = remainingLine + neededChars;

			if (remainingChars.length > 0)
				texts[belowLineIndex].concat("");

			remainingLine = remainingChars;

			// Increment index
			i++;
			belowSublineIndex++;
		}

		if (remainingLine.length > 0) {
			texts[belowLineIndex][belowSublineIndex] = remainingLine;
		}

		// Update current line group's sublines
		texts[textInfo.textsIndex].length = textInfo.textIndex + 1;

		// Update state
		//if (curState.lineTotal >= this.style.lineTotalMax)
		
		curState.texts = texts;
		curState.lineTotal++;
		curState.curLineNum++;
		curState.curColNum = 0;
		this.updateState(curState);
	}	

	handleCharKey(newChar) {
		var curState = this.state;
		var texts = curState.texts;
		var textInfo = this.getTextInfo(curState.curLineNum);

		var newColNum = curState.curColNum;
		var newLineNum = curState.curLineNum;
		var newLineTotal = curState.lineTotal;
		
		// Update line
		var curLine = this.getSubText(curState.curLineNum);
		var leftLine = curLine.slice(0, curState.curColNum);
		var rightLine = curLine.slice(curState.curColNum, curLine.length);

		if ((curState.curColNum == this.style.charTotalMax - 1) && newChar == "  ")
			newChar = " ";

		var newLine = leftLine + newChar + rightLine;
		var origNewLine = newLine;

		// ***
		// Check if enter results in line total > line total max

		var numOfNewLinesToBeAdded = 0;
		
		if (newLine.length > this.style.charTotalMax) {
			if (textInfo.textLen <= 1) {
				numOfNewLinesToBeAdded = 1;
			} else {
				if ((texts[textInfo.textsIndex][textInfo.textLen-1].length + newChar.length) > this.style.charTotalMax)
					numOfNewLinesToBeAdded = 1;
			}
		}

		if ((curState.lineTotal + numOfNewLinesToBeAdded) > this.style.lineTotalMax)
			return;

		// ***

		var i = textInfo.textIndex;
		while (i < textInfo.textLen) {
			if (newLine.length > this.style.charTotalMax) {
				// New line is longer than the max width of the line
				// so prepend the last char to the subline below

				// Update current line
				texts[textInfo.textsIndex][i] = newLine.substring(0, newLine.length - newChar.length);

				var lastChar = newLine.substring(newLine.length - newChar.length);

				if (i >= textInfo.textLen - 1) {
					// We are currently at the last subline in this line group
					// so spawn a new subline
					texts[textInfo.textsIndex] = texts[textInfo.textsIndex].concat(lastChar);

					newLineTotal++;
					break;

				} else {
					newLine = lastChar + texts[textInfo.textsIndex][i+1];
				}

			} else {
				texts[textInfo.textsIndex][i] = newLine;
				break;
			}

			// Increment index
			i++;
		}

		// Update state
		newColNum = curState.curColNum + newChar.length;

		if (origNewLine.length > this.style.charTotalMax) {
			if (curState.curColNum == this.style.charTotalMax - 1)
				newColNum = newChar.length - 1;
			else if (curState.curColNum == this.style.charTotalMax)
				newColNum = newChar.length;

			newLineNum++;
		}

		curState.texts = texts;
		curState.curColNum = newColNum;
		curState.curLineNum = newLineNum;
		curState.lineTotal = newLineTotal;
		this.updateState(curState);
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

  getLineNumTextStyle(index) {
    return {
      top: this.style.top + this.style.padding + (index * this.style.lineHeight),
      left: this.getLeftmostLinePos() - this.style.lineNumWidth,
      width: this.style.lineNumWidth,
      height: this.style.lineHeight,
      lineHeight: this.style.lineHeight,
      fontSize: this.style.fontSize,
      fontFace: this.style.fontFace,
      color: this.state.curLineNum == index ? this.style.cursorColor : this.style.lineNumColor,
    };
  }

	getLineTextStyle(index) {
    return {
      top: this.style.top + this.style.padding + (index * this.style.lineHeight),
      left: this.getLeftmostLinePos(),
      width: this.style.width - (this.style.padding * 2),
      height: this.style.lineHeight,
      lineHeight: this.style.lineHeight,
      fontSize: this.style.fontSize,
      fontFace: this.style.fontFace,
      color: this.style.textColor,
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

  getDivStyle() {
  	return {
	  	top: this.style.top + this.style.height - this.style.divHeight,
	  	left: this.style.left,
	  	width: this.style.width,
	  	height: this.style.divHeight,
	  	backgroundColor: this.style.divBackgroundColor
  	};
  }

  getRunButtonStyle() {
  	return {
	  	top: this.style.top + this.style.height - this.style.divHeight + ((this.style.divHeight - this.style.buttonHeight) / 2),
	  	left: this.getLeftmostLinePos(),
	  	width: this.style.buttonWidth,
	  	height: this.style.buttonHeight,
	  	color: this.style.buttonColor,
	  	backgroundColor: this.style.buttonBackgroundColor
  	};
  }

  getClearButtonStyle() {
  	var style = this.getRunButtonStyle();
  	style.left = style.left + this.style.buttonWidth + 20;
  	return style;
  }

  // IMPORTANT: we need the Group to successfully render all the Text components
  renderTextBox() {
  	var that = this;
  	var texts = this.state.texts;
  	var lineIndex = 0;

  	var lines = texts.map(function(text, i) {
  		var lineNum = i + 1;
  		var mainLineKey = "ce-main-line-" + i.toString();
  		var lineNumKey = "ce-line-num-" + i.toString();
  		var lineNumIndex = lineIndex;
  		
  		// Render a subline
  		var sublines = text.map(function(subtext, j) {
  			var sublineKey = "ce-line-" + i.toString() + "-" + j.toString();

  			return <Text key={sublineKey} style={that.getLineTextStyle(lineIndex++)}>{subtext}</Text>;
  		}); 

  		// Render a line
  		var line = (
  			<Group key={mainLineKey}>
	  			<Text key={lineNumKey} style={that.getLineNumTextStyle(lineNumIndex)}>{lineNum.toString()}</Text>
	  			{sublines}
	 			</Group>
  		);

  		return line;
  	});
  	
  	// Render all the lines
  	return (
  		<Group key={"ce-text-box"}>
  			{lines}
  		</Group>
  	);
  }

  render() {
		//console.log("Rerender code editor");
		return (
			<Group key={"ce-main-group"} style={this.getStyle()}>
				{this.renderTextBox()}
				<Cursor style={this.getCursorStyle()} isMoving={this.state.isCursorMoving} isVisible={this.state.hasKeyEvents} />
				<Group key={"ce-div"} style={this.getDivStyle()}>
					<DaButton key={"ce-run-button"} style={this.getRunButtonStyle()} onClick={this.runCode.bind(this)}>Run</DaButton>
					<DaButton key={"ce- clear-button"} style={this.getClearButtonStyle()} onClick={this.clearCode.bind(this)}>Clear</DaButton>
	  		</Group>
			</Group>
		);
	}

	/**
	 * Code
	 */

	setCurrentObject(object) {
		this.currentObject = object;
	}

	runCode() {
		var texts = this.state.texts;
		var code = "";

		texts.forEach(function(text) {
			var line = text.join('');
			code += line + "\n";
		});

		console.log(this.currentObject);
		var order = 0;

		// Remove all newlines for comparison
		code = code.replace(/(\r\n|\n|\r)/gm,"");

		var dfsPattern = /dfs\([0-9]+\)/g;
		var bfsPattern = /bfs\([0-9]+\)/g;
		var numPattern = /[0-9]+/g;

		var isDFS =  false;
		var isBFS =  false;
		var value = 0;

		var infixExpPattern = /^\s*[0-9]+(\s*[\-+*\/]\s*[0-9]+)+\s*$/g; // TODO: make it more robust later

		if (code == "L2R") {
			code = "return this";
			order = 0;
		} else if (code == "R2L") {
			code = "return this";
			order = 1;
		} else if (code.match(dfsPattern)) {
			// DFS
			value = parseInt(code.match(numPattern));
			code = "return this";
			isDFS = true;
		} else if (code.match(bfsPattern)) {
			// BFS
			value = parseInt(code.match(numPattern));
			code = "return this";
			isBFS = true;
		} else if (code.match(infixExpPattern)) {
			// Infix expression -> operator tree
			console.log(code);

			code = code.replace(/(\s)/gm,"");

			// Parse the expression to tokens
			var tokens = [];
			var i = 0;
			var opPattern = /[\-+*\/]/g; 

			while (i < code.length) {
				if (code[i].toString().match(opPattern)) {
					// Current char is an operator
					tokens.push(code[i]);
					i++;
				} else {
					// Current char is a number
					var curToken = "";
					while (i < code.length && code[i].toString().match(/[0-9]/g)) {
						curToken += code[i];
						i++;
					}

					tokens.push(parseInt(curToken));
				}
			}

			// Convert infix expression to postfix expression
			var opStack = [];
			var postTokens = [];
			for (var j = 0; j < tokens.length; j++) {
				var curToken = tokens[j];

				if (Number.isInteger(curToken)) {
					postTokens.push(curToken);
				} else {
					if (opStack.length <= 0) {
						opStack.push(curToken);
					} else {
						if (opStack[opStack.length-1] == "*" || opStack[opStack.length-1] == "/") {
							postTokens.push(opStack.pop());
							opStack.push(curToken);
						} else {
							if (curToken == "*" || curToken == "/") {
								opStack.push(curToken);
							} else {
								postTokens.push(opStack.pop());
								opStack.push(curToken);
							}
						}
					}
				}
			}

			// Pop the remaining tokens form stack
			while (opStack.length > 0) {
				postTokens.push(opStack.pop());
			}

			console.log("Infix");
			console.log(tokens);

			console.log("Post fix");
			console.log(postTokens);

			var treeObj = this.createTree(postTokens, 400, 60, NODE_SPACE, 0);
			console.log("Tree");
			console.log(treeObj);

			ee.emitEvent(Event.CREATE_OPERATOR_TREE, [treeObj]);

			return;
		} else {
			code = "";
			window.alert("Invalid command!");
			return;
		}

		var curObj;
		var newCode = "var codeToRun = function () {" + code + "};" +
			"curObj = codeToRun.bind(this.currentObject)();";
		console.log(newCode);
		eval(newCode);
		console.log(curObj);

		if (isDFS) {
			this.isNodeFound = this.performDFS(curObj, value);
			this.isSearch = true;
		} else if (isBFS) {
			this.isNodeFound = this.performBFS(curObj, value);
			this.isSearch = true;
		} else {
			var result = this.performOperation(curObj, order);
			console.log("Operation result : " + result);

			this.mathTraces.push([""]);
			this.mathTraces.push(["Final result: " + result]);

			console.log(this.mathTraces);

			// Append the math traces to texts
			// Update state
			var curState = this.state;
			curState.texts = curState.texts.concat(this.mathTraces);
			curState.curLineNum = curState.curLineNum + this.mathTraces.length;
			curState.lineTotal = curState.lineTotal + this.mathTraces.length;
			curState.curColNum = this.mathTraces[this.mathTraces.length - 1][0].length;
			this.updateState(curState);
			
			// Empty math traces
			this.mathTraces = [];
		}

		//window.alert("Sum of children: " + sum);

		// Send the list of nodes to be executed
		ee.emitEvent(Event.HIGHLIGHT_NODES, [{
			ids: this.nodes,
			isNodeFound: this.isNodeFound,
			foundNode: this.foundNode,
			isSearch: this.isSearch
		}]);
	}

	getNodeId() {
		return this.nodeId++;
	}

	createTree(tokens, parentX, parentY, shapeX, shapeY) {
		var parentToken = tokens.pop();
		var parentId = this.getNodeId();
		
		var parentObj = new Obj({
      id: parentId,
      ref: parentId,
      x: parentX,
      y: parentY,
      shapes: [new NumberShape({
                id: parentId + "-0", 
                type: 'operator',
                top: shapeY,
                left: shapeX,
                width: 50,
                height: 50,
                color: Color.OPERATOR_PRIMITIVE,
                value: parentToken
              })],
      children: []
    });

		var rightChildId = this.getNodeId();
		var leftChildId = this.getNodeId();
		var rightChildObj;
    var leftChildObj;

		var rightToken = tokens[tokens.length-1];
		var isRightTokenOp = false;

		if (Number.isInteger(rightToken)) {

			// IMPORTANT
			tokens.pop();

			rightChildObj = new Obj({
	      id: rightChildId,
	      ref: rightChildId,
	      x: parentX,
	      y: parentY,
	      shapes: [new NumberShape({
	                id: rightChildId + "-0", 
	                type: 'number',
	                top: shapeY + NODE_SPACE,
	                left: shapeX + NODE_SPACE,
	                width: 50,
	                height: 50,
	                color: Color.NUMBER_PRIMITIVE,
	                value: rightToken.toString()
	              })],
	      children: []
	    });

		} else {
			isRightTokenOp = true;
			rightChildObj = this.createTree(tokens, parentX, parentY, shapeX + NODE_SPACE, shapeY + NODE_SPACE);
		}

		var leftToken = tokens[tokens.length-1];

		if (Number.isInteger(leftToken)) {

			// IMPORTANT
			tokens.pop();

			leftChildObj = new Obj({
	      id: leftChildId,
	      ref: leftChildId,
	      x: parentX,
	      y: parentY,
	      shapes: [new NumberShape({
	                id: leftChildId + "-0", 
	                type: 'number',
	                top: shapeY + NODE_SPACE,
	                left: shapeX - NODE_SPACE,
	                width: 50,
	                height: 50,
	                color: Color.NUMBER_PRIMITIVE,
	                value: leftToken.toString()
	              })],
	      children: []
	    });

		} else {
			leftChildObj = this.createTree(tokens, parentX, parentY, shapeX - NODE_SPACE - (isRightTokenOp ? NODE_SPACE * 2 : 0), shapeY + NODE_SPACE);
		}

		// Add lines connecting the parent and its children
    var head = parentObj.shapes[0];
    var lc = leftChildObj.shapes[0];
    var rc = rightChildObj.shapes[0];

    var ll = new LineShape({
                type: 'line',
                top: head.top + head.height,
                left: lc.left + lc.width,
                width: head.left - (lc.left + lc.width),
                height: lc.top - (head.top + head.height),
                direction: 0
              });

    var rl = new LineShape({
                type: 'line',
                top: head.top + head.height,
                left: head.left + head.width,
                width: rc.left - (head.left + head.width),
                height: rc.top - (head.top + head.height),
                direction: 1
              });

    parentObj.shapes.push(ll);
    parentObj.shapes.push(rl);


		// Push children nodes to parent
		parentObj.children = [leftChildObj, rightChildObj];

		return parentObj;
	}

	highlightNode(id) {
		console.log("Executing id: " + id);
		this.nodes.push(id);
	}

	performDFS(obj, value) {
		if (obj.children.length <= 0) {
			this.highlightNode(obj.id);
			var found = parseInt(obj.getNumberNode().value) === value;

			if (found)
				this.foundNode = obj.id;

			return found;
		}

		// IMPORTANT: We assume that the children are either 0 or 2
		var sortedChildren = this.sortChildrenNodes(obj.children, 0);

		this.highlightNode(obj.id);

		if (parseInt(obj.getNumberNode().value) === value) {
			this.foundNode = obj.id;
			return true; 
		}

		var l = this.performDFS(sortedChildren[0], value);
		if (l)
			return true;

		var r = this.performDFS(sortedChildren[1], value);
		if (r)
			return true;

		return false;
	}

	performBFS(obj, value) {
		var children = [obj];

		while (children.length > 0) {
			var curObj = children.shift();
			this.highlightNode(curObj.id);

			if (parseInt(curObj.getNumberNode().value) === value) {
				this.foundNode = curObj.id;
				return true;
			}

			// IMPORTANT: We assume that the children are either 0 or 2
			var sortedChildren = this.sortChildrenNodes(curObj.children, 0);
			children = children.concat(sortedChildren);
		}

		return false;
	}

	sortChildrenNodes(nodes, order) {
		console.log("Sorting nodes");

		nodes.sort(function(a, b) {
			/*if (a.shapes[0].left < b.shapes[0].left)
				return order ? 1 : -1;

			if (a.shapes[0].left > b.shapes[0].left)
				return order ? -1 : 1;*/

			var aHead = a.getHead();
			var bHead = b.getHead();

			if (aHead.left < bHead.left)
				return order ? 1 : -1;

			if (aHead.left > bHead.left)
				return order ? -1 : 1;

			return 0;
		});

		return nodes;
	}

	performOperation(obj, order) {
		if (obj.children.length <= 0) {
			this.highlightNode(obj.id);
			return parseInt(obj.getNumberNode().value);
		}

		// Non-leaf node
		var sum = 0;
		var that = this;
		
		// IMPORTANT: We assume that the children are either 0 or 2
		var sortedChildren = this.sortChildrenNodes(obj.children, order);

		this.highlightNode(obj.id);
		var leftTotal = this.performOperation(sortedChildren[0], order);

		this.highlightNode(obj.id);
		var rightTotal = this.performOperation(sortedChildren[1], order);

		var expression = parseFloat(leftTotal).toFixed(2) + " " + obj.getOperatorNode().value + " " + parseFloat(rightTotal).toFixed(2);
		sum = eval(expression).toFixed(2);

		console.log(expression + " = " + sum);

		this.mathTraces.push([expression + " = " + sum]); 

		this.highlightNode(obj.id);

		return sum;
	}

	clearCode() {
		var curState = this.state;
		curState.texts = [[""]];
		curState.lineTotal = 1;
		curState.curLineNum = 0;
		curState.curColNum = 0;
		this.updateState(curState);
	}

	/**
	 * Misc
	 */

	stringWithDeletedCharAt(str, i) {
		var leftStr = str.slice(0, i);
		var rightStr = str.slice(i + 1, str.length);

		return leftStr + rightStr;
	}

	updateState(state) {
		// Calculate cursor position based on the line and column numbers
		var cursorX = this.getLeftmostLinePos() + (this.style.charWidth * state.curColNum);
		var cursorY = this.style.top + this.style.padding + (this.style.lineHeight * state.curLineNum);

		// Update cursor position
		state.cursorX = cursorX;
		state.cursorY = cursorY;

		// Finally update the state once
		this.setState(state);
	}

	isValidCharCode(code) {
		// Reference: http://unicode-table.com/en/
		return code >= 32 && code <= 126;
	}

	sublineHasMaxWidth(lineNum) {
		var curLine = this.getSubText(lineNum);
		var textInfo = this.getTextInfo(lineNum);
		return curLine.length >= this.style.charTotalMax;
	}

	isLastSubline(lineNum) {
		var textInfo = this.getTextInfo(lineNum);
		return textInfo.textIndex >= textInfo.textLen - 1;
	}

	isCursorAtRightmostCol() {
		var curLine = this.getSubText(this.state.curLineNum);
		if (this.sublineHasMaxWidth(this.state.curLineNum)) {
			return this.state.curColNum >= curLine.length;
		}

		return false;
	}

	getTextInfo(lineNum) {
		var texts = this.state.texts;
		var len = 0;
		for (let i = 0; i < texts.length; i++) {
			var text = texts[i];
			var prevLen = len;
			len += text.length;

			if (lineNum < len) {
				// The line belongs to current line group
				return {
					textsIndex: i,
					textIndex: lineNum - prevLen,
					textLen: text.length
				};
			}
		}

		return null;
	}

	getSubText(lineNum) {
		var textInfo = this.getTextInfo(lineNum);
		return this.state.texts[textInfo.textsIndex][textInfo.textIndex];
	}

	getLeftmostLinePos() {
		return this.style.left + this.style.padding + this.style.lineNumWidth;
	}

	measureCharWidth(c) {
		var charSize = measureText(c, 10, this.style.fontFace, this.style.fontSize, this.style.lineHeight);
		return charSize.width;
	}

	measureTextWidth(t) {
		var textSize = measureText(t, this.style.width, this.style.fontFace, this.style.fontSize, this.style.lineHeight);
		return textSize.width;
	}

	isDirectionKey(keyCode) {
		return keyCode >= 37 && keyCode <= 40;
	}
}

CodeEditor.propTypes = {
	style: React.PropTypes.object.isRequired,
};

export default CodeEditor;