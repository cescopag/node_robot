var SerialPort = require('serialport');

var port = new SerialPort('/dev/tty.arduino-DevB', {
	parser: SerialPort.parsers.readline('\n'),
	baudRate: 57600
});

var hapi = require('hapi');
var inert = require('inert');
var nes = require('nes');
var ready = false;
var ready2 = false;
var air = 0;

var server = new hapi.Server();

port.on('open', start);

server.connection({
	port: 8080,
	routes: { cors: true }
});

server.register([nes, inert], function() {

	server.route({
		path: '/',
		method:'GET',
	    handler: function (request, reply) {
	        reply.file('index2.html');
	    }
	});

    server.route({
		path: '/nes.js',
		method:'GET',
	    handler: function (request, reply) {
	        reply.file('nes.js');
	    }
	});

	server.route({
		method: 'POST',
		path: '/forward',
		handler: function(req,reply) {
			console.log('forward');
			ready && port.write('w');
			reply(200);
		}
	});

	server.route({
		method: 'POST',
		path: '/left',
		handler: function(req,reply) {
			console.log('left');
			ready && port.write('a');
			reply(200);
		}
	});

	server.route({
		method: 'POST',
		path: '/right',
		handler: function(req,reply) {
			console.log('right');
			ready && port.write('d');
			reply(200);
		}
	});

	server.route({
		method: 'POST',
		path: '/reverse',
		handler: function(req,reply) {
			console.log('reverse');
			ready && port.write('s');
			reply(200);
		}
	});

	server.route({
		method: 'POST',
		path: '/stop',
		handler: function(req,reply) {
			console.log('stop');
			ready && port.write('x');
			reply(200);
		}
	});

	server.route({
		method: 'POST',
		path: '/auto',
		handler: function(req,reply) {
			console.log('auto');
			ready && port.write('i');
			reply(200);
		}
	});

    server.subscription('/radar');
    server.subscription('/log');

	server.start(function(err){
		ready2 = true;
	    if (err) {
	        throw err;
	    }
	    console.log('Server running at:', server.info.uri);
	    setInterval(function() {
			ready && port.write('r');
			server.publish('/radar', air);
		}, 250);
	});

});

function start() {

	ready = true;

	console.log('Serial port is Ready!');
	ready2 && server.publish('/log', 'Connected.');

	port.on('data', function(data) {
	    //if I'm receiving centimeters, parse them and set air value
	    if (data.indexOf("cm") > 0) {
	        air = parseFloat(data.replace('cm', ''));
	    } else {
    	    //Log messages
			console.log(data);
	    	ready2 && server.publish('/log', data);
	    }
	});

}
