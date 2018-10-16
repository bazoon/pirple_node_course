const http = require('http');
const url = require('url');
const config = require('./lib/config');
const users = require('./lib/users');
const tokens = require('./lib/tokens');
const cart = require('./lib/cart');
const StringDecoder = require('string_decoder').StringDecoder;
const helpers = require('./lib/helpers');
const menu = require('./lib/menu');
const orders = require('./lib/orders');
const mailgun = require('./lib/mailgun');

// Application routes
const router = {
    hello: {
        post: function(data, callback) {
            callback(200, {
                message: 'Welcome!'
            });
        }
    },
    users: {
        post: function(data, callback) {
            users.post(data).then((statusCode) => {
                callback(statusCode);
            }).catch(({ statusCode, error }) => {
                callback(statusCode, error);
            });
        },
        get: function(data, callback) {
            users.get(data).then(({ statusCode, payload }) => {
                callback(statusCode, payload);
            }).catch(({ statusCode, error }) => {
                callback(statusCode, error);
            });
        },
        put: function(data, callback) {
            users.put(data).then(({ statusCode, payload }) => {
                callback(statusCode, payload);
            }).catch(({ statusCode, error }) => {
                callback(statusCode, error);
            });
        },
        delete: function(data, callback) {
            users.delete(data).then(({ statusCode, payload }) => {
                callback(statusCode, payload);
            }).catch(({ statusCode, error }) => {
                callback(statusCode, error);
            });
        }
    },
    tokens: {
        post: function(data, callback) {
            tokens.post(data).then(({ statusCode, payload }) => {
                callback(statusCode, payload);
            }).catch(({ statusCode, error }) => {
                callback(statusCode, error);
            });
        },
        get: function(data, callback) {
            tokens.get(data).then(({ statusCode, payload }) => {
                callback(statusCode, payload);
            }).catch(({ statusCode, error }) => {
                callback(statusCode, error);
            });
        },
        put: function(data, callback) {
            tokens.put(data).then(({ statusCode, payload }) => {
                callback(statusCode, payload);
            }).catch(({ statusCode, error }) => {
                callback(statusCode, error);
            });
        },
        delete: function(data, callback) {
            tokens.delete(data).then(({ statusCode, payload }) => {
                callback(statusCode, payload);
            }).catch(({ statusCode, error }) => {
                callback(statusCode, error);
            });
        }
    },
    menu: {
        get: function(data, callback) {
            menu.get(data)
                .then(({ statusCode, payload }) => callback(statusCode, payload))
                .catch((err) => console.log(err));
        }
    },
    orders: {
        post: function(data, callback) {
            orders.post(data).then(({ statusCode, payload }) => {
                mailgun.sendEmail({
                    to: data.payload.email,
                    from: 'orders@pizza.com',
                    subject: 'Your order is placed',
                    text: 'You can track your order at pizza.com'
                }).then(() => {
                    callback(statusCode, payload);
                }).catch((e) => {
                    callback(500, e);
                });
            }).catch(({ statusCode, error }) => {
                callback(statusCode, error);
            });
        }
    },
    notFound: function(data, callback) {
        callback(404);
    },
    cart: {
        post: function(data, callback) {
            cart.post(data).then(({ statusCode, payload }) => {
                callback(statusCode, payload);
            }).catch(({ statusCode, error }) => {
                callback(statusCode, error);
            });
        }
    }
};

// Searches for route 
const findRouteFor = function(path, method) {
    const hasRoute = typeof (router[ path ]) === 'object';
    if (!hasRoute) {
        return router.notFound;
    }

    const hasMethod = typeof (router[ path ][ method ]) === 'function';
    if (hasMethod === false) {
        return router.notFound;
    }

    return router[ path ][ method ];
};

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const path = parsedUrl.pathname;
    const trimmedPath = path.replace(/^\/|\/+$/, '');
    const method = req.method.toLocaleLowerCase();
    const routeHandler = findRouteFor(trimmedPath, method);

    routeHandler({}, (statusCode, payload) => {
        res.setHeader('Content-type', 'applications/json');
        res.writeHead(statusCode);
        res.end(JSON.stringify(payload));
    });
});


let unifiedServer = function(req, res) {
    // Parse the url
    let parsedUrl = url.parse(req.url, true);
  
    // Get the path
    let path = parsedUrl.pathname;
    let trimmedPath = path.replace(/^\/+|\/+$/g, '');
  
    // Get the query string as an object
    let queryStringObject = parsedUrl.query;
  
    // Get the HTTP method
    let method = req.method.toLowerCase();
  
    // Get the headers as an object
    let headers = req.headers;
  
    // Get the payload,if any
    let decoder = new StringDecoder('utf-8');
    let buffer = '';
    req.on('data', (data) => {
        buffer += decoder.write(data);
    });
    req.on('end', () => {
        buffer += decoder.end();
  
        
        // Check the router for a matching path for a handler. If one is not found, use the notFound handler instead.
        
        const chosenHandler = findRouteFor(trimmedPath, method);
        // Construct the data object to send to the handler
        let data = {
            trimmedPath: trimmedPath,
            queryStringObject: queryStringObject,
            method: method,
            headers: headers,
            payload: helpers.parseJsonToObject(buffer)
        };
  
        // Route the request to the handler specified in the router
        chosenHandler(data, (statusCode, payload) => {
            // Use the status code returned from the handler, or set the default status code to 200
            statusCode = typeof (statusCode) == 'number' ? statusCode : 200;
  
            // Use the payload returned from the handler, or set the default payload to an empty object
            payload = typeof (payload) == 'object' ? payload : {};
  
            // Convert the payload to a string
            let payloadString = JSON.stringify(payload);
  
            // Return the response
            res.setHeader('Content-Type', 'application/json');
            res.writeHead(statusCode);
            res.end(payloadString);
        });
    });
};


let httpServer = http.createServer((req, res) => {
    unifiedServer(req, res);
});


httpServer.listen(config.httpPort, () => {
    console.log(`The HTTP server is running on port ${config.httpPort}`);
});

