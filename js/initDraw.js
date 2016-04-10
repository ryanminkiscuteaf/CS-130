
// TODO: store all created rectangles in a collection. gotta keep track of those bad boys!

function initDraw(canvas) {
    var rectangle = {
        x: 0,
        y: 0,
        startX: 0,
        startY: 0
    };

    var rectangles = [];

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

            rectangles.push(element);
            console.log(rectangles);

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
