var SerialPort = require('serialport');
// var port = new SerialPort('/dev/tty.arduino-DevB', {
// 	parser: SerialPort.parsers.raw
// });
var port = new SerialPort('/dev/cu.usbmodem1431', {
	parser: SerialPort.parsers.raw
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
	        reply.file('index.html');
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
			port.write(0);
			reply(200);
		}
	});

	server.route({
		method: 'POST',
		path: '/left',
		handler: function(req,reply) {
			console.log('left');
			port.write(2);
			reply(200);
		}
	});

	server.route({
		method: 'POST',
		path: '/right',
		handler: function(req,reply) {
			console.log('right');
			port.write(3);
			reply(200);
		}
	});

	server.route({
		method: 'POST',
		path: '/reverse',
		handler: function(req,reply) {
			console.log('reverse');
			port.write(1);
			reply(200);
		}
	});

	server.route({
		method: 'POST',
		path: '/stop',
		handler: function(req,reply) {
			console.log('stop');
			port.write(4);
			reply(200);
		}
	});

    server.subscription('/radar');

	server.start(function(err){
	    if (err) {
	        throw err;
	    }
	    console.log('Server running at:', server.info.uri);
	    setInterval(function() {
			server.publish('/radar', air);
		}, 1000);
	});

});

function start() {

	console.log('Ready!');

	port.on('data', function(data) {
		air = data.readInt8(0);
		console.log(data.readInt8(0));
	});

	// motorA = new five.Motor({
	// 	pins:{
	// 		pwm: 6,
	// 		dir: 3,
	// 		cdir: 2
	// 	}
	// });
	//
	// motorB = new five.Motor({
	// 	pins:{
	// 		pwm: 9,
	// 		dir: 5,
	// 		cdir: 4
	// 	}
	// });
/*
	var proximity = new five.Proximity({
  		controller: "HCSR04",
  		pin: 7
	});

	proximity.on("data", function() {
		//tween data...
    	air = air + (this.cm - air) * 0.1;
  	});
  */
}
