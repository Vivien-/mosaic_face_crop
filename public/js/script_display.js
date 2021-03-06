function getURLParameter(name) {
  return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [null, ''])[1].replace(/\+/g, '%20')) || null;
}

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
			window.location.href = 'http://localhost:3000/mosaic?path='+e.target.getAttribute('data-name');
		});
	}

	for(var i=0; i < folders.length; i++) {
		var safeName = folders[i].replace(/[^A-Z0-9]+/ig, "_");

		$("#folders").append('<span class="btn btn-info btn-lg margin-sides" data-name="'+folders[i]+'" id="'+safeName+'"><span data-name="'+folders[i]+'" class="glyphicon glyphicon-folder-open"></span> '+folders[i]+'</span>');
		$("#"+safeName).on('click', function(e) {
			window.location.href = 'http://localhost:3000/mosaic?path='+path+e.target.getAttribute('data-name')+'/';
		});
	}
}


function buildImages(images, height, width) {
	for(var i = 0; i < images.length; i++){
		$("#links").append(" <a href='"+pathOriginal+images[i].replace(/_[0-9]*.png$/, '') +"'><img src='"+pathThumbnail+images[i] + "' style='height:"+height+"px; width:"+width+"px;'></a>")
	}
}

function createView(json) {
	buildFolders(json.directories);
	buildImages(json.files, json.mediumHeight, json.mediumWidth);
}

function appendImages(data){
	json = JSON.parse(data);
	createView(json);

	//Mosaic stuff
	document.getElementById('links').onclick = function (event) {
		event = event || window.event;
		var target = event.target || event.srcElement,
		link = target.src ? target.parentNode : target,
		options = {index: link, event: event},
		links = this.getElementsByTagName('a');
		blueimp.Gallery(links, options);
	};	
}

httpGetAsync("http://localhost:3000/images?path="+path, appendImages);
