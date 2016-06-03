/**
 * Created by aman on 5/18/16.
 */

let Color = require('./ColorConstants');

class Shape {
    constructor ({id, type, top, left, width, height, color}={}) {
        this.id = id;
        this.type = type || 'circle';
        this.top = top || 0;
        this.left = left || 0;
        this.width = width || 50;
        this.height = height || 50;
        this.color = color || Color.NODE;
    }

    copy () {
        return new Shape(this);
    }
}

export default Shape;
