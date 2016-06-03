import React from 'react';
import ReactDOM from 'react-dom';

import Nav from './Nav';
import Section from './Section';
import Header from './Header';

class Instructions extends React.Component {

	getContent() {
		return [
			{
				header: "Before you start, let's learn the basics first!",
				alt: false,
				sections: [
					{
						title: "Below are instructions for constructing a data structure (tree) in Conjurer. When you are ready to create visualizations, click on \"Magic Room\" above on the navigation bar.",
						body: "",
						img : "",
						button: "",
						list: []
					}
				]
			},
			{
				header: "How to Construct a Tree",
				alt: true,
				sections: [
					{
						title: "1. Parts Bin",
						body: "The Parts Bin contains primitives that you can use to build a tree component and consequently, a tree. There are three types of primitives.",
						img: require("./img/parts-bin.png"),
						button: "",
						list: [
							"NodeHook - Purple Node",
							"NumberNode - Red Node",
							"OperatorNode - Green Node"
						]
					},
					{
						title: "2. Enter Creating Mode",
						body: "You have to create a tree component yourself before you can use it to build a bigger tree.",
						img: require("./img/enter.png"),
						button: "",
						list: [
							"Click on \"Enter Creating Mode\" to begin."
						]
					},
					{
						title: "3. Create a Tree Component",
						body: "",
						img: require("./img/number-tree-comp.png"),
						button: "",
						list: [
							"Click on a NumberNode on the PartsBin on the left. It will appear in the WorkSpace in the center of the screen.",
							"Click on a NodeHook in the PartsBin (the purple one). It will appear in the WorkSpace in the center of the screen. Drag it under the NumberNode, either to the left or right.",
							"Repeat with a second NodeHook.",
							"Click on \"Save to PartsBin\". Now that structure is in the PartsBin. Scroll down to view.",
							"Click on \"Exit creating mode\"."
						]
					},
					{
						title: "4. Create a Tree",
						body: "",
						img: require("./img/tree.png"),
						button: "",
						list: [
							"Click on the component you just made in the PartsBin. It will appear in the WorkSpace in the center of the screen.",
							"Click on the component as many times as necessary to construct your tree.",
							"Drag each component to a NodeHook (the purple objects) to snap into place.",
							"Click on the NumberNode in the PartsBin to place NumberNodes on all the leftover NodeHooks (\"the leaves\").",
							"Double click on each of the NumberNodes to change its numerical value."
						]
					}
				]
			},
			{
				header: "Visualizations",
				alt: true,
				sections: [
					{
						title: "1. BFS/DFS",
						body: "Visual representation of the route that the code takes when processing a Breadth First Search or a Depth First Search for a particular value. Create a data structure (tree), type BFS or DFS into the CodeEditor, and watch it go!",
						img: require("./img/dfs.png"),
						button: "Let's get started!",
						list: [
							"Type \"dfs(number_to_find)\" or \"bfs(number_to_find)\""
						]
					},
					{
						title: "2. Math Tree",
						body: "Create a data structure (tree) and then type L2R (to process equation the usual way of left-to-right) or R2L (to process equation right-to-left) to visually demonstrate how code processes mathematical equations in the data structure.",
						img: require("./img/math-tree.png"),
						button: "Let's get started!",
						list: [
							"Type \"L2R\" or \"R2L\""
						]
					},
					{
						title: "3. Magic Math",
						body: "To see how the computer arranges any typed mathematical equation in a data structure. Just type an equation into the CodeEditor and a data structure will be created for you! Click on run and see how the code processes through the data structure.",
						img: require("./img/magic-math.png"),
						button: "Let's get started!",
						list: [
							"Type any basic arithmetic expression e.g. 1 + 10 * 2 - 5"
						]
					}
				]
			}
		];
	}

	renderContents() {
		var contents = this.getContent();
		var sections = [];

		for (var i = 0; i < contents.length; i++) {
			var curContent = contents[i];

			sections.push(<Header title={curContent.header} alt={curContent.alt} />);
			
			for (var j = 0; j < curContent.sections.length; j++) {
				sections.push(<Section left={j%2 ? false : true} title={curContent.sections[j].title} body={curContent.sections[j].body} img={curContent.sections[j].img} button={curContent.sections[j].button} list={curContent.sections[j].list} />);
			}
			
		}

		return sections;
	}

	render() {
		return (
			<div>
				<Nav />
				{this.renderContents()}
			</div>
		);
	}
}

export default Instructions;