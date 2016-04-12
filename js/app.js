/**
 * Created by lowellbander on 4/12/16.
 */

console.log("foobar");


var React = require('react');
var ReactDOM = require('react-dom');
var ReactCanvas = require('react-canvas');

var App = React.createClass({
    render: function () {
        return (<p>Hello, world!</p>);
    }
});

//ReactDOM.render(<App />, document.getElementById('main'));

var CommentBox = React.createClass({displayName: 'CommentBox',
    render: function() {
        console.log("HELLO");
        return (
            React.createElement('div', {className: "commentBox"},
                "Hello, world! I am a CommentBox."
            )
        );
    }
});
ReactDOM.render(
    React.createElement(CommentBox, null),
    document.getElementById('content')
);
