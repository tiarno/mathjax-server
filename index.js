var cluster = require('cluster');
var http = require('http');
var numCPUs = require('os').cpus().length;

function startMathJax(){
    var mjAPI = require("mathjax-node-sre");
    mjAPI.config({
        MathJax: {
            SVG: {
                font: "STIX-Web"
            },
            tex2jax: {
                preview: ["[math]"],
                processEscapes: true,
                processClass: ['math'],
//                inlineMath: [ ['$','$'], ["\\(","\\)"] ],
//                displayMath: [ ['$$','$$'], ["\\[","\\]"] ],
                skipTags: ["script","noscript","style","textarea","pre","code"]
            },
            TeX: {
                noUndefined: {disabled: true},
                Macros: {
                  mbox: ['{\\text{#1}}',1],
                  mb: ['{\\mathbf{#1}}',1],
                  mc: ['{\\mathcal{#1}}',1],
                  mi: ['{\\mathit{#1}}',1],
                  mr: ['{\\mathrm{#1}}',1],
                  ms: ['{\\mathsf{#1}}',1],
                  mt: ['{\\mathtt{#1}}',1]
                }
            }
        }
    });
    mjAPI.start();
    return mjAPI;
}

function handleRequest(mjAPI, request, response){
    var str_params = '';
    request.on('data', function(chunk){str_params += chunk;});
    request.on('end', function(){
        var params = JSON.parse(str_params);
        mjAPI.typeset(params, function(result){
            if (!result.errors) {
                if (params.svg) {
                    response.writeHead(200, {'Content-Type': 'image/svg+xml'});
                    response.end(result.svg);
                }
                else if (params.mml) {
                    response.writeHead(200, {'Content-Type': 'application/mathml+xml'});
                    response.end(result.mml);
                }
                else if (params.png) {
                    response.writeHead(200, {'Content-Type': 'image/png'});
                    // The reason for slice(22) to start encoding (from str to binary)
                    // after base64 header info--data:image/png;base64,
                    response.end(new Buffer(result.png.slice(22), 'base64'));
                }
            } else {
                response.writeHead(400, {'Content-Type': 'text/plain'});
                response.write('Error 400: Request Failed. \n');
                response.write(String(result.errors) + '\n');
                response.write(str_params + '\n');
                response.end();
            }
        });
    });
}

var createServer = function(port) {
    var domain = require('domain');
    var mjAPI = startMathJax();
    var server = http.createServer(function (request, response) {
        var d = domain.create();
        d.on('error', function(er) {
            console.error('error', er.stack);
            try {
                var killtimer = setTimeout(function(){
                    process.exit(1);
                }, 30000);
                killtimer.unref();
                server.close();
                cluster.worker.disconnect();
                response.statusCode = 500;
                response.setHeader('content-type', 'text/plain');
                response.end('problem!\n');
            } catch (er2) {
                console.error('Error, sending 500.', er2.stack);
            }
        });
        d.add(request);
        d.add(response);
        d.run(function(){
            handleRequest(mjAPI, request, response);
        });
    });
    server.listen(port, function(){
        console.log('Server listening on port %s' , port);
    });
    return server;
};

exports.start = function(port){
    if (cluster.isMaster) {
      // Fork workers.
      for (var i = 0; i < numCPUs; i++) {
        cluster.fork();
      }

      cluster.on('disconnect', function(worker) {
        console.error('disconnect!');
        cluster.fork();
      });

      cluster.on('exit', function(worker, code, signal) {
        console.log('worker ' + worker.process.pid + ' died');
      });
    } else {
        createServer(port);

    }
};