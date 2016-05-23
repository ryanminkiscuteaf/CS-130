import Shape from './Shape';

class NumberShape extends Shape {
    constructor ({id, type, top, left, width, height, color, value}={}) {
        super({id, type, top, left, width, height, color});
        this.value = value || 7;
    }

    copy () {
        return new NumberShape(this);
    }
}

export default NumberShape;
