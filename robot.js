var five = require('johnny-five');
var board = new five.Board({ port: "/dev/tty.arduino-DevB" });
var hapi = require('hapi');
var inert = require('inert');
var nes = require('nes');
board.on('ready', start);
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
			motorA && motorA.forward(255);
			motorB && motorB.forward(255);
			reply(200);
		}
	});

	server.route({
		method: 'POST',
		path: '/left',
		handler: function(req,reply) {
			console.log('left');
			motorA && motorA.reverse(128);
			motorB && motorB.forward(128);
			reply(200);
		}
	});

	server.route({
		method: 'POST',
		path: '/right',
		handler: function(req,reply) {
			console.log('right');
			motorA && motorA.forward(128);
			motorB && motorB.reverse(128);
			reply(200);
		}
	});

	server.route({
		method: 'POST',
		path: '/reverse',
		handler: function(req,reply) {
			console.log('reverse');
			motorA && motorA.reverse(255);
			motorB && motorB.reverse(255);
			reply(200);
		}
	});

	server.route({
		method: 'POST',
		path: '/stop',
		handler: function(req,reply) {
			console.log('stop');
			motorA && motorA.stop(0);
			motorB && motorB.stop(0);
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

	motorA = new five.Motor({
		pins:{
			pwm: 6,
			dir: 3,
			cdir: 2
		}
	});

	motorB = new five.Motor({
		pins:{
			pwm: 9,
			dir: 5,
			cdir: 4
		}
	});

	var proximity = new five.Proximity({
  		controller: "HCSR04",
  		pin: 7,
		freq: 250
	});

	proximity.on("data", function() {
		//tween data...
    	air = air + (this.cm - air) * 0.25;
		console.log(air);
  	});
}
