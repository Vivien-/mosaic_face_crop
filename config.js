var config = {};


//port
config.port = 3000;

//paths
config.options = {
	root: "/home/med/medApps/mosaic/public",
    originals: "/img/originals/",
    thumbnails: "/img/thumbnails/",
    url: "http://localhost:"+config.port
}

module.exports = config;