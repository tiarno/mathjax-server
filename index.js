var cluster = require('cluster');
var http = require('http');
var numCPUs = require('os').cpus().length;

var createServer = function(port) {
    var mjAPI = require("MathJax-node/lib/mj-single");
    mjAPI.config({
        MathJax: {
            SVG: {
                font: "STIX-Web"
            },
            tex2jax: {
                preview: ["[math]"],
                processEscapes: true,
                processClass: ['math'],
                inlineMath: [ ['$','$'], ["\\(","\\)"] ],
                displayMath: [ ['$$','$$'], ["\\[","\\]"] ],
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

    var server = http.createServer(function (request, response) {
        var str_params = '';
        request.on('data', function(chunk){str_params += chunk;});
        request.on('end', function(){
            var params = JSON.parse(str_params);
            mjAPI.typeset(params, function(result){
                // console.log('typesetting with '  + params.math);
                if (!result.errors) {
                    response.writeHead(200, {'Content-Type': 'image/svg+xml'});
                    if (params.svg) {response.end(result.svg);}
                    else{response.end(result.mml);}
                } else {
                    response.writeHead(400, {'Content-Type': 'text/plain'});
                    response.write('Error 400: Request Failed. \n');
                    response.write(String(result.errors) + '\n');
                    response.write(str_params + '\n');
                    response.end();
                }
            });
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

      cluster.on('exit', function(worker, code, signal) {
        console.log('worker ' + worker.process.pid + ' died');
      });
    } else {
        var server = createServer(port);
    }
};

