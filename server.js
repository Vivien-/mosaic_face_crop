var express = require('express');   //express web server 
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
const fs = require('fs');
var easyimg = require('easyimage');    //for image manipulation
var multer = require('multer');
var exec = require('child_process').execFile;
var sizeOf = require('image-size');

var storage = multer.diskStorage({
		destination: function (req, file, cb) {
				cb(null, options.root+options.originals)
		},
		filename: function (req, file, cb) {
				var format = file.mimetype.split('/')[1];
				cb(null, file.fieldname + '-' + Date.now() + '.' + format)
		}
})

var options = {
    root: "public",
    url: "http://localhost:3000",
		originals: "/img/originals/",
		thumbnails: "/img/thumbnails/"
};

app.use(express.static('public'));
app.use(multer({ storage: storage }).single('pic'));

app.get('/', function(rq, res) {
		res.sendFile("html/index.html", options);
});

app.get('/mosaic', function(req, res){
		res.sendFile("html/display.html", options);
});

app.post('/upload', function(req, res) {
		if(typeof req.file === 'undefined')
				res.redirect('/');
		else {
				exec('./get_roi', [options.root + options.originals + req.file.filename],function(err, data) {
						var rectsStr = "&rects=" + data;
						res.redirect('/?file=' + options.originals + req.file.filename + rectsStr);
				});
		}
});

app.post('/crop', function(req, res){
		var data = req.body;
		
		var cropImg = function(w, h, left, top, index) {
				easyimg.crop({
						src: options.root+options.originals+filename, 
						cropwidth: w,
						cropheight: h,
						width: w,
						height: h,
						x: left, 
						y: top,
						gravity: 'NorthWest',
						fill: true,
						ignoreAspectRatio: true,
						dst: options.root+options.thumbnails+filename + "_" +index + ".png"
				}).then(function (file) {
						file.should.be.a('object');
						file.should.have.property('width');
						file.width.should.be.equal(w);
						file.should.have.property('height');
						file.width.should.be.equal(h);
						file.name.should.be.equal(filename);
				}, function (err) {
						console.log(err);
				});
		}

		var filename = data[0].src.replace(/^.*[\\\/]/, '');
		for(var i = 0; i < data.length; ++i) {
				var cur = data[i];
				cropImg(cur.w, cur.h, cur.left, cur.top, i);
		}
		
		options.uploaded = true;
		res.redirect('/mosaic');
});

app.get('/images', function (req, res) {
		var thumbnails = fs.readdirSync(options.root+options.thumbnails);
		var originals = fs.readdirSync(options.root+options.originals);
		var jsonResponse = {locations:[], mediumHeight:0, mediumWidth:0};
		var mediumHeight = 0;
		var mediumWidth = 0;
		if(originals != "undefined" && thumbnails != "undefined"){
				for(var i = 1; i < thumbnails.length; i++){
						var fname = thumbnails[i].substring(0, thumbnails[i].length-4);
						jsonResponse.locations.push({
								thumbnail:  options.url+options.thumbnails+thumbnails[i],
								original:  options.url+options.originals+fname
						});
						var dimensions = sizeOf(options.root+options.thumbnails+thumbnails[i]);
						mediumHeight += dimensions.height;
						mediumWidth += dimensions.width;
				}
				jsonResponse.mediumHeight = mediumHeight/thumbnails.length;
				jsonResponse.mediumWidth = mediumWidth/thumbnails.length;
		}
		res.send(jsonResponse);
});

app.listen(3000, function () {
		console.log('mosaic app listening on port 3000!');
});
