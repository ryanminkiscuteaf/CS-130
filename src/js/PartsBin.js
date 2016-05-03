'use strict';

import React from 'react';
import ReactCanvas from 'react-canvas';

import Item from './partsbin/Item';
import Draggable from './Draggable';
import Generic from './Generic';

let Group = ReactCanvas.Group;
let ListView = ReactCanvas.ListView;

let Event = require('./event/EventNames');
let ee = require('./event/EventEmitter');

class PartsBin extends React.Component {
	constructor() {
		super();

		// Initialize event listeners
		ee.addListener(Event.PARTS_BIN_ADD_ITEM_EVENT, this.addItem.bind(this));
		ee.addListener(Event.PARTS_BIN_REMOVE_ITEM_EVENT, this.removeItem.bind(this));
		ee.addListener(Event.PARTS_BIN_REPLACE_ITEM_EVENT, this.replaceItem.bind(this));
		
		// Uncomment below if you want parts bin to handle an item cloning
		//ee.addListener(Event.PARTS_BIN_CLONE_ITEM_EVENT, this.cloneItem.bind(this));
	}

	componentWillMount() {
		this.state = {
			clone: null,
			items: new Map(this.props.items.map(item => [item.id, item]))
		}
	}

	/**
	 * Item
	 */
	
	addItem(item) {
		console.log("Add item to parts bin");
		
		this.setState({
			clone: this.state.clone,
			items: this.state.items.set(item.id, item)
		});
	}

	removeItem(id) {
		console.log("Remove item with id: " + id + " from parts bin");

		this.setState({
			clone: this.state.clone,
			items: this.state.items.delete(id)
		});
	}

	replaceItem(id, item) {
		console.log("Replace item with id: " + id + " in parts bin");

		this.setState({
			clone: this.state.clone,
			items: this.state.items.set(id, item)
		});
	}

	cloneItem(item) {
		this.setState({
			clone: item
		});
	}

	getItemHeight() {
		return this.props.style.itemHeight;
	}

	renderItem(itemIndex, scrollTop) {
		var items = Array.from(this.state.items);
		var item = items[itemIndex][1];

		return (
			<Item
				parentTop={this.props.style.top} 
				parentLeft={this.props.style.left}
				width={this.props.style.width}
				height={this.getItemHeight()}
				padding={this.props.style.itemPadding}
				itemIndex={itemIndex}
				id={item.id}
				shapes={item.shapes} />
		);
	}

	/**
	 * ListView
	 */
	
	getListViewStyle() {
		var style = this.props.style;
		return {
			top: style.top,
			left: style.left,
			width: style.width,
			height: style.height,
			backgroundColor: style.backgroundColor,
		};
	}

	getNumberOfItems() {
		return this.state.items.size;
	}

	renderGeneric() {
		var clone = this.state.clone;
		return (
			<Draggable xCoord={clone.x} yCoord={clone.y}>
        <Generic
          key={clone.id*999}
          width={clone.width}
          height={clone.height}
          shapes={clone.shapes} />
      </Draggable>
		);
	}

	render() {
		return (
			<Group>
				<ListView 
					style={this.getListViewStyle()} 
					numberOfItemsGetter={this.getNumberOfItems.bind(this)}
					itemHeightGetter={this.getItemHeight.bind(this)}
					itemGetter={this.renderItem.bind(this)} />
					{this.state.clone !== null && this.renderGeneric()}
      </Group>
		);
	}
}

export default PartsBin;
