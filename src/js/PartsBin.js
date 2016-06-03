'use strict';

import React from 'react';
import ReactCanvas from 'react-canvas';

import Item from './partsbin/Item';
import Generic from './Generic';

let Group = ReactCanvas.Group;
let ListView = ReactCanvas.ListView;

let Event = require('./event/EventNames');
let ee = require('./event/EventEmitter');

class PartsBin extends React.Component {
	constructor() {
		super();

		// Initialize event listeners
		this.addItem = this.addItem.bind(this);
		this.removeItem = this.removeItem.bind(this);
		this.replaceItem = this.replaceItem.bind(this);
	}

	componentWillMount() {
		this.state = {
			items: new Map(this.props.initialItems.map(item => [item.id, item]))
		}

		// Add event listeners
		ee.addListener(Event.PARTS_BIN_ADD_ITEM_EVENT, this.addItem);
		ee.addListener(Event.PARTS_BIN_REMOVE_ITEM_EVENT, this.removeItem);
		ee.addListener(Event.PARTS_BIN_REPLACE_ITEM_EVENT, this.replaceItem);
	}

	componentWillUnmount() {
		// Remove event listeners
		ee.removeListener(Event.PARTS_BIN_ADD_ITEM_EVENT, this.addItem);
		ee.removeListener(Event.PARTS_BIN_REMOVE_ITEM_EVENT, this.removeItem);
		ee.removeListener(Event.PARTS_BIN_REPLACE_ITEM_EVENT, this.replaceItem);
	}

	/**
	 * Item
	 */
	
	addItem(item) {
		console.log("Add item to parts bin");
		
		this.setState({
			items: this.state.items.set(item.id, item)
		});
	}

	removeItem(id) {
		console.log("Remove item with id: " + id + " from parts bin");

		this.setState({
			items: this.state.items.delete(id)
		});
	}

	replaceItem(id, item) {
		console.log("Replace item with id: " + id + " in parts bin");

		this.setState({
			items: this.state.items.set(id, item)
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

	render() {
		return (
			<Group>
				<ListView 
					style={this.getListViewStyle()} 
					numberOfItemsGetter={this.getNumberOfItems.bind(this)}
					itemHeightGetter={this.getItemHeight.bind(this)}
					itemGetter={this.renderItem.bind(this)} />
      </Group>
		);
	}
}

export default PartsBin;
