/**
 * Created by lowellbander on 4/12/16.
 */

var React = require('react');
var ReactDOM = require('react-dom');
//var ReactCanvas = require('react-canvas');

var App = React.createClass({
    render: function () {
        return (<p>Hello, world!</p>);
    }
});

ReactDOM.render(<App />, document.getElementById('main'));

