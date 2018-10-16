// Stripe Api

let querystring = require('querystring');
let https = require('https');

const stripe = {
    // Creates payment given description and amount
    pay: function(payConfig) {
        const payload = {
            source: 'tok_mastercard',
            description: payConfig.description,
            currency: 'usd',
            amount: payConfig.amount
        };

        const stringPayload = querystring.stringify(payload);

        let requestDetails = {
            protocol: 'https:',
            hostname: 'api.stripe.com',
            method: 'POST',
            path: '/v1/charges',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(stringPayload),
                Authorization: 'Bearer sk_test_4eC39HqLyjWDarjtT1zdp7dc'
            }
        };

        return new Promise((resolve, reject) => {
            
            let req = https.request(requestDetails, (res) => {
                // Grab the status of the sent request
                let status = res.statusCode;
                
                // Callback successfully if the request went through
                if(status === 200 || status === 201) {
                    let body = '';
                    res.on('data', (chunk) => {
                        body += chunk;
                    });
                    res.on('end', () => {
                        return resolve(JSON.parse(body));
                    });
                } else {
                    reject(`Status code returned was ${status}`);
                }
            });

            // Bind to the error event so it doesn't get thrown
            req.on('error', (e) => {
                reject(e);
            });
        
            // Add the payload
            req.write(stringPayload);
        
            // End the request
            req.end();
        });


    }
};


module.exports = stripe;
