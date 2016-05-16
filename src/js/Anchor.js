import Obj from './Obj';

let ANCHOR_COLOR = "#903fd1";

class Anchor extends Obj {
   constructor ({id, ref, x, y}={}) {
      var anchor = {
        type: 'circle',
        top: 0,
        left: 0,
        width: 50,
        height: 50,
        color: ANCHOR_COLOR
      };
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