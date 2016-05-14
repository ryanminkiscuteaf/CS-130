class Obj {
    constructor ({id, ref, x, y, shapes, width, height}={}) {
        this.width = width || 180;
        this.height = height || 180;
        this.children = [];
        this.id = id;
        this.ref = ref;
        this.x = x;
        this.y = y;
        this.shapes = shapes;
    };
    
    copy () {
        function copyShape (shape) {
            return {
                type: shape.type,
                top: shape.top,
                left: shape.left,
                width: shape.width,
                height: shape.height,
                color: shape.color
            };
        }
        return {
            id: this.id,
            ref: this.ref,
            width: this.width,
            height: this.height,
            x: this.x,
            y: this.y,
            shapes: this.shapes.map(copyShape),
            children: this.children.map(this.copy)
        };
    };
}

export default Obj;