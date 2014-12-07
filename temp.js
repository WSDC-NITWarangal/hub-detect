var net = require('net');
var async = require('async');
var posix = require('posix');
var dcpp = require('./dcppclient');

var base = '172.30.';

function testAddress(addr, callback) {

	var client = net.createConnection({ port:411, host: addr});
	var dcclient;

	client.setTimeout(1000, function() {
		// console.log(addr + ' None present');
		client.destroy();
		callback();
	});

	client.on('data', function(data) {
		// console.log(addr + ' [DC++ Hub Present] Data:' + data);
		dcclient = new dcpp(addr);
		var rep = dcclient.handleCommand(data.toString('ascii'));
		if (rep === "TERMINATE") {
			dcclient.printHubDetails();
			client.destroy();
			callback();
		} else {
			client.write(rep, 'ascii');
		}
	});

	client.on('error', function() {
		client.destroy();
		callback();
	});

	client.on('end', function() {
		console.log("Disconnected from " + addr);
		client.destroy();
		callback();
	});
}

function findAll() {
	var startTime = Date.now();
	var addresses = [];

	for (var i = 100; i < 110; i++) {
		for (var j = 0; j < 256; j++) {
			addresses.push(i.toString() + '.' + j.toString());
		}
	}

	var limits = posix.getrlimit('nofile');
	console.log("File limit: [soft]=" + limits.soft + " [hard]=" + limits.hard);
	console.log("Setting File limit to hard limit..");
	posix.setrlimit('nofile', {soft: limits.hard});
	var maxConcurrentSockets = limits.hard - 15;
	console.log("Scanning " + addresses.length + " addresses");
	console.assert(maxConcurrentSockets > 0, "Insufficient open sockets");

	async.forEachLimit(addresses, maxConcurrentSockets, function(addr, callback) {
		testAddress(base + addr, callback);
	}, function(err) {
		if (!err) {
			console.log("Successfully scanned " + addresses.length + " addresses. \nTime taken: " + (Date.now() - startTime)/1000 + " seconds.\nSleeping...");
		}
	});
}

findAll();

setInterval(findAll, 6000);