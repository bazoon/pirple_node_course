// Api for order placement

const file = require('./file');
const tokens = require('./tokens');
const helpers = require('./helpers');
const stripe = require('./stripe');
const menuData = require('./menuData');


const orders = {
    // Create a new order and charges client card for payment
    // in case of succes cart is cleared
    post: function(data) {
        const email = helpers.getStringField(data.payload.email);
        const token = helpers.getStringField(data.headers.token);
        
        return new Promise((resolve, reject) => {
            if (!email) {
                reject({
                    statusCode: 403,
                    error: { Error: 'Missing required field' }
                });
            }

            tokens.verifyToken(token, email).then(() => {

                file.read('carts', email).then((cartData) => {

                    const order = cartData.order;

                    const total = order.reduce((acc, item) => {
                        let menuItem = menuData.find((i) => i.id === item.menuId);
                        if (menuItem) {
                            return acc + menuItem.price * item.count;
                        }
                        return acc;
                    }, 0);
                    
                    stripe.pay({ description: 'for pizza', amount: total }).then(() => {
                        
                        file.delete('carts', email).then(() => {
                            resolve({
                                statusCode: 200,
                                payload: { message: `Order for pizza of ${total}$ successfuly paid!` }
                            });
                        }).catch(() => {
                            reject({
                                statusCode: 500,
                                error: { Error: 'Unable to remove card' }
                            });
                        });

                        
                    }).catch((err) => {
                        reject({
                            statusCode: 500,
                            error: { Error: `Unable to complete payment ${err}` }
                        });
                    });
                }).catch(() => {
                    reject({
                        statusCode: 500,
                        error: { Error: 'Unable to read cart' }
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


module.exports = orders;
