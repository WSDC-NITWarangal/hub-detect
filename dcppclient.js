function genNick() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var len = 4 + Math.random()*5;
    for( var i=0; i < len; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
}

var Dcpp = function(addr) {
    this.nickname = "stfutemp";// genNick();
    this.password = "temp";
    this.state = "init";

    this.hubDetails = {};
    this.hubDetails.Name = "";
    this.hubDetails.Users = "";
    this.hubDetails.UpTime = "";
    this.hubDetails.Address = addr;
    this.hubDetails.Software = "";
};

function getKey(lk) {
    key = [];
    lock = [];
    key.push(0);
    for (var i = 0; i < lk.length; i++) {
        lock.push(lk.charCodeAt(i));
    }
    var len =lock.length;
    for (i = 1; i < len; i++) {
        key.push(lock[i] ^ lock[i-1]);
    }
    key[0] =lock[0] ^ lock[len-1] ^ lock[len-2] ^ 5;
    var res = '';
    var temp = '';
    for (i = 0; i < len; i++) {
        key[i] = ((key[i]<<4) & 240) | ((key[i]>>4) & 15);
        switch(key[i]) {
            case 0:
                temp = '/%DCN000%/';
                break;
            case 5:
                temp = '/%DCN005%/';
                break;
            case 36:
                temp = '/%DCN036%/';
                break;
            case 96:
                temp = '/%DCN096%/';
                break;
            case 124:
                temp = '/%DCN124%/';
                break;
            case 126:
                temp = '/%DCN126%/';
                break;
            default:
                temp = String.fromCharCode(key[i]);
                break;
        }
        // NMDC requires ASCII strings
        res += unescape(encodeURIComponent(temp));
    }
    return res;
}


Dcpp.prototype.getHub = function(){
  return this.hubDetails; 
};

Dcpp.prototype.printHubDetails = function() {
    console.log("Hub Address  :  " + this.hubDetails.Address+"\n");
    console.log("Hub Name     :  " + this.hubDetails.Name+"\n");
    console.log("Hub Users    :  " + this.hubDetails.Users+"\n");
    console.log("Hub Uptime   :  " + this.hubDetails.UpTime+"\n");
    console.log("Hub Software :  " + this.hubDetails.Software+"\n");
    console.log("*********************************");
};

Dcpp.prototype.handleCommand = function(data) {
    var self = this;
    var done = false;
    data = data.split('|');
    var reply = '', count = 0;
    data.forEach(function(d) {
        if (d.trim() !== '') {
            count++;
            var spaceSplit = d.indexOf(' ');
            if (spaceSplit === -1) {
                spaceSplit = d.length;
            }
            cmd = d.substr(0, spaceSplit);
            d = d.substr(spaceSplit + 1);
            if (cmd[0] === '$') {
                switch(cmd) {
                    case '$Lock':
                        reply += self.handleLock(d);
                        break;
                    case '$Supports':
                        break;
                    case '$Hello':
                        reply += self.handleHello(d);
                        break;
                    case '$GetPass':
                        reply += self.handleGetPass(d);
                        break;
                    case '$HubName':
                        reply += self.handleHubName(d);
                        break;
                    default:
                        count--;
                        break;
                }
            } else if (cmd[0] === '<') {
                count--;
                var creply = self.handleMessage(d);
                if (typeof creply === "boolean") {
                    done = creply;
                }
            }
        }
    });
    if (count === 0 || done) {
        reply = "TERMINATE";
    }
    return reply;
};


Dcpp.prototype.handleLock = function(data) {
    lock = data.substr(0, data.indexOf(' Pk='));
    hub = data.substr(data.indexOf(' Pk=') + 4);
    key = getKey(lock);

    var res = this.getSupports();
    res += "$Key " + key + "|";
    res +="$ValidateNick " + this.nickname + "|";
    return res;
};

Dcpp.prototype.handleHello = function(data) {
    var res = this.getVersion();
    res += this.getMyInfo();
    return res;
};

Dcpp.prototype.handleGetPass = function(data) {
    return "$MyPass " + this.password + "|";
};

Dcpp.prototype.handleHubName = function(data) {
    this.hubDetails.Name = data;
    return '';
};

Dcpp.prototype.handleMessage = function(data) {
    var HUBRUNNING_STRING = 'This hub is running ';
    var UPTIME_STRING = '(UpTime: ';
    var USERS_STRING = ' / Users: ';
    var pos = data.indexOf(HUBRUNNING_STRING);
    if (pos !== -1) {
        this.hubDetails.Software = data.substring(pos+HUBRUNNING_STRING.length, data.indexOf(UPTIME_STRING));
        this.hubDetails.UpTime = data.substring(data.indexOf(UPTIME_STRING) + UPTIME_STRING.length, data.indexOf(USERS_STRING));
        this.hubDetails.Users = data.substring(data.indexOf(USERS_STRING) + USERS_STRING.length, data.indexOf(")"));
        return true;
    }
    return false;
};

Dcpp.prototype.getSupports = function() {
    return "$Supports None|";
};

Dcpp.prototype.getVersion = function() {
    return "$Version 1,0091|";
};

Dcpp.prototype.getMyInfo = function() {
    return "$MyINFO $ALL " + this.nickname + "  <EiskaltDC++ V:2.2.7,M:A,H:1/0/0,S:3>$ $5$$30621370408$|";
};

module.exports = Dcpp;
