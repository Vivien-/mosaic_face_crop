var canvas, context, startX, endX, startY, endY;
var mouseIsDown = 0;

var roi = {top: 0, left: 0, w: 0, h: 0, src:"/"};

var w = window,
d = document,
e = d.documentElement,
g = d.getElementsByTagName('body')[0],
x = w.innerWidth || e.clientWidth || g.clientWidth,
y = w.innerHeight|| e.clientHeight|| g.clientHeight;

var that_canvas = d.getElementById("canvas");
var image = d.getElementById("image");

var canvas_width = 0;
var canvas_height = 0;

//set image

function getURLParameter(name) {
  return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null;
}

var filepath = getURLParameter('file');

var rect = {x: getURLParameter('x'), 
					 y: getURLParameter('y'),
					 w: getURLParameter('w'),
					 h: getURLParameter('h') };

if(filepath != null) {
		image.src = filepath;
		canvas_height = 0;
		canvas_width = 0;
		load();
}


function init() {
		canvas = document.getElementById("canvas");
		context = canvas.getContext("2d");
		
		canvas.addEventListener("mousedown", mouseDown, false);
		canvas.addEventListener("mousemove", mouseXY, false);
		canvas.addEventListener("mouseup", mouseUp, false);
}

function mouseUp(eve) {
		if (mouseIsDown !== 0) {
				mouseIsDown = 0;
				var pos = getMousePos(canvas, eve);
				endX = pos.x;
				endY = pos.y;
				drawSquare(); //update on mouse-up
		}
}

function mouseDown(eve) {
		mouseIsDown = 1;
		var pos = getMousePos(canvas, eve);
		startX = endX = pos.x;
		startY = endY = pos.y;
		drawSquare(); //update
}

function mouseXY(eve) {
		if (mouseIsDown !== 0) {
				var pos = getMousePos(canvas, eve);
				endX = pos.x;
				endY = pos.y;

				drawSquare();
		}
}

function drawSquare() {
		// creating a square
		var w = endX - startX;
		var h = endY - startY;
		var offsetX = (w < 0) ? w : 0;
		var offsetY = (h < 0) ? h : 0;
		var width = Math.abs(w);
		var height = Math.abs(h);

		context.clearRect(0, 0, canvas.width, canvas.height);
    
		context.beginPath();
		context.rect(startX + offsetX, startY + offsetY, width, height);
		context.fillStyle = "#FFEFA3";
		context.fill();
		setROI(startX, startY, width, height);
		context.lineWidth = 2;
		context.strokeStyle = 'orangered';
		context.stroke();

}

function getMousePos(canvas, evt) {
		var rect = canvas.getBoundingClientRect();
		return {
				x: evt.clientX - rect.left,
				y: evt.clientY - rect.top
		};
}

function getFirstChild(el){
		var firstChild = el.firstChild;
		while(firstChild != null && firstChild.nodeType == 3){ // skip TextNodes
				firstChild = firstChild.nextSibling;
		}
		return firstChild;
}

function setROI(l, t, w, h) {
		roi.src = image.getAttribute("src");
		roi.left = Math.floor(l);
		roi.top = Math.floor(t);
		roi.w = w;
		roi.h = h;
		console.log(roi);
}

function load() { 
		canvas_width = image.offsetWidth;
		canvas_height = image.offsetHeight;
		if (canvas_height == 0) { 
				setTimeout(load, 5); 
		} else { 
				that_canvas.setAttribute("width", canvas_width);
				that_canvas.setAttribute("height", canvas_height);
				that_canvas.style.width = canvas_width + 'px';
				that_canvas.style.height = canvas_height + 'px';
				that_canvas.style.top = 10 + '%';
				that_canvas.style.left = 10 + '%';
				
				context.rect(rect.x, rect.y, rect.w, rect.h);
				context.fillStyle = "#FFEFA3";
				context.fill();
				setROI(rect.x, rect.y, rect.w, rect.h);
				context.lineWidth = 2;
				context.strokeStyle = 'orangered';
				context.stroke();
		} 
} 

init();
load();
