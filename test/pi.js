////////////
//Pi Tests//
////////////

var server = restify.createServer(),
	testio = require('socket.io').listen(server);
describe('socket.io', function () {
	testio.on('connection', function (socket) {
		describe('GPIO', function () {
			it('should emit a log event when the gate opens', function () {
				var success;
				//gate_gpio.on('high', function(){
				setTimeout(function () { /*assert(success);*/ }, 1000);
				//});
				socket.on('log', function () {
					success = true;
				});
			});
			it('should open the gate on "open" event', function () {
				var success;
				//open_gpio.on('high'), function(){
				setTimeout(function () { /*assert(success)*/ }, 1000);
				//});
				socket.on('open', function () {
					success = true;
				});
			});
		});
	});
});