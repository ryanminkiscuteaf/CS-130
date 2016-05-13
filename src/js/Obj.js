class Obj {
    constructor ({id, ref, x, y, shapes}={}) {
        this.width = 180;
        this.height = 180;
        this.children = [];
        this.id = id;
        this.ref = ref;
        this.x = x;
        this.y = y;
        this.shapes = shapes;
    };
}

export default Obj;