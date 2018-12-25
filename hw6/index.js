const http = require('http');
const url = require('url');
const config = require('./config');
var cluster = require('cluster');
var os = require('os');

const router = {
    hello: {
        get: function (data, callback) {
            callback(200, {
                message: "Welcome!"
            })  
        }
    },
    notFound: function (data, callback) {
        callback(404);
    }
}

const server = http.createServer(function (req, res) {
    const parsedUrl = url.parse(req.url, true);
    const path = parsedUrl.pathname;
    const trimmedPath = path.replace(/^\/|\/+$/, '');
    const method = req.method.toLocaleLowerCase();
    const routeHandler = findRouteFor(trimmedPath, method);

    routeHandler({}, function (statusCode, payload) {
        res.setHeader('Content-type', 'applications/json');
        res.writeHead(statusCode);
        res.end(JSON.stringify(payload));
    });
});

if (cluster.isMaster) {
    // Fork the process
    for(var i = 0; i < os.cpus().length; i++){
        cluster.fork();
    }
    
} else {
    server.listen(config.port, function () {
        console.log(`Listening on ${config.port} using ${config.envName} environment.`);
    });
}




function findRouteFor(path, method) {
    const hasRoute = typeof(router[path]) === 'object';
    if (!hasRoute) return router.notFound;

    const hasMethod = typeof(router[path][method]) === 'function';

    if (hasMethod === false) {
        return router.notFound;
    }

    return router[path][method];
}

