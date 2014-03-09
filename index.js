////////////////////
//vps server code///
////////////////////

if (process.argv[2] === 'vps'){
	var port = process.argv[3] || '3300',
		dbName = 'Logs',
		db = require('node-persist'),
		_ = require('underscore')
		restify = require('restify'),
		server = restify.createServer(),
		io = require('socket.io').listen(server),
		bucket = 'gateopener';

	db.init();
	if(!db.getItem(dbName)){
		db.setItem(dbName, []);
	}

	///////////////
	//api methods//
	///////////////

	server.get('/logs/day/:day', function(req, res, next){
		var test = /^(\d{4}-[01]\d-[0-3]\d)$/,
			day = req.params.day || '',
			logs = db.getItem(dbName);
		if(day.match(test)){
			var date = new Date(day).match(/(\d{4}-\d+-\d+)T/)[1];;
			res.send(_.filter(logs, function(log){
				return log.date.match(new RegExp( '^' + date));
			}));
			return next();
		} else { 
			return next(new restify.InvalidArgumentError("Id must be a valid date in ISO format."));
		}
	});

	server.get('/logs/range/:start/:finish', function(req, res, next){
		var test = /^d+$/,
			start = parseInt(req.params.start) || '',
			finish = parseInt(req.params.finish) || '';
		//make sure start and finish are valid
		if(start.match(test) && finish.match(test) && finish > start){
			//if the difference between start and finish are more than 1000, change finish to start+1000
			finish = (finish - start > 1000) ? start + 	1000 : finish;
			res.send(logs.slice(start, finish));
			return next();
		} else { 
			return next(new restify.InvalidArgumentError("Start and finish must be a positive integers, finish must be greater than start.");
		}
	});

	server.get('/logs/from/:id', function(req, res, next){
		var test = /^d+$/,
			id = parseInt(req.params.id) || 0,
			logs = db.getItem(dbName);
		if(id.match(test)){
			res.send(logs.slice(id, 1000 + id));
			return next();
		} else { 
			return next(new restify.InvalidArgumentError("Id must be a positive integer.");
		}
	});

	server.post('/log/', function(req, res, next){
		var log = req.params.log || {};
		if(verifyLog(log)){
			addLog(log);
			res.send(201);
			return next();
		} else {
			return next(new restify.InvalidArgumentError("Log is formatted incorrectly, the url or date are wrong or missing.");
		}
	});

	server.listen(port);

	/////////////
	//socket.io//
	/////////////

	io.sockets.on('connection', function(socket){
		socket.on('open', function(data){
			 io.sockets.in('pi').emit('open', data);
		});
		socket.on('pi', function(){
			//test if authorized
			socket.join('pi');
		});
		socket.on('log', function(data, callback){
			if (verifyLog(data.log /* test if in room */){
				addLog(data.log);
				callback(true);
			} else {
				callback(false);
			}
		});
	});

	function auth(data){
		//bcrypt
	}

	function verifyLog(log){
		if(log.url && log.date && Object.keys(log).length === 2){
			var urlTest = new RegExp('https?:\/\/' + bucket + '.s3-us-west-2.amazonaws.com\/.*\.jpe?g|https?:\/\/s3.justinty.me\/.*\.jpe?g'),
				dateTest = /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)/;
			return(log.date.match(dateTest) && log.url.match(urlTest));
		} else {
			return false;
		}
	}

	function addLog(log) {
		var Logs =  db.getItem(dbName);
		Logs.push(log);
		db.setItem(dbName, Logs);
	}
}

//////////////////
//pi server code//
//////////////////

else if(process.argv[2] === 'pi'){
	var serverAddress = process.argv[3] || 'http://vps.justinty.me',
		io = require('socket.io-client')(serverAddress),
		AWS = require('aws-sdk');
	AWS.config.loadFromPath('./rootkey.json');
	var s3 = new AWS.S3();
	//on gategpio, open gate & take pic, upload, on success send log to vps
} else {
	console.log('Must include server argument: "node index.js [vps (port)|pi (serverAddress)]"');
}