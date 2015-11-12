'use strict';
var five = require('johnny-five');
var board = new five.Board({ port: "/dev/rfcomm0" });
var hapi = require('hapi');
board.on('ready', start);
var motorA, motorB;

var server = new hapi.Server();
server.connection({
	host: 'localhost',
	port: 8080
});

server.route({
	method: 'GET',
	path: '/forward',
	handler: function(req,reply) {
		console.log('forward');
		motorA && motorA.forward(255);
		motorB && motorB.forward(255);
		reply(200);
	}
});

server.route({
	method: 'GET',
	path: '/left',
	handler: function(req,reply) {
		console.log('left');
		motorA && motorA.reverse(128);
		motorB && motorB.forward(128);
		reply(200);
	}
});

server.route({
	method: 'GET',
	path: '/right',
	handler: function(req,reply) {
		console.log('right');
		motorA && motorA.forward(128);
		motorB && motorB.reverse(128);
		reply(200);
	}
});

server.route({
	method: 'GET',
	path: '/reverse',
	handler: function(req,reply) {
		console.log('reverse');
		motorA && motorA.reverse(255);
		motorB && motorB.reverse(255);
		reply(200);
	}
});

server.route({
	method: 'GET',
	path: '/stop',
	handler: function(req,reply) {
		console.log('stop');
		motorA && motorA.stop(0);
		motorB && motorB.stop(0);
		reply(200);
	}
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
}

server.start(function(err){
    if (err) {
        throw err;
    }
    console.log('Server running at:', server.info.uri);
});

