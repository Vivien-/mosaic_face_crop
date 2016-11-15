var w = window,
d = document,
e = d.documentElement,
g = d.getElementsByTagName('body')[0],
x = w.innerWidth || e.clientWidth || g.clientWidth,
y = w.innerHeight|| e.clientHeight|| g.clientHeight;

var send_crop = d.getElementById("crop");

send_crop.addEventListener("click", function(){
		showMessage("croping", ["error", "croped"], "info");
		post("/crop", rois, "post");
});

function showMessage(idShow, idsHide, level) {
		document.getElementById(idShow).className = 'show';
		document.getElementById(idShow).className += " " + level;
		for(var i = 0; i < idsHide.length; ++i) {
				if(typeof document.getElementById(idsHide[i]) != null) {
						document.getElementById(idsHide[i]).className = 'hide';
				}
		}
}


function post(path, params, method) {
    method = method || "get"; // Set method to get by default
		var xmlhttp = new XMLHttpRequest();
		xmlhttp.open(method, path);
		xmlhttp.setRequestHeader("Content-type", "application/json");
		xmlhttp.onreadystatechange = function() {
				if (xmlhttp.readyState == XMLHttpRequest.DONE) {
						if(xmlhttp.status == 200){
								showMessage("croped", ["croping", "error"], "success");
						} else {
								showMessage("error", ["croping", "croped"], "error");
								document.getElementById(idsHide[i]).innerHTML = xmlhttp.statusText ;
						}
				}
		}
		xmlhttp.send(JSON.stringify(params));
}
