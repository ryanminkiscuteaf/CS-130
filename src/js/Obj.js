// TODO: deprecate this by delegation on Anchor

import Shape from './Shape';

let ANCHOR_COLOR = "#903fd1";

class Obj {
    constructor ({id, ref, x, y, shapes, width, height, children}={}) {
        this.width = width || 180;
        this.height = height || 180;
        this.children = children || [];
        this.id = id;
        this.ref = ref;
        this.x = x;
        this.y = y;
        this.shapes = shapes;

        this.getCollision = this.getCollision.bind(this);
    }

    copy () {
        return new Obj({
            id: this.id,
            ref: this.ref,
            width: this.width,
            height: this.height,
            x: this.x,
            y: this.y,
            shapes: this.shapes.map(shape => shape.copy()),
            children: this.children.map(this.copy)
        });
    }
    
    right () {
        return this.x
            + Math.max(...this.shapes.map(shape => shape.left + shape.width));
    }
    
    bottom () {
        return this.y
            + Math.max(...this.shapes.map(shape => shape.top + shape.height));
    }

    inBounds(point) {
        var bounds =  {
            left : this.x,
            top : this.y,
            right : this.right(),
            bottom : this.bottom()
        };
        return ((point.x > bounds.left)
            && (point.x < bounds.right)
            && (point.y > bounds.top)
            && (point.y < bounds.bottom));
    }
    
    // TODO: getCollision returns parent and anchor coordinates
    getCollision (candidates) {
        
        // didCollide() is a helper for getCollision
        var newOrigin = null;
        var didCollide = function (candidate) {
            // get shapes that are anchors
            var anchors = candidate.shapes.filter(shape => shape.color === ANCHOR_COLOR);

            // get absolute coordinates for anchors
            var coordinates = anchors.map(anchor => ({x: anchor.left + candidate.x, y: anchor.top + candidate.y}));

            // check to see if any of candidate's anchors are in obj's bounding rectangle
            for (let coordinate of coordinates) {
                if (this.inBounds(coordinate)) {
                    newOrigin = {x: coordinate.x - candidate.x, y: coordinate.y - candidate.y};
                    return true;
                }
            }
            return false;
        }.bind(this);
        
        if (candidates.length === 0) {
            return {
                collidee: null,
                origin: null
            }
        }
        var collision = candidates.find(didCollide);
        return collision
            ? {collidee: collision, origin: newOrigin}
            : this.getCollision([].concat(...candidates.map(c => c.children)));
    }

    getFamily() {
        return (this.children.length === 0)
            ? [this]
            : [this].concat(...this.children.map(c => c.getFamily()));
    }
    
    // TODO: refactor [].concat(...arrs) pattern to a merge() function
}

export default Obj;
