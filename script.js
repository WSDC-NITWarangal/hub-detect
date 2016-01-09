var net = require('net');
var querystring = require('querystring');
var http = require('http');

var dcpp = require('./dcppclient');
//The first to numbers of IP address
var base = '127.0.';
var count = 0;
// contain main hub list array 
var hubs = new Array();

function testAddress(addr, port) {
    var client = new net.Socket();
    var dcclient;
    client.connect(port, addr);
    
    client.on('connect', function() {
        console.log("DC++ Hub (" + port + ") is running on " + addr);  
        console.log("Receiving data ...");
    });

    client.on('data', function(data) {
        dcclient = new dcpp(addr);
        var rep = dcclient.handleCommand(data.toString('ascii'));
        if (rep === "TERMINATE") {
            hubslist(dcclient.getHub());
            client.destroy();
        } else {
            client.write(rep, 'ascii');
        }
    });

    client.on('error', function() {
        client.destroy();
    });

    client.on('end', function() {
        console.log("Disconnected from " + addr);
        client.destroy();
    });
}

function hubslist(item) {
    if (item != "" && item != undefined) {
        hubs.push(item);
    }
}
/* @Kranthi Kiran */
var mysql=require('mysql');
var connection=mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'<password-here>',
    database:'<database_name_here>'
});

connection.connect();
function update_hubs_database(data) {
    var qs = JSON.stringify(data.content);
    var t = JSON.parse(qs);
    qs = '[["token":"'+data.token+'"],'+qs+']';
    console.log(t);
    var query1 = connection.query("TRUNCATE TABLE hubs");
    query1=connection.query("CREATE TABLE IF NOT EXISTS `hubs` (`id` int(11) NOT NULL,`name` text NOT NULL,`users` text NOT NULL,`uptime` text NOT NULL,`address` varchar(16) NOT NULL,`software` varchar(256) NOT NULL) ENGINE=InnoDB DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;");
    for(var i=0;i<t.length;i++){
            console.log("Name: "+t[i].Name);
            var data={name:t[i].Name,users:t[i].Users,uptime:t[i].UpTime,address:t[i].Address,software:t[i].Software};
            var query = connection.query("INSERT INTO hubs SET ? ",data,function(err,rows){
                if(err)
                    console.log("Error inserting : %s ",err);
                console.log("success");
            });
    }
    qs = qs.toString()
    var qslength = qs.length;
}



function findAll() {
    count = 0;
    var startTime = Date.now();
    var addresses = [];

    for (var i = 100; i < 110; i++) {
        for (var j = 0; j < 256; j++) {
            addresses.push(i.toString() + '.' + j.toString());
        }
    }
   
    console.log("Scanning " + addresses.length + " addresses");
    for (var i = 0; i < addresses.length; i++) {
        testAddress(base + addresses[i], 411);
    }
    
    var data = {};
    data['token'] = 'yoursecurityTokenhere!#@#$#%&^%';
    data['content'] = hubs;
    update_hubs_database(data);
    hubs = new Array();
   
}

findAll();

setInterval(findAll, 10000);