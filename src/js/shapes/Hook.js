import React from 'react';
import ReactCanvas from 'react-canvas';

import Circle from './Circle';

let Group = ReactCanvas.Group;
let Image = ReactCanvas.Image;

class Hook extends React.Component {

	/**
	 * Render
	 */

	getStyle() {
		return {
			top: this.props.style.top,
			left: this.props.style.left,
			width: this.props.style.width,
			height: this.props.style.height,
			backgroundColor: this.props.style.backgroundColor
		};
	}

	getImageStyle() {
		var side = this.props.style.width / 2;

    return {
      top: this.props.style.top + ((this.props.style.height - side) / 2),
      left: this.props.style.left + ((this.props.style.width - side) / 2),
      width: side,
      height: side
    };
  }

  getImageURL() {
  	return require("../img/hook-white.png");
  }

	render() {
		return (
			<Group key={"node-hook-group"}>
				<Circle style={this.getStyle()} />
				<Image key={"node-hook-image"} style={this.getImageStyle()} src={this.getImageURL()} />
			</Group>
		);
	}
}

export default Hook;