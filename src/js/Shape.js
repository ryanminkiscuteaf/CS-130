/**
 * Created by aman on 5/18/16.
 */

let DEFAULT_COLOR = "#0000ff";

class Shape {
    constructor ({id, type, top, left, width, height, color}={}) {
        this.id = id;
        this.type = type || 'circle';
        this.top = top || 0;
        this.left = left || 0;
        this.width = width || 50;
        this.height = height || 50;
        this.color = color || DEFAULT_COLOR;
    }

    copy () {
        return new Shape(this);
    }
}

export default Shape;
