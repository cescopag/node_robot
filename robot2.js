var SerialPort = require('serialport');
var port = new SerialPort('/dev/tty.arduino-DevB', {
	parser: SerialPort.parsers.readline('\n')
});
var hapi = require('hapi');
var inert = require('inert');
var nes = require('nes');

port.on('open', start);

var motorA, motorB;
var air = 0;

var server = new hapi.Server();
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
			port.write('w');
			reply(200);
		}
	});

	server.route({
		method: 'POST',
		path: '/left',
		handler: function(req,reply) {
			console.log('left');
			port.write('a');
			reply(200);
		}
	});

	server.route({
		method: 'POST',
		path: '/right',
		handler: function(req,reply) {
			console.log('right');
			port.write('d');
			reply(200);
		}
	});

	server.route({
		method: 'POST',
		path: '/reverse',
		handler: function(req,reply) {
			console.log('reverse');
			port.write('s');
			reply(200);
		}
	});

	server.route({
		method: 'POST',
		path: '/stop',
		handler: function(req,reply) {
			console.log('stop');
			port.write('x');
			reply(200);
		}
	});
	
	server.route({
		method: 'POST',
		path: '/auto',
		handler: function(req,reply) {
			console.log('auto');
			port.write('i');
			reply(200);
		}
	});

    server.subscription('/radar');
    server.subscription('/log');

	server.start(function(err){
	    if (err) {
	        throw err;
	    }
	    console.log('Server running at:', server.info.uri);
	    setInterval(function() {
			server.publish('/radar', air);
		}, 500);
	});

});

function start() {

	console.log('Ready!');

	port.on('data', function(data) {
	    //if I'm receiving centimeters, parse them and set air value
	    if (data.indexOf("cm") > 0) {
	        air = parseFloat(data.replace('cm', ''));
	    } else {
    	    //Log messages
	    	console.log(data);
	    	server.publish('/log', message);
	    }
	});

}
