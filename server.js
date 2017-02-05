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
var tar = require('tar-fs');
var path = require('path');
var request = require('request');


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

var advancement = {'percentageAdvancement': 0, 'currentFile': ''};

var walk = function(dir, done) {
	var results = [];
	fs.readdir(dir, function(err, list) {
		if (err) return done(err);
		var pending = list.length;
		if (!pending) return done(null, results);
		list.forEach(function(file) {
			file = path.resolve(dir, file);
			fs.stat(file, function(err, stat) {
				if (stat && stat.isDirectory()) {
					walk(file, function(err, res) {
						results = results.concat(res);
						if (!--pending) done(null, results);
					});
				} else {
					results.push(file);
					if (!--pending) done(null, results);
				}
			});
		});
	});
};

var cropImgs = function(data, callback) {
	// var filename = data[0].src.replace(/^.*[\\\/]/, '');
	var filename = data[0].src;
	var dest = filename.replace(options.originals, options.thumbnails);
	console.log("Croping image " + filename + " to " + dest);	
	var cropImg = function(w, h, left, top, index) {
		easyimg.crop({
			src: filename, 
			cropwidth: w,
			cropheight: h,
			width: w,
			height: h,
			x: left, 
			y: top,
			gravity: 'NorthWest',
			fill: true,
			ignoreAspectRatio: true,
			dst: dest + "_" +index + ".png"
		}).then(function (file) {
			file.should.be.a('object');
			file.should.have.property('width');
			file.width.should.be.equal(w);
			file.should.have.property('height');
			file.width.should.be.equal(h);
			// file.name.should.be.equal(filename);
		}, function (err) {
			console.log(err);
		});
	}
	for(var i = 0; i < data.length; ++i) {
		var cur = data[i];
		cropImg(cur.width, cur.height, cur.left, cur.top, i);
	}
	callback();
}

app.use(express.static('public'));
app.use(multer({ storage: storage }).single('fileToUpload'));

app.get('/', function(rq, res) {
	res.sendFile("html/index.html", options);
});

app.get('/mosaic', function(req, res){
	res.sendFile("html/display.html", options);
});

app.post('/upload', function(req, res) {
	var threshold = 0;
	if(typeof req.body.threshold !== 'undefined')
		threshold = req.body.threshold;

	if(typeof req.file === 'undefined'){
		res.redirect('/');
	} else {
		if(req.file.path.endsWith('tar')) {
			var dirName = options.root + options.originals;
			dirName += typeof req.file.originalname != 'undefined' ? req.file.originalname.split('.')[0] : 'default';

			if (!fs.existsSync(dirName)){
				fs.mkdirSync(dirName);
			}

			fs.createReadStream(req.file.path).pipe(tar.extract(options.root + options.originals).on('finish', 
				function() {
					fs.unlinkSync(req.file.path);

					var detectAndCrop = function(images, index) {
						exec('./get_roi', [images[index], threshold],function(err, data) {
							var curData = JSON.parse(data.split('|')[0]);
							if(typeof curData[0] != 'undefined')
								curData[0].src = data.split('|')[1].slice(0,-1);
							cropImgs(curData, function() {
								advancement.percentageAdvancement = index * 100 / images.length;
								advancement.currentFile = curData[0].src;	
								index++;
								if(index < images.length) {
									detectAndCrop(images, index);
								}
							});
						});
					}
					res.send('croping');

					walk(dirName, function(err, results) {
						detectAndCrop(results, 0);
						// var nDone = 1;
						// if (err) throw err;
						// for(var i=0; i < results.length; i++) {
						// 	exec('./get_roi', [results[i], threshold],function(err, data) {
						// 		var curData = JSON.parse(data.split('|')[0]);
						// 		if(typeof curData[0] != 'undefined')
						// 			curData[0].src = data.split('|')[1].slice(0,-1);
						// 		cropImg(curData);
						// 		advancement.percentageAdvancement = Math.floor(nDone * 100 / results.length);
						// 		nDone++;
						// 		advancement.currentFile = curData[0].src;
						// 	});
						// }
					});
					console.log("Detecting and croping");
				})
			);
		} else {
			exec('./get_roi', [options.root + options.originals + req.file.filename, threshold],function(err, data) {
				var curData = data.split('|')[0];
				var rectsStr = curData;
				res.send('{"filepath":"' + options.originals + req.file.filename + '", "rects":' + rectsStr+'}');

			});
		}
		
	}
});

app.get('/advancement', function(req, res) {
	res.send(advancement);
	if(advancement.percentageAdvancement >=100) {
		advancement.percentageAdvancement = 0;
		advancement.currentFile = "";
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
	// res.redirect('/mosaic');
});

app.post('/images', function (req, res) {
	var _path = typeof req.query.path === 'undefined' || req.query.path === 'null' || req.query.path == null ? '' : req.query.path;
	if(_path.startsWith('/')) {
		_path = _path.substring(1);
	}

	var jsonResponse = {locations:[], mediumHeight:0, mediumWidth:0};
	var mediumHeight = 0;
	var mediumWidth = 0;

	var path = options.root+options.thumbnails + _path;


	walk(path, function(err, results) {
		results = results.sort();
		if (err) { console.error(err); res.send(jsonResponse); return; }
		for(var i = 1; i < results.length; i++){
			var curRes = results[i].split(path)[1];
			var fname = curRes.replace(options.thumbnails, options.originals).slice(0, curRes.lastIndexOf('_'));
			jsonResponse.locations.push({
				thumbnail: curRes,
				original: fname
			});
			var dimensions = sizeOf(results[i]);
			mediumHeight += dimensions.height;
			mediumWidth += dimensions.width;
		}

		jsonResponse.mediumHeight = mediumHeight/jsonResponse.locations.length;
		jsonResponse.mediumWidth = mediumWidth/jsonResponse.locations.length;
		res.send(jsonResponse);
	});
});

app.listen(3000, function () {
	console.log('mosaic app listening on port 3000!');
});
