
var path = getURLParameter('path');
path = typeof path === 'undefined' || path == null ? '/' : path;

var pathThumbnail = "img/thumbnails/" + path;
var pathOriginal = "img/originals/" + path;

//Function for asynchronous call
function httpGetAsync(theUrl, callback) {

	var xmlHttp = new XMLHttpRequest();
	xmlHttp.onreadystatechange = function() { 
		if (xmlHttp.readyState == 4 && xmlHttp.status == 200){
			callback(xmlHttp.responseText);
		}
	}
	xmlHttp.open("POST", theUrl, true); // true for asynchronous which we want
	xmlHttp.send(null);
}

function buildFolders(folders) {
	if(path !== '/') {
		var arrayPath = path.split('/');
		var prevPath = path.replace(arrayPath[arrayPath.length-2]+'/', '');

		$("#folders").append('<span class="btn btn-info btn-lg margin-sides" data-name="'+prevPath+'" id="prevPathFolder"><span data-name="'+prevPath+'" class="glyphicon glyphicon-folder-open"></span>  .. </span>');
		$("#prevPathFolder").on('click', function(e) {
			window.location.href = 'http://localhost:3000/?path='+e.target.getAttribute('data-name');
		});
	}

	for(var i=0; i < folders.length; i++) {
		var safeName = folders[i].replace(/[^A-Z0-9]+/ig, "_");

		$("#folders").append('<span class="delete-folder btn btn-info btn-lg margin-sides" data-name="'+folders[i]+'" id="'+safeName+'"><span data-name="'+folders[i]+'" class="glyphicon glyphicon-folder-open"></span> '+folders[i]+'</span>');
		$("#"+safeName).on('click', function(e) {
			window.location.href = 'http://localhost:3000/?path='+path+e.target.getAttribute('data-name')+'/';
		});
		$("#"+safeName+"::after").on('click', function(e) {
			console.log("delete"); // TODO
			// window.location.href = 'http://localhost:3000/?path='+path+e.target.getAttribute('data-name')+'/';
		});
	}
}


function buildImages(images, height, width) {
	for(var i = 0; i < images.length; i++){
		$("#links").append('<div class="box" data-request="'+pathOriginal+images[i]+'" style="background:url(\''+pathOriginal+images[i]+'\'); width: '+width+'px; height: '+height+'px;"><div class="overlay" ><span class="plus">x</span></div></div>');
	}
	$(".box").on('click', function(e) {
		var p = e.currentTarget.getAttribute('data-request');
		e.currentTarget.style.display = 'none';
		httpGetAsync('/delete?path='+p, function() {});
	});
}

function createView(json) {
	buildFolders(json.directories);
	buildImages(json.files, 150, 150);
}

function appendImages(data){
	json = JSON.parse(data);
	createView(json);
}

function displayImages() {
	document.getElementById('delete-container').style.display = "block";
	document.getElementById('progress-div').style.display = "none";
}


document.getElementById("delete-images").addEventListener("click", displayImages);
httpGetAsync("http://localhost:3000/images?originalsImage=true&path="+path, appendImages);

