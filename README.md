
# svgserver
Nodejs server receives JSON post, returns MathJax-rendered version.

This project is a server front-end for the MathJax-node library.
https://github.com/mathjax/mathjax-node

## index.js
Server listens for POST requests containing MathJax configuration and math as string. Returns rendered math as SVG image.

Start server on port 8001:

    var server = require('mathjax-server');
    server.init(8001);

You can use this server to convert LaTeX math or MathML to SVG, PNG, or MathML. Additionally, you can specify that speech text rendering is added as alt text.

The JSON data to post to the server is as follows.
- `format`: Specifies the format of the math you are sending. Values can be `MathML`, `Tex`, or `inline-TeX`.
- `svg`: Specifies whether to return the math rendered as an SVG image.
- `mml`: Specifies whether to return the math rendered in MathML.
- `png`: Specifies whether to return the math rendered as a PNG image.
- `dpi`: Specifies the dpi for the image when requesting PNG.
- `math`: Specifies the math expression to be rendered.
- `speakText`: Specifies whether to provide a readable version of the math as `alt` text in the rendered version.
- `ex`: Specifies x-height in pixels.
- `width`: Specifies maximum width for rendered image.
- `linebreaks`: Specifies whether to allow lines to break.

You can send MathML to the server `format: "MathML"`

## Example Client

A test client for the server. 
Contains hard-coded LaTeX math expression in JSON object `pdata`.

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
      'port': 8001,
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



