// Cart managing api

const file = require('./file');
const tokens = require('./tokens');
const helpers = require('./helpers');

const cart = {
    // Adds menu position to the cart
    post: function(data) {
        const email = helpers.getStringField(data.payload.email);
        const token = helpers.getStringField(data.headers.token);
        const menuId = helpers.getNumberField(data.payload.menuId);
        const count = helpers.getNumberField(data.payload.count);
        
        return new Promise((resolve, reject) => {
            if (!email || !menuId || !count) {
                reject({
                    statusCode: 403,
                    error: { Error: 'Missing required field' }
                });
            }
    
            tokens.verifyToken(token, email).then(() => {
                
                const cartObject = {
                    menuId,
                    count
                };


                file.read('carts', email).then((cartData) => {
                    const lastItem = cartData.order[ cartData.order.length - 1 ];
                    cartData.order.push(Object.assign({}, cartObject, { id: lastItem.id + 1 }));
                    
                    file.update('carts', email, cartData).then(() => {
                        resolve({
                            statusCode: 200,
                            payload: cartData
                        });
                    }).catch((err) => {
                        reject({
                            statusCode: 500,
                            err: { Error: `Can not update file ${err}` }
                        });
                    });

                }).catch(() => {
                    // No Cart is found, create first position with id = 1
                    let item = Object.assign({}, cartObject, { id: 1 });
                    file.create('carts', email, {
                        email,
                        order: [ item ]
                    }).then(() => {
                        resolve({
                            statusCode: 200,
                            payload: [ item ]
                        });
                    }).catch((err) => {
                        reject({
                            statusCode: 500,
                            error: { Error: err }
                        });
                    });
                });

            }).catch(() => {
                reject({
                    statusCode: 403,
                    error: { Error: 'Could not find the specified token.' }
                });
            });
        });
    }
};

module.exports = cart;
