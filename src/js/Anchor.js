import Obj from './Obj';
import Shape from './Shape';

let ANCHOR_COLOR = "#903fd1";

class Anchor extends Obj {
   constructor ({id, ref, x, y}={}) {
      var anchor = new Shape({
        type: 'circle',
        top: 0,
        left: 0,
        width: 50,
        height: 50,
        color: ANCHOR_COLOR
      });
      super({
         id: id,
         ref: ref,
         x: x,
         y: y,
         shapes: [anchor]
      });
   }
}

export default Anchor;