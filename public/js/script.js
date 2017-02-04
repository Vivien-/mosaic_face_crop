var canvas, context, startX, endX, startY, endY;
var mouseIsDown = 0;

var rois = [];

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

var conf = { 
	"lineWidth": 8,
	"strokeStyle": "#333399",
	"fillStyle": "#3F7FBF"
};

function getURLParameter(name) {
	return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null;
}

//get image path
// var filepath = getURLParameter('file');

var rect = {
	x: getURLParameter('x'), 
	y: getURLParameter('y'),
	w: getURLParameter('w'),
	h: getURLParameter('h') 
};

var rects = JSON.parse(getURLParameter('rects'));

var refreshIntervalId;

function fileSelected() {
	var file = document.getElementById('fileToUpload').files[0];
	if (file) {
		var fileSize = 0;
		if (file.size > 1024 * 1024)
			fileSize = (Math.round(file.size * 100 / (1024 * 1024)) / 100).toString() + 'MB';
		else
			fileSize = (Math.round(file.size * 100 / 1024) / 100).toString() + 'KB';

		document.getElementById('progress-div').style.display = "block";
		document.getElementById('progess-label-upload').innerHTML = file.name + " ("+fileSize+")";
	}
}

function uploadFile() {
	var fd = new FormData();
	fd.append("fileToUpload", document.getElementById('fileToUpload').files[0]);
	var xhr = new XMLHttpRequest();
	xhr.upload.addEventListener("progress", uploadProgress, false);
	xhr.addEventListener("load", uploadComplete, false);
	xhr.addEventListener("error", uploadFailed, false);
	xhr.addEventListener("abort", uploadCanceled, false);
	xhr.open("POST", "/upload");
	xhr.send(fd);
}

function uploadProgress(evt) {
	if (evt.lengthComputable) {
		var percentComplete = Math.round(evt.loaded * 100 / evt.total);
		document.getElementById("progress-upload").setAttribute("value", percentComplete);
		document.getElementById("progess-label-upload").setAttribute("data-value", percentComplete);
		document.getElementById("upload-label").innerHTML = "Uploading file...";
		if(percentComplete >= 100) {
			document.getElementById("extract-msg").style.display = "block";	
			document.getElementById("upload-label").innerHTML = "Uploaded !";
			document.getElementById("upload-label").className = "done";
		}
	} else {
		document.getElementById('progressNumber').innerHTML = 'unable to compute';
	}
}

function uploadComplete(evt) {
	if(evt.target.responseText === 'croping') {
		document.getElementById("upload-label").innerHTML = "Uploaded !";
		document.getElementById("upload-label").className = "done";
		document.getElementById("extract-msg").style.display = "block";
		document.getElementById("extract-msg-span").innerHTML = "Extracting files...";
		refreshIntervalId = setInterval('loadAdvancement()', 500);
	} else {
		document.getElementById('progress-div').style.display = "none";
		document.getElementById('extract-msg').style.display = "none";
		document.getElementById('progress-computing').style.display = "none";

		document.getElementById('crop').style.display = 'block';
		rects = JSON.parse(evt.target.responseText).rects;
		workOnImage(JSON.parse(evt.target.responseText).filepath);
	}
}

function uploadFailed(evt) {
	alert("There was an error attempting to upload the file.");
}

function uploadCanceled(evt) {
	alert("The upload has been canceled by the user or the browser dropped the connection.");
}

function loadAdvancement() {
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			var adv = JSON.parse(this.responseText).percentageAdvancement;
			var curFileArrayName = JSON.parse(this.responseText).currentFile.split('/');
			var curFile = curFileArrayName[curFileArrayName.length-1];
			document.getElementById("progress").setAttribute("value", adv);
			document.getElementById("progess-label").setAttribute("data-value", adv);
			document.getElementById("progess-label").innerHTML = curFile;
			document.getElementById("progress-inner-span").innerHTML = adv + "%";

			if(adv >= "100"){
				clearInterval(refreshIntervalId);
				document.getElementById("extract-msg").innerHTML = "<span class='done'>Extracting done !</span><br><span class='done'>Detecting and croping images done !</span>";		
				return;
			}
			if(adv > 0) {
				document.getElementById("progress-computing").style.display = "block";
				document.getElementById("extract-msg").innerHTML = "<span class='done'>Extracting done !</span><br><span class='pending'>Detecting and croping images...</span>";		
			}
		}
	};
	xhttp.open("GET", "/advancement", true);
	xhttp.send();
}


function workOnImage(filepath) {
	if(filepath != null) {
		image.src = filepath;
		canvas_height = 0;
		canvas_width = 0;
		load();
	}	
} 

var previous = {l: 0, t: 0, w: 0, h: 0};

function setPrevious(l, t, w, h) {
	previous.l = l;
	previous.t = t;
	previous.w = w;
	previous.h = h;
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
		setPrevious(0, 0, 0, 0); // don't delete other rect
		drawSquare(); //update on mouse-up
		addROI(startX, startY, endX - startX, endY - startY);
	}
}

function handleDrag(eve) {
	mouseIsDown = 1;
	setPrevious(0, 0, 0, 0); // don't delete other rect
	var pos = getMousePos(canvas, eve);
	startX = endX = pos.x;
	startY = endY = pos.y;
	drawSquare(); //update
}

function getDistance(mPose, rect) {
	var rPose = {x: rect.left + (rect.w/2), y: rect.top + (rect.h/2)};
	var dx = Math.max(Math.abs(mPose.x - rPose.x) - rect.w / 2, 0);
	var dy = Math.max(Math.abs(mPose.y - rPose.y) - rect.h / 2, 0);
	return dx * dx + dy * dy;
}

function selectClosestRect(eve) {
	var distance = canvas_width * canvas_width + canvas_height * canvas_height;
	var roi = rois[0];
	var pos = getMousePos(canvas, eve);
	var index = -1;
	for(var i = 0; i < rois.length; ++i) {
		var d = getDistance(pos, rois[i]);
		if(d < distance) {
			distance = d;
			roi = rois[i];
			index = i;
		}
	}
	return {"roi": roi, "index": index};
}

function colorZone(x, y, w, h) {
	context.fillStyle = "rgba(0, 0, 255, 0.5)";
	context.rect(x, y, w, h);
	context.fill();
}

function handleSelect(eve) {
	var data = selectClosestRect(eve);
	var roi = data.roi;
	var horizontalMultiplier = 1;
	var verticalMultiplier = 1;
	if(typeof roi == 'undefined') 
		return;

	if(roi.w < 0) {
		horizontalMultiplier = -1;
	} 
	if(roi.h < 0) {
		verticalMultiplier = -1;
	}

	var hOffset = horizontalMultiplier * conf.lineWidth;
	var vOffset = verticalMultiplier * conf.lineWidth;
	context.clearRect(roi.left - hOffset, roi.top-vOffset, roi.w+hOffset*2, roi.h+vOffset*2);
	if(data.index > -1) {
		rois.splice(data.index, 1);
	}
}

function mouseDown(eve) {
	if(eve.ctrlKey) {
		handleSelect(eve);
	} else {
		handleDrag(eve);
	}
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

	context.clearRect(previous.l, previous.t, previous.w, previous.h);
	setPrevious(startX + offsetX-conf.lineWidth, startY + offsetY-conf.lineWidth, width+conf.lineWidth*2, height+conf.lineWidth*2);

	context.lineWidth = conf.lineWidth;
	context.strokeStyle = conf.strokeStyle;
	context.fillStyle = conf.fillStyle;
	context.beginPath();
	context.rect(startX + offsetX, startY + offsetY, width, height);
	context.fill();
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

function addROI(l, t, w, h) {
	var roi = {top: 0, left: 0, w: 0, h: 0, src:"/"};
	roi.src = image.getAttribute("src");
	roi.left = Math.floor(l);
	roi.top = Math.floor(t);
	roi.w = w;
	roi.h = h;
	rois.push(roi);
}

function load() { 
	canvas_width = image.offsetWidth;
	canvas_height = image.offsetHeight;
	if (canvas_height < 100) { 
		setTimeout(load, 5); 
	} else { 
		that_canvas.setAttribute("width", canvas_width);
		that_canvas.setAttribute("height", canvas_height);
		that_canvas.style.width = canvas_width + 'px';
		that_canvas.style.height = canvas_height + 'px';

		context.lineWidth = conf.lineWidth;
		context.strokeStyle = conf.strokeStyle;
		context.fillStyle = conf.fillStyle;

		for(var i = 0; i < rects.length; ++i) {
			context.beginPath();
			context.rect(rects[i].left, rects[i].top, rects[i].width, rects[i].height);
			context.fill();
			addROI(rects[i].left, rects[i].top, rects[i].width, rects[i].height);
			context.stroke();
		}
	} 
} 

init();
