// Menu Api

const menuData = require('./menuData');
const file = require('./file');
const tokens = require('./tokens');
const helpers = require('./helpers');

const menu = {
    // Sends all menu items
    get: function(data) {
        return new Promise((resolve, reject) => {
            const token = helpers.getStringField(data.headers.token);
            
            // Verify that the given token is valid for the email
            file.read('tokens', token).then((tokenData) => {
                const { email, id } = tokenData;
                tokens.verifyToken(id, email).then(() => {
                    resolve({
                        statusCode: 200,
                        payload: menuData
                    });
                }).catch(() => {
                    reject({
                        statusCode: 400,
                        error: { Error: 'Token is invalid or expired' }
                    });
                });
            }).catch(() => {
                reject({
                    statusCode: 500,
                    error: { Error: 'Can not read tokens!' }
                });
            });
        });
    }

};

module.exports = menu;
