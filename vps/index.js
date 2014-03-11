////////////////////
//vps server code///
////////////////////

var port = process.argv[2] || '80',
	dbName = 'Logs',
	db = require('node-persist'),
	bcrypt = require('bcrypt'),
	_ = require('underscore'),
	restify = require('restify'),
	server = restify.createServer(),
	io = require('socket.io').listen(server, {
		log: false
	}),
	bucket = 'gateopener';

db.init();

if (!db.getItem(dbName)) {
	db.setItem(dbName, []);
}

///////////////
//api methods//
///////////////

server.get('/logs/day/:day', function (req, res, next) {
	var test = /^(\d{4}-[01]\d-[0-3]\d)$/,
		day = req.params.day || '',
		logs = db.getItem(dbName);
	if (day.match(test)) {
		var date = new Date(day).toISOString().match(/(\d{4}-\d+-\d+)T/)[1];
		logs = _.filter(logs, function (log) {
			return log.date.match(new RegExp('^' + date));
		});
		if (logs.length >= 1) {
			res.send(logs);
			return next();
		} else {
			return next(new restify.ResourceNotFoundError());
		}
	} else {
		return next(new restify.InvalidArgumentError("Id must be a valid date in ISO format."));
	}
});

server.get('/logs/range/:start/:finish', function (req, res, next) {
	var test = /^\d+$/,
		start = req.params.start || '',
		finish = req.params.finish || '',
		logs = logs = db.getItem(dbName);
	//make sure start and finish are valid
	if (start.match(test) && finish.match(test) && parseInt(finish) > parseInt(start)) {
		//if the difference between start and finish are more than 1000, change finish to start+1000
		finish = (finish - start > 1000) ? start + 1000 : finish;

		logs = logs.slice(start, finish);
		if (logs.length >= 1) {
			res.send(logs);
			return next();
		} else {
			return next(new restify.ResourceNotFoundError());
		}
	} else {
		return next(new restify.InvalidArgumentError("Start and finish must be a positive integers, finish must be greater than start."));
	}
});

server.get('/logs/from/:id', function (req, res, next) {
	var test = /^\d+$/,
		id = req.params.id || 0,
		logs = db.getItem(dbName);
	if (id.match(test)) {
		logs = logs.slice(id, 1000 + id);
		if (logs.length >= 1) {
			res.send(logs);
			return next();
		} else {
			return next(new restify.ResourceNotFoundError());
		}
	} else {
		return next(new restify.InvalidArgumentError("Id must be a positive integer."));
	}
});

// server.post('/log/', function (req, res, next) {
// 	var log = req.params.log || {};
// 	if (verifyLog(log)) {
// 		addLog(log);
// 		res.send(201);
// 		return next();
// 	} else {
// 		return next(new restify.InvalidArgumentError("Log is formatted incorrectly, the url or date are wrong or missing."));
// 	}
// });

server.listen(port);

/////////////
//socket.io//
/////////////

io.sockets.on('connection', function (socket) {
	socket.on('open', function (data) {
		io.sockets. in ('pi').emit('open', data);
	});
	socket.on('pi', function (password) {
		auth({
			username: 'pi',
			password: password
		}, function (res) {
			if (res) {
				socket.join('pi');
			} else {
				socket.emit('error', 'wrong credentials');
			}
		});
	});
	socket.on('log', function (data, callback) {
		if (verifyLog(data)) {
			addLog(data);
			callback(true);
		} else {
			callback(false);
		}
	});
});

//takes data as {username: username, password:passwordToTest}
function auth(data, callback) {
	var users = db.getItem('users'),
		user = users[data.username];
	if (user) {
		bcrypt.compare(data.password, user.hash, function (err, res) {
			callback(res);
		});
	} else {
		return false;
	}
}

function verifyLog(log) {
	console.log(log);
	if (log && log.url && log.date && Object.keys(log).length === 2) {
		var urlTest = new RegExp('https?://' + bucket + '.s3-us-west-2.amazonaws.com/.*.jpe?g|https?://s3.justinty.me/.*.jpe?g'),
			dateTest = /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)/;
		return (log.date.match(dateTest) && log.url.match(urlTest));
	} else {
		return false;
	}
}

function addLog(log) {
	var Logs = db.getItem(dbName);
	Logs.push(log);
	db.setItem(dbName, Logs);
}