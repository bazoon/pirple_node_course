// Mailgun api

const https = require('https');
let querystring = require('querystring');
const username = 'api';
const passw = 'key-3ax6xnjp29jd6fds4gc373sgvjxteol0';

const mailgun = {
    // Sends email to receiver specified in config
    sendEmail: function(config) {
        const payload = {
            from: config.from,
            to: config.to,
            subject: config.subject,
            text: config.text
        };

        const stringPayload = querystring.stringify(payload);

        const options = {
            host: 'api.mailgun.net',
            port: 443,
            method: 'POST',
            path: '/v3/samples.mailgun.org/messages',
            headers: {
                Authorization: `Basic ${new Buffer.from(username + ':' + passw).toString('base64')}`,
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(stringPayload)
            }
        };

        return new Promise((resolve, reject) => {
            request = https.request(options, (res) => {
                let body = '';
                res.on('data', (data) => {
                    body += data;
                });
                res.on('end', () => {
                    resolve(body);
                });
                res.on('error', (e) => {
                    reject(e);
                });
            });
    
            request.on('error', (e) => {
                reject(e);
            });
    
            request.write(stringPayload);
            
            // End the request
            request.end();
        });


    }
};

module.exports = mailgun;
