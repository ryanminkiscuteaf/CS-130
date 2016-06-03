import Obj from './Obj';
import Shape from './Shape';

let Color = require('./ColorConstants');

class Anchor extends Obj {
   constructor ({id, ref, x, y}={}) {
      var anchor = new Shape({
        type: 'hook',
        top: 0,
        left: 0,
        width: 180,
        height: 180,
        color: Color.ANCHOR
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