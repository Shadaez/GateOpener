//////////////////
//pi server code//
//////////////////

var serverAddress = process.argv[3] || 'http://vps.justinty.me',
	io = require('socket.io-client').connect(serverAddress),
	AWS = require('aws-sdk');
//AWS.config.loadFromPath('./rootkey.json');
var s3 = new AWS.S3();
//on gategpio, open gate & take pic, upload, on success send log to vps