var net = require('net');
var querystring = require('querystring');
var http = require('http');
var dcpp = require('./dcppclient');
var base = '172.30.';
var count = 0;
// contain main hub list array 
var hubs = new Array();

function testAddress(addr, port) {
    var client = new net.Socket();
    var dcclient;
    client.connect(port, addr);
    // client.setTimeout(1000, function() {
    // 	console.log(addr + ' None present');
    // 	client.destroy();
    // 	// callback();
    // });
    client.on('connect', function() {
        console.log("DC++ Hub (" + port + ") is running on " + addr);
        // console.log("Receiving data ...");
    });

    client.on('data', function(data) {
        // console.log(addr + ' [DC++ Hub Present] Data:' + data);
        dcclient = new dcpp(addr);
        var rep = dcclient.handleCommand(data.toString('ascii'));
        if (rep === "TERMINATE") {
            //dcclient.printHubDetails();
            hubslist(dcclient.getHub());
            client.destroy();
            // callback();
        } else {
            client.write(rep, 'ascii');
        }
    });

    client.on('error', function() {
        client.destroy();
        // callback();
    });

    client.on('end', function() {
        console.log("Disconnected from " + addr);
        client.destroy();
        // callback();
    });
}

function hubslist(item) {
    if (item != "" && item != undefined) {
        // console.log(item);
        hubs.push(item);
    }
}

function update_hubs_database(data) {
    var qs = JSON.stringify(data.content);
    // console.log(qs);
    qs = '[["token":"'+data.token+'"],'+qs+']';
    console.log(qs);
    qs = qs.toString()
    // return;
    var qslength = qs.length;
    console.log(qs);
    var options = {
        hostname: "172.20.0.4",
        port: 80,
        path: "/student_beta/apps/update_hubs",
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': qslength
        }
    };

    var buffer = "";
    var req = http.request(options, function(res) {
        res.on('data', function(chunk) {
            buffer += chunk;
        });
        res.on('end', function() {
            console.log(buffer);
        });
    });
    req.write(qs);
    req.end();
}



function findAll() {
    count = 0;
    // hubs = new Arrays();
    var startTime = Date.now();
    var addresses = [];

    for (var i = 100; i < 110; i++) {
        for (var j = 0; j < 256; j++) {
            addresses.push(i.toString() + '.' + j.toString());
        }
    }
    // var test = '106.182';
    // addresses.push(test.toString());
    console.log("Scanning " + addresses.length + " addresses");
    for (var i = 0; i < addresses.length; i++) {
        testAddress(base + addresses[i], 411);
    }
    // console.log(hubs);
     var data = {};
    data['token'] = 'rajakiaayegibarat';
    data['content'] = hubs;
   update_hubs_database(data);
    hubs = new Array();
   
}

findAll();


setInterval(findAll, 10000);