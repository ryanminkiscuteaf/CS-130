
// TODO:

BOTTOM = 400;
TOP = 15;
LEFT = 15;
RIGHT = 1000;

function Obj (dom, seed) {
    this.dom = dom;

    var seed = rand(-4, 4);

    this.velocity_x = seed;
    this.velocity_y = seed;
}

Obj.prototype.setTop = function (t) {
    this.dom.style.top = t + "px";
}

Obj.prototype.top = function () {
    return parseInt(this.dom.style.top);
}

Obj.prototype.setLeft = function (l) {
    this.dom.style.left = l + "px";
}

Obj.prototype.left = function () {
    return parseInt(this.dom.style.left);
}

Obj.prototype.right = function () {
    return this.left() + this.width() + this.borderThickness();
}

Obj.prototype.height = function () {
    return parseInt(this.dom.style.height);
}

Obj.prototype.width = function () {
    return parseInt(this.dom.style.width);
}

Obj.prototype.borderThickness = function () {
    return parseInt(this.dom.style.border.split(" ")[0]);
}

Obj.prototype.bottom = function () {
   return this.top() + this.height() + this.borderThickness(); 
}

Obj.prototype.tick = function() {
    var clock = 60;
    window.setInterval(function (context) {
        context.setTop(context.top() + context.velocity_y);
        context.setLeft(context.left() + context.velocity_x);
        
        if (context.bottom() >= BOTTOM || context.top() <= TOP) {
            context.velocity_y *= -1;
        }
        if (context.right() >= RIGHT || context.left() <= LEFT) {
            context.velocity_x *= -1;
        }
    }, clock, this);
}

var objects = [];
function addObject(o) {
    objects.push(o);
    console.log(objects);
}

function initDraw(canvas) {
    var rectangle = {
        x: 0,
        y: 0,
        startX: 0,
        startY: 0
    };


    function setMousePosition(e) {
        var ev = e || window.event; //Moz || IE
        if (ev.pageX) { //Moz
            rectangle.x = ev.pageX + window.pageXOffset;
            rectangle.y = ev.pageY + window.pageYOffset;
        } else if (ev.clientX) { //IE
            rectangle.x = ev.clientX + document.body.scrollLeft;
            rectangle.y = ev.clientY + document.body.scrollTop;
        }
    };

    var element = null;
    canvas.onmousemove = function (e) {
        setMousePosition(e);
        if (element !== null) {
            element.style.width = Math.abs(rectangle.x - rectangle.startX) + 'px';
            element.style.height = Math.abs(rectangle.y - rectangle.startY) + 'px';
            element.style.left = (rectangle.x - rectangle.startX < 0) ? rectangle.x + 'px' : rectangle.startX + 'px';
            element.style.top = (rectangle.y - rectangle.startY < 0) ? rectangle.y + 'px' : rectangle.startY + 'px';
        }
    }

    canvas.onclick = function (e) {
        if (element !== null) {

            var o = new Obj(element);
            o.tick();
            addObject(o);

            element = null;
            canvas.style.cursor = "default";
            console.log("finsihed.");
        } else {
            console.log("begun.");
            rectangle.startX = rectangle.x;
            rectangle.startY = rectangle.y;
            element = document.createElement('div');

            var width = rand(1, 20);
            element.style.border = width + "px solid #" + (Math.random()*0xFFFFFF<<0).toString(16);

            element.className = 'rectangle';
            element.style.left = rectangle.x + 'px';
            element.style.top = rectangle.y + 'px';
            canvas.appendChild(element);
            canvas.style.cursor = "crosshair";
        }
    }
}

function rand(min, max) {
    return Math.random() * (max - min) + min;
}
