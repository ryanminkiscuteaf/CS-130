import Shape from './Shape';

class LineShape extends Shape {
    constructor ({id, type, top, left, width, height, color, direction}={}) {
        super({id, type, top, left, width, height, color});
        this.direction = direction || 0;
    }

    copy () {
        return new LineShape(this);
    }
}

export default LineShape;
