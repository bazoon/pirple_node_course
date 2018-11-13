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
    '': {
        get: function (data, callback) {

            const templateData = {
                'head.title': 'Hello',
                'head.description': 'Info',
                'body.title': 'Body title',
                'body.class': 'index'
            };

            helpers.getTemplate('index', templateData).then((str) => {
                helpers.addUniversalTemplates(str, templateData).then((page) => {
                    callback(200, page, 'html');
                }).catch((err) => {
                    callback(500, undefined, 'html');
                });
            }).catch((err) => {
                callback(500, undefined, 'html');
            });
        }
    },
    'favicon.ico': {
        get: function (data, callback) {
            helpers.getStaticAsset('favicon.ico').then((icon) => {
                callback(200, icon, 'favicon')
            }).catch((err) => callback(500));
        }
    },
    'public': {
        get: function (data, callback) {
            const trimmedAssetName = data.trimmedPath.replace('public/', '');
            if (trimmedAssetName.length > 0) {
                helpers.getStaticAsset(trimmedAssetName).then((content) => {
                    let contentType = 'plain';
                    if (trimmedAssetName.endsWith('css')) {
                        contentType = 'css';
                    } else if (trimmedAssetName.endsWith('png')) {
                        contentType = 'jpeg';
                    } else if (trimmedAssetName.endsWith('ico')) {
                        contentType = 'ico';
                    }
                    
                    
                    callback(200, content, contentType);
                }).catch((err) => callback(500));
            } else {
                callback(404);
            }
        }
    },
    'account/create': {
        get: function (data, callback) {
            const templateData = {
                'head.title': 'Create an account',
                'head.description': 'Signup is easy',
                'body.class': 'account-create'
            };

            helpers.getTemplate('accountCreate', templateData).then((str) => {
                helpers.addUniversalTemplates(str, templateData).then((page) => {
                    callback(200, page, 'html');
                }).catch((err) => {
                    callback(500, undefined, 'html');
                });
            }).catch((err) => {
                callback(500, undefined, 'html');
            });
        
        }
    },
    'account/edit': {
        get: function (data, callback) {
            
        }
    },
    'account/delete': {
        get: function (data, callback) {
            
        }
    },
    'session/create': {
        get: function (data, callback) {
            const templateData = {
                'head.title': 'Login to your account',
                'head.description': 'Please enter your credentials',
                'body.class': 'session-create'
            };

            helpers.getTemplate('sessionCreate', templateData).then((str) => {
                helpers.addUniversalTemplates(str, templateData).then((page) => {
                    callback(200, page, 'html');
                }).catch((err) => {
                    callback(500, undefined, 'html');
                });
            }).catch((err) => {
                callback(500, undefined, 'html');
            });
        
        }
    },
    'session/created': {
        get: function (data, callback) {
            const templateData = {
                'head.title': 'Welcome',
                'head.description': 'Welcome to our pizza store!',
                'body.class': 'session-created'
            };

            helpers.getTemplate('sessionCreated', templateData).then((str) => {
                helpers.addUniversalTemplates(str, templateData).then((page) => {
                    callback(200, page, 'html');
                }).catch((err) => {
                    callback(500, undefined, 'html');
                });
            }).catch((err) => {
                callback(500, undefined, 'html');
            });
        
        }
    },
    'session/deleted': {
        get: function (data, callback) {
            const templateData = {
                'head.title': 'Logged out',
                'head.description': 'logged out',
                'body.class': 'session-deleted'
            };

            helpers.getTemplate('sessionDeleted', templateData).then((str) => {
                helpers.addUniversalTemplates(str, templateData).then((page) => {
                    callback(200, page, 'html');
                }).catch((err) => {
                    callback(500, undefined, 'html');
                });
            }).catch((err) => {
                callback(500, undefined, 'html');
            });
        }
    },
    'checkout': {
        get: function (data, callback) {
            const templateData = {
                'head.title': 'Place order',
                'head.description': 'Order',
                'body.class': 'order-place'
            };

            helpers.getTemplate('placeOrder', templateData).then((str) => {
                helpers.addUniversalTemplates(str, templateData).then((page) => {
                    callback(200, page, 'html');
                }).catch((err) => {
                    callback(500, undefined, 'html');
                });
            }).catch((err) => {
                callback(500, undefined, 'html');
            });
        }
    },
    hello: {
        post: function(data, callback) {
            callback(200, {
                message: 'Welcome!'
            });
        }
    },
    'api/users': {
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
    'api/tokens': {
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
    'api/menu': {
        get: function(data, callback) {
            menu.get(data)
                .then(({ statusCode, payload }) => callback(statusCode, payload))
                .catch((err) => callback(500, err));
        }
    },
    'api/orders': {
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
    'api/cart': {
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
        
        let chosenHandler = findRouteFor(trimmedPath, method);

        
        chosenHandler = trimmedPath.indexOf('public/') >= 0 ? router.public.get : chosenHandler;
        
        // Construct the data object to send to the handler
        let data = {
            trimmedPath: trimmedPath,
            queryStringObject: queryStringObject,
            method: method,
            headers: headers,
            payload: helpers.parseJsonToObject(buffer)
        };
  
        // Route the request to the handler specified in the router
        chosenHandler(data, (statusCode, payload, contentType = "json") => {
            // Use the status code returned from the handler, or set the default status code to 200
            statusCode = typeof (statusCode) == 'number' ? statusCode : 200;
  
            
            let payloadString = '';
            switch(true) {
                case contentType === 'json':
                    payload = typeof (payload) == 'object' ? payload : {};
                    payloadString = JSON.stringify(payload);
                    res.setHeader('Content-Type', 'application/json');        
                    break;
                case contentType === 'html':
                    res.setHeader('Content-Type', 'text/html');        
                    payloadString = typeof(payload) === 'string' ? payload : '';
                    break;
                case contentType === 'favicon':
                    res.setHeader('Content-Type', 'image/x-icon');        
                    payloadString = typeof(payload) !== undefined ? payload : '';
                    break;
                case contentType === 'css':
                    res.setHeader('Content-Type', 'text/css');        
                    payloadString = typeof(payload) !== undefined ? payload : '';
                    break;
                case contentType === 'png':
                    res.setHeader('Content-Type', 'image/png');        
                    payloadString = typeof(payload) !== undefined ? payload : '';
                    break;
                case contentType === 'jpeg':
                    res.setHeader('Content-Type', 'image/jpeg');        
                    payloadString = typeof(payload) !== undefined ? payload : '';
                    break;
                case contentType === 'plain':
                    res.setHeader('Content-Type', 'text/plain');        
                    payloadString = typeof(payload) !== undefined ? payload : '';
                    break;
            }

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

