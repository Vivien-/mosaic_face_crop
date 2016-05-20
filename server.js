var express = require('express');   //express web server 
var app = express();
const fs = require('fs');
var easyimg = require('easyimage');    //for image manipulation
var busboy = require('connect-busboy'); //middleware for form/file upload
var multer = require('multer');

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, options.root+options.originals)
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + '.png')
  }
})

var options = {
    root: "/home/vivien/olebreton/drawable/public",
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
		else
				res.redirect('/?file=' + options.originals + req.file.filename);
});

app.get('/crop', function(req, res){
		var filename = req.query.src.replace(/^.*[\\\/]/, '');
		easyimg.crop({
				src: options.root+options.originals+filename, 
				cropwidth: req.query.w,
				cropheight: req.query.h,
				width: req.query.w,
				height: req.query.h,
				x: req.query.left, 
				y: req.query.top,
				gravity: 'NorthWest',
				fill: true,
				ignoreAspectRatio: true,
				dst: options.root+options.thumbnails+filename
		}).then(function (file) {
        file.should.be.a('object');
        file.should.have.property('width');
        file.width.should.be.equal(req.query.w);
        file.should.have.property('height');
        file.width.should.be.equal(req.query.h);
        file.name.should.be.equal(filename);
    }, function (err) {
				console.log(err);
		});
		
		options.uploaded = true;
		res.redirect('/mosaic');
});

app.get('/images', function (req, res) {
		var originals = fs.readdirSync(options.root+options.originals);
		var thumbnails = fs.readdirSync(options.root+options.thumbnails);
		var jsonResponse = {locations:[]};
		if(originals != "undefined" && thumbnails != "undefined"){
				for(var i = 0; i < thumbnails.length; i++){
						jsonResponse.locations.push({
								thumbnail: options.url+options.thumbnails+thumbnails[i],
								original: options.url+options.originals+thumbnails[i]
						});
				}
		}
		res.send(jsonResponse);
});

app.listen(3000, function () {
		console.log('mosaic app listening on port 3000!');
});
