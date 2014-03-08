var assert = require('assert');
	require('../index.js'),
	request = require('request').
	bucket = 'gateopener';
if (process.argv[2] === 'vps'){
/////////////
//API tests//
/////////////

describe('API', function(){
	it('should return valid JSON'); // automatically being tested in other tests
	describe('GET /logs/day/:day', function(){
		it('should return all logs on ":day" day', function(){
			request.get('localhost/logs/day/' + new Date().toISOString();, function(error, response, body){
				var dbLogs = db.getItem(dbName),
					date = new Date().toISOString().match(/(\d{4}-\d+-\d+)T/)[1];
					filteredLogs = _.filter(dbLogs, function(log){
						return log.date.match(new RegExp( '^' + date));
					});
				assert(body.length === filteredLogs.length);
			});
		});
		it('should return 404 if no logs are on ":day" day', function(){
			request.get('localhost/logs/day/' + new Date("3000-01-01");, function(error, response, body){
				assert(response.statusCode == 400);
			});
		});
		it('should return 400 if ":day" is not a valid date in ISO format (yyyy-mm-dd)', function(){
			request.get('localhost/logs/day/yesterday', function(error, response, body){
				assert(response.statusCode == 400);
			});
		});
	});
	describe('GET /logs/range/:start/:finish', function(){
		it('should return all logs between ":start" and ":finish', function(){
			request.get('localhost/logs/range/0/1', function(error, response, body){
				assert(body.length == 2);
			});
			request.get('localhost/logs/range/0/100', function(error, response, body){
				assert(body.length == 101);
			});
		});
		it('should return only the first 1000 if the difference between start and finish is more than 1000', function(){
			request.get('localhost/logs/range/0/1000', function(error, response, body){
				assert(body.length <= 1000);
			});
		});
		it('should return 404 if there are no logs between ":start" and ":finish"', function(){
			request.get('localhost/logs/range/9999999/10000000', function(error, response, body){
				assert(response.statusCode == 404);
			});
		});
		it('should return 400 if ":start" or ":finish" is not a positive integer', function(){
			request.get('localhost/logs/range/-1/1', function(error, response, body){
				assert(response.statusCode == 400);
			});
		});
	});
	describe('GET /logs/from/:id', function(){
		it('should not return more than 1000 logs', function(){
			request.get('localhost/logs/from/-1', function(error, response, body){
				assert(body.length <= 1000);
			});
		});
		it('should return 404 if there are no logs at or after ":id"', function(){
			request.get('localhost/logs/from/9999999', function(error, response, body){
				assert(response.statusCode == 404);
			});
		});
		it('should return 400 if ":id" is not 0 or a positive integer', function(){
			request.get('localhost/logs/from/-1', function(error, response, body){
				assert(response.statusCode == 400);
			});
		});
	});
});

///////////////////
//socket.io tests//
///////////////////

describe('socket.io'){
	it('should call acknowledgement with true when a valid log is submitted', function(){
		io.emit('log', {
			url: 'https://s3.justinty.me/test.jpg',
			date: new Date().toISOString()
		}, function(success){
			assert(success);
		});
	});
	it('should call acknowledgement with false when an invalid log is submitted', function(){
		io.emit('log', {
			url: 'uhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh',
			date: '!!!!!!!!!!!!!!!!!!!!!!!!'
		}, function(success){
			assert(!success);
		});
	});
}

////////////////////////
//individual log tests//
////////////////////////

describe('Log', function(log){
	Logs = db.getItem(dbName);
	it('should contain a valid url of a jpg to my s3 bucket', function(){
		var urlTest = new RegExp('^https?:\/\/' + bucket + '.s3-us-west-2.amazonaws.com\/.*\.jpe?g$|^https?:\/\/s3.justinty.me\/.*\.jpe?g$');
		_.each(Logs, function(log){
			assert(log.url.match(dateTest);
		});
	});
	it('should contain a valid ISO date in iso format (yyyy-mm-ddThh:mm:ss.sssZ)', function(){
		var dateTest = /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)/;
		_.each(Logs, function(log){
			assert(log.date.match(dateTest);
		});
	});
	it('should contain two properties and only two properties', function(){
		_.each(Logs, function(log){
			assert(Object.keys(log).length === 2);
		}
	});
});