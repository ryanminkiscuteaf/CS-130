// representation of a structured object

<group>
    <representation>
        <Circle props={...}/>
        <Square props={...}/>
        <Square props={...}/>
    </representation>
    <anchors>
        <Anchor />
        <Anchor />
        <Anchor />
    </anchors>
</group>


var StructuredObject = React.createClass({
    getInitialState: function () {
        return {
            shapes: [],
            anchors: []
        };
    },
    render: function () {
        return (
            <Group>
                {this.state.shapes}
                {this.state.anchors}
            </Group>
        );
    }
});

// we'll us a publish/subscribe pattern to handle events
// a reference to the event handler will be passed to objects that need a handle to it

DRAG_EVENT = 'shapeDragged';
SAVE_EVENT = 'saveClicked';

var AnObjectInPartsBin = React.createClass({
    onDrag: function () {
        this.props.eventHandler.publish(DRAG_EVENT, this.state);
    }
});

var SaveButton = React.createClass({
    onClick: function () {
        this.props.eventHandler.publish(SAVE_EVENT, null);
    },
    render: function () {
        return (
            <p>Save current object</p>
        );
    }
});

var TheGlobalScene = React.createClass({
    getInitialState: function () {
        this.props.eventHandler.subscribe(DRAG_EVENT, function (e) {
            // TODO: validate shape structure
            this.setState({newShapes: this.state.newShapes.concat([e])});
        });
        this.props.eventHandler.subscribe(SAVE_EVENT, function (e) {
            var compose = function (shapes) {return {};};
            var newObj = compose(this.state.newShapes);
            this.setState(
                {objects: this.state.objects.concat([newObj])},
                function () {
                    // clear the workspace 
                    this.setState({newShapes: []});
                }
            );
            // TODO replace workspace with the object you were constructing
        });
        return {
            objects: [],
            newShapes: []
        };
    },
    render: function () {
        <Surface>
            <PartsBin />
            {this.state.objects.map(obj => renderObj(obj))}
            {this.state.newShapes.map(obj => renderObj(obj))}
        </Surface>
    }
});
