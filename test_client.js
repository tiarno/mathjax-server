var http=require('http');
var pdata = {
    "format": "TeX",
    "math": "b + y = \\sqrt{f} = \\sum_n^5 {x}",
    "svg":true,
    "mml":false,
    "png":false,
    "speakText": true,
    "speakRuleset": "mathspeak",
    "speakStyle": "default",
    "ex": 6,
    "width": 1000000,
    "linebreaks": false,
};

var datastring = JSON.stringify(pdata);

var options = {
  'hostname': 'localhost',
  'port': 8003,
  'path': '/',
  'method': 'POST',
  'headers': {
    'Content-Type': 'application/json',
    'Content-Length': datastring.length
    }
};

var request = http.request(options, function(response){
    response.setEncoding('utf-8');
    var body = '';
    response.on('data', function(data){body += data;});
    response.on('end', function(){
        console.log(body);
    });
});

request.on('error', function(e) {
  console.log('problem with request: ' + e.message);
});

request.write(datastring);
request.end();