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
}

export default Obj;