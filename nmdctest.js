var hub = new require("nmdc").Nmdc({
    address: "172.30.106.182",
    auto_reconnect: false
});
console.log("Test");
hub.onConnect = function() {
    hub.say('Hi everyone!');
    console.log("Test");
};

hub.onPublic = function(user, message) {
    if (user != hub.opts.nick) {
        hub.say(user + ' just said ' + message);
    }
};