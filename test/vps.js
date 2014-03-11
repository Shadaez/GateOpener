var assert = require('assert'),
	mocha = require('mocha'),
	request = require('request'),
	db = require('node-persist'),
	_ = require('underscore'),
	bucket = 'gateopener',
	dbName = 'Logs',
	io = require('socket.io-client').connect('localhost');

db.init();

/////////////
//vps tests//
/////////////

/////////////
//API tests//
/////////////

describe('API', function () {
	it('should return valid JSON'); // automatically being tested in other tests
	describe('GET /logs/day/:day', function () {
		it('should return all logs on ":day" day', function (done) {
			request('http://localhost/logs/day/2014-03-10', function (error, response, body) {
				var dbLogs = db.getItem(dbName),
					date = new Date().toISOString().match(/(\d{4}-\d+-\d+)T/)[1];
				filteredLogs = _.filter(dbLogs, function (log) {
					return log.date.match(new RegExp('^' + date));
				});
				assert((JSON.parse(body).length == filteredLogs.length) || response.statusCode == 404);
				done();
			});
		});
		it('should return 404 if no logs are on ":day" day', function (done) {
			request.get('http://localhost/logs/day/3000-01-01', function (error, response, body) {
				assert(response.statusCode == 404);
				done();
			});
		});
		it('should return 409 if ":day" is not a valid date in ISO format (yyyy-mm-dd)', function (done) {
			request.get('http://localhost/logs/day/yesterday', function (error, response, body) {
				assert(response.statusCode == 409);
				done();
			});
		});
	});
	describe('GET /logs/range/:start/:finish', function () {
		it('should return all logs between ":start" and ":finish', function (done) {
			request.get('http://localhost/logs/range/0/1', function (error, response, body) {
				assert((JSON.parse(body).length == 2) || response.statusCode == 404);
				done();
			});
		});
		it('should return only the first 1000 if the difference between ":start" and ":finish" is more than 1000', function (done) {
			request.get('http://localhost/logs/range/0/1000', function (error, response, body) {
				assert(body.length <= 1000);
				done();
			});
		});
		it('should return 404 if there are no logs between ":start" and ":finish"', function (done) {
			request.get('http://localhost/logs/range/9999999/10000000', function (error, response, body) {
				assert(response.statusCode == 404);
				done();
			});
		});
		it('should return 409 if ":start" or ":finish" is not a positive integer', function (done) {
			request.get('http://localhost/logs/range/-1/1', function (error, response, body) {
				console.log(response.statusCode);
				assert(response.statusCode == 409);
				done();
			});
		});
	});
	describe('GET /logs/from/:id', function () {
		it('should not return more than 1000 logs', function (done) {
			request.get('http://localhost/logs/from/-1', function (error, response, body) {
				assert(body.length <= 1000);
				done();
			});
		});
		it('should return 404 if there are no logs at or after ":id"', function (done) {
			request.get('http://localhost/logs/from/9999999', function (error, response, body) {
				assert(response.statusCode == 404);
				done();
			});
		});
		it('should return 409 if ":id" is not 0 or a positive integer', function (done) {
			request.get('http://localhost/logs/from/-1', function (error, response, body) {
				assert(response.statusCode == 409);
				done();
			});
		});
	});
});

///////////////////
//socket.io tests//
///////////////////

describe('socket.io', function () {
	it('should call acknowledgement with true when a valid log is submitted', function (done) {
		io.emit('log', {
			url: 'https://s3.justinty.me/test.jpg',
			date: new Date().toISOString()
		}, function (success) {
			assert(success);
			done();
		});
	});
	it('should call acknowledgement with false when an invalid log is submitted', function (done) {
		io.emit('log', {
			url: 'uhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh',
			date: '!!!!!!!!!!!!!!!!!!!!!!!!'
		}, function (success) {
			assert(!success);
			done();
		});
	});
});

////////////////////////
//individual log tests//
////////////////////////

describe('Log', function () {
	Logs = db.getItem(dbName);
	it('should contain a valid url of a jpg to my s3 bucket', function () {
		var urlTest = new RegExp('^https?://' + bucket + '.s3-us-west-2.amazonaws.com/.*.jpe?g$|^https?://s3.justinty.me/.*.jpe?g$');
		_.each(Logs, function (log) {
			assert(log.url.match(dateTest));
		});
	});
	it('should contain a valid ISO date in iso format (yyyy-mm-ddThh:mm:ss.sssZ)', function () {
		var dateTest = /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)/;
		_.each(Logs, function (log) {
			assert(log.date.match(dateTest));
		});
	});
	it('should contain two properties and only two properties', function () {
		_.each(Logs, function (log) {
			assert(Object.keys(log).length === 2);
		});
	});
});