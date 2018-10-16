// Dependencies
const file = require('./file');
const helpers = require('./helpers');

// Tokens

// Container for all the tokens methods
const tokens = {
    // Tokens - post
    // Required data: phone, password
    // Optional data: none
    post: function(data) {
        const email = helpers.getStringField(data.payload.email);
        const password = helpers.getStringField(data.payload.password);
        
        return new Promise(((resolve, reject) => {
            if (!(email && password)) {
                return reject({
                    statusCode: 400,
                    error: 'Missing required field(s).'
                });
            }
            
            file.read('users', email).then((userData) => {
                let hashedPassword = helpers.hash(password);
                
                if(hashedPassword === userData.hashedPassword) {
                    // If valid, create a new token with a random name. Set an expiration date 1 hour in the future.
                    
                    let tokenId = helpers.createRandomString(20);
                    let expires = Date.now() + 1000 * 60 * 60;
                    let tokenObject = {
                        email,
                        id: tokenId,
                        expires: expires
                    };
                    
                    file.create('tokens', tokenId, tokenObject).then(() => {
                        resolve({
                            statusCode: 200,
                            payload: tokenObject
                        });
                    }).catch((err) => {
                        reject({
                            statusCode: 500,
                            error: { error: `Could not create the new token: ${err}` }
                        });
                    });
                } else {
                    reject({
                        statusCode: 400,
                        error: { error: 'Password did not match the specified user\'s stored password' }
                    });
                }
            }).catch((err) => {
                
                reject({
                    statusCode: 400,
                    error: { error: `can not read user: ${err}` }
                });
            });
        }));
    },
    // Tokens - get
    // Required data: id
    // Optional data: none
    get: function(data) {
        // Check that id is valid
        const id = helpers.getStringFieldOfLength(data.queryStringObject.id, 20);

        return new Promise((resolve, reject) => {
            if(id) {
                file.read('tokens', id).then((tokenData) => {
                    resolve({
                        statusCode: 200,
                        payload: tokenData
                    });
                }).catch((err) => {
                    reject({
                        statusCode: 404,
                        errror: { error: err }
                    });
                });

                
            } else {
                reject({
                    statusCode: 404,
                    error: { error: 'Missing required field, or field invalid' }
                });
            }
        });
        
    },
    // Tokens - put
    // Required data: id, extend
    // Optional data: none
    put: function(data) {
        const id = helpers.getStringFieldOfLength(data.payload.id, 20);
        let extend = helpers.isTrue(data.payload.extend);

        return new Promise((resolve, reject) => {
            if (!id || !extend) {
                reject({
                    statusCode: 400,
                    error: { Error: 'Missing required field(s) or field(s) are invalid.' }
                });
            }

            file.read('tokens', id).then((tokenData) => {
                // Check to make sure the token isn't already expired
                if(tokenData.expires > Date.now()) {
                    // Set the expiration an hour from now
                    tokenData.expires = Date.now() + 1000 * 60 * 60;
                    // Store the new updates

                    file.update('tokens', id, tokenData).then(() => {
                        resolve({
                            statusCode: 200
                        });
                    }).catch((err) => {
                        reject({
                            statusCode: 500,
                            error: { Error: `Could not update the token's expiration.: ${ err}` }
                        });
                    });

                } else {
                    reject({
                        statusCode: 400,
                        error: { Error: 'The token has already expired, and cannot be extended.' }
                    });
                }
            }).catch((err) => {
                reject({
                    statusCode: 400,
                    error: { Error: `Missing required field(s) or field(s) are invalid.: ${err}` }
                });
            });
        });
      
    },
    // Tokens - delete
    // Required data: id
    // Optional data: none
    delete: function(data) {
    // Check that id is valid
        const id = helpers.getStringFieldOfLength(data.queryStringObject.id, 20);
        
        return new Promise((resolve, reject) => {
            if (!id) {
                reject({
                    statusCode: 400,
                    error: { Error: 'Missing required field' }
                });
            }

            file.read('tokens', id).then(() => {
                file.delete('tokens', id).then(() => {
                    resolve({
                        statusCode: 200
                    });
                }).catch(() => {
                    reject({
                        statusCode: 500,
                        error: { Error: 'Could not delete the specified token' }
                    });
                });
            }).catch(() => {
                reject({
                    statusCode: 400,
                    error: { Error: 'Could not find the specified token.' }
                });
            });
        });
    },
    // Verify if a given token id is currently valid for a given user
    verifyToken: function(id, email) {
    // Lookup the token

        return new Promise((resolve, reject) => {
            file.read('tokens', id).then((tokenData) => {
                if (tokenData.email === email && tokenData.expires > Date.now()) {
                    resolve();
                } else {
                    reject();
                }
            }).catch(() => reject());
        });
    }
};


// handlers.tokens = function(data,callback){
//     var acceptableMethods = ['post','get','put','delete'];
//     if(acceptableMethods.indexOf(data.method) > -1){
//       handlers._tokens[data.method](data,callback);
//     } else {
//       callback(405);
//     }
//   };
  
module.exports = tokens;
