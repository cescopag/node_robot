var five = require('johnny-five');
var board = new five.Board({ port: "/dev/tty.arduino-DevB" });
var hapi = require('hapi');
var inert = require('inert');
var nes = require('nes');
var motorA, motorB;
var air = 0;
var obstacle = false;
var direction = 'stop';
var server = new hapi.Server();

board.on('ready', start);

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
		    if (obstacle) {
		        motorA.stop(0);
		        motorB.stop(0);
		        console.log('obstacle');
		        return reply(200);
		    }
			console.log('forward');
			motorA && motorA.forward(255);
			motorB && motorB.forward(255);
			reply(200);
			direction = 'forward';
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
			direction = 'left';
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
			direction = 'right';
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
			direction = 'reverse';
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
			direction = 'stop';
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
		freq: 200
	});

	proximity.on("data", function() {
		//tween data...
    	air = this.cm;
		if (air < 60 && direction == 'forward') {
		    console.log('stopping due to obstacle');
	    	motorA.stop(0);
    		motorB.stop(0);
            obstacle = true;
		} else {
		    obstacle = false;
		}
  	});
}
