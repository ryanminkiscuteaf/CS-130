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

var AnObjectInPartsBin = React.createClass({
    onDrag: function () {
        this.props.eventHandler.publish(DRAG_EVENT, this.state);
    }
});

var TheGlobalScene = React.createClass({
    getInitialState: function () {
        this.props.eventHandler.subscribe(DRAG_EVENT, function (e) {
            // TODO: validate shape structure
            this.setState({newShapes: this.state.newShapes.concat([e])});
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
