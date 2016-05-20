
//Function for asynchronous call
function httpGetAsync(theUrl, callback) {

		var xmlHttp = new XMLHttpRequest();
		xmlHttp.onreadystatechange = function() { 
				if (xmlHttp.readyState == 4 && xmlHttp.status == 200){
						callback(xmlHttp.responseText);
				}
		}
		xmlHttp.open("GET", theUrl, true); // true for asynchronous which we want
		xmlHttp.send(null);
		console.log("in fnction");
}

function appendImages(data){
		json = JSON.parse(data);
		var locations = json.locations;
		for(var i = 0; i < locations.length; i++){
				$("#links").append(" <a href='"+locations[i].original+"'><img src='"+locations[i].thumbnail + "' style='height:"+json.mediumHeight+"px; width:"+json.mediumWidth+"px;'></a>")
		}

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

httpGetAsync("http://localhost:3000/images", appendImages);
