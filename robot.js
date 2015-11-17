var five = require('johnny-five');
var board = new five.Board({ port: "/dev/rfcomm0" });
var hapi = require('hapi');
var nes = require('nes');
board.on('ready', start);
var motorA, motorB, servo;
var air = 0;
isMovingForward = false;

var server = new hapi.Server();
server.connection({
	port: 8080,
	routes: { cors: true }
});

server.register([nes,require('inert')], function() {
	
	server.subscription('/radar');

	server.route({
		path: '/',
		method:'GET',
	    handler: function (request, reply) {
	        reply.file('index.html');
	    }
	});

	server.route({
		method: 'POST',
		path: '/forward',
		handler: function(req,reply) {
			console.log('forward');
			motorA && motorA.forward(255);
			motorB && motorB.forward(255);
			isMovingForward = true;
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
			isMovingForward = false;
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
			isMovingForward = false;
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
			isMovingForward = false;
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
			isMovingForward = false;
			reply(200);
		}
	});

	server.start(function(err){
	    if (err) {
	        throw err;
	    }
	    console.log('Server running at:', server.info.uri);
	    setInterval(function() {
			server.broadcast(air);
		}, 250);
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
	
	servo = new five.Servo({
		pin: 10
	});

	var proximity = new five.Proximity({
  		controller: "HCSR04",
  		pin: 7
	});

	proximity.on("data", function() {
		//tween data...
    	air = air + (this.cm - air) * 0.5;
    	var degrees = air / 100 * 180;
    	servo.to(degrees, 250);
    	if (isMovingForward && air < 50) {
			//stop if close to an obstacle
			motorA.stop();
			motorB.stop();
		}
  	});
}

