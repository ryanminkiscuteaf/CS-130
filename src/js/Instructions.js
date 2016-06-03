import React from 'react';
import ReactDOM from 'react-dom';

import Nav from './Nav';
import Section from './Section';

class Instructions extends React.Component {

	getContent() {
		return [
			{
				title: "Parts Bin",
				body: "The Parts Bin contains primitives that you can use to build a tree component and consequently, a tree. There are three types of primitives.",
				img: require("./img/parts-bin.png"),
				list: [
					"NodeHook - Purple Node",
					"NumberNode - Red Node",
					"OperatorNode - Green Node"
				]
			},
			{
				title: "Enter Creating Mode",
				body: "You have to create a tree component yourself before you can use it to build a bigger tree.",
				img: require("./img/enter.png"),
				list: [
					"Click on \"Enter Creating Mode\" to begin."
				]
			},
			{
				title: "Create a Tree Component",
				body: "",
				img: require("./img/number-tree-comp.png"),
				list: [
					"Click on a NumberNode on the PartsBin on the left. It will appear in the WorkSpace in the center of the screen.",
					"Click on a NodeHook in the PartsBin (the purple one). It will appear in the WorkSpace in the center of the screen. Drag it under the NumberNode, either to the left or right.",
					"Repeat with a second NodeHook.",
					"Click on \"Save to PartsBin\". Now that structure is in the PartsBin. Scroll down to view.",
					"Click on \"Exit creating mode\"."
				]
			},
			{
				title: "Create a Tree",
				body: "",
				img: require("./img/tree.png"),
				list: [
					"Click on the component you just made in the PartsBin. It will appear in the WorkSpace in the center of the screen.",
					"Click on the component as many times as necessary to construct your tree.",
					"Drag each component to a NodeHook (the purple objects) to snap into place.",
					"Click on the NumberNode in the PartsBin to place NumberNodes on all the leftover NodeHooks (\"the leaves\").",
					"Double click on each of the NumberNodes to change its numerical value."
				]
			},
			{
				title: "BFS/DFS",
				body: "Visual representation of the route that the code takes when processing a Breadth First Search or a Depth First Search for a particular value. Create a data structure (tree), type BFS or DFS into the CodeEditor, and watch it go!",
				img: require("./img/dfs.png"),
				list: [
					"Type \"dfs(number_to_find)\" or \"bfs(number_to_find)\""
				]
			},
			{
				title: "Math Tree",
				body: "Create a data structure (tree) and then type L2R (to process equation the usual way of left-to-right) or R2L (to process equation right-to-left) to visually demonstrate how code processes mathematical equations in the data structure.",
				img: require("./img/math-tree.png"),
				list: [
					"Type \"L2R\" or \"R2L\""
				]
			},
			{
				title: "Magic Math",
				body: "To see how the computer arranges any typed mathematical equation in a data structure. Just type an equation into the CodeEditor and a data structure will be created for you! Click on run and see how the code processes through the data structure.",
				img: require("./img/magic-math.png"),
				list: [
					"Type any basic arithmetic expression e.g. 1 + 10 * 2 - 5"
				]
			}
		];
	}

	renderSections() {
		var contents = this.getContent();
		var sections = [];

		for (var i = 0; i < contents.length; i++) {
			sections.push(<Section left={i%2 ? false : true} title={contents[i].title} body={contents[i].body} img={contents[i].img} list={contents[i].list} />);
		}

		return sections;
	}

	render() {
		return (
			<div>
				<Nav />
				{this.renderSections()}
			</div>
		);
	}
}

export default Instructions;