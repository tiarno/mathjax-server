
# mathjax-server
Nodejs server receives JSON post, returns MathJax-rendered version.

This project is a server front-end for the MathJax-node library.
https://github.com/mathjax/mathjax-node

## Installation

Requires the GitHub repository for MathJax-node:

npm install https://github.com/mathjax/MathJax-node/tarball/master

npm install mathjax-server

## Run Server Example

To run the server on port 8003, put these two lines in a file, `testserver.js`, say, which lives in your `node_modules/mathjax-server` directory (along with `index.js`)

    var server = require('./index');
    server.start(8003);

and run the command:

    node testserver.js

## Run Client Example

A test client for the server. 

The example contains LaTeX math expression in JSON object `pdata` as input. The server returns SVG rendering of the expression, including a text version as `alt` text.

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



## index.js

Server listens for POST requests containing MathJax configuration and math as a string. Returns rendered math. 

The input math string can be in LaTeX or MathML. The output rendering can be SVG, PNG, or MathML. Additionally, you can specify that speech text rendering is added as alt text.

See the documentation for Mathjax-node for more information on PNG outputs. 

The JSON data to post to the server contains the following keys.

- `format`: Specifies the format of the math you are sending. Values can be `MathML`, `TeX`, or `inline-TeX`.
- `math`: Specifies the math expression to be rendered.
- `svg`: Specifies whether to return the math rendered as an SVG image.
- `mml`: Specifies whether to return the math rendered in MathML.
- `png`: Specifies whether to return the math rendered as a PNG image.
- `dpi`: Specifies the dpi for the image when requesting PNG.
- `speakText`: Specifies whether to provide a readable version of the math as `alt` text in the rendered version.
- `ex`: Specifies x-height in pixels.
- `width`: Specifies maximum width for rendered image.
- `linebreaks`: Specifies whether to allow lines to break.



