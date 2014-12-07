function ipStrToNum(ipString) {
    var parts = ipString.split('.');
    var res = 0.0;
    for (var i = 0; i < 4; i++) {
        res = (res << 8) + Number(parts[i]);
        console.log(res);
    }
    return res;
}

function ipNumToStr(ipNum) {
    var res = '';
    for (var i = 0; i < 4; i++) {
        res = (ipNum%256).toString() + "." + res;
        ipNum= Math.floor(ipNum/256);
    }
    res = res.substring(0, res.length - 1);
    return res;
}

var addr ='255.255.255.255';
var num = ipStrToNum(addr);
console.log(addr + " = " + num);
console.log(num + " = " + ipNumToStr(num));