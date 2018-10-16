const file = require('./file');
const helpers = require('./helpers');
const tokens = require('./tokens');

// Container for all the users methods
const users = {

    // Users - post
    // Required data: name, email, address, streetAddress,
    // Optional data: none
    post: function(data) {
        // Check that all required fields are filled out
        let name = helpers.getStringField(data.payload.name);
        let email = helpers.getStringField(data.payload.email);
        let address = helpers.getStringField(data.payload.address);
        let streetAddress = helpers.getStringField(data.payload.streetAddress);
        let password = helpers.getStringField(data.payload.password);
        
        return new Promise(((resolve, reject) => {
            if(name && email && address && streetAddress && password) {
                // Make sure the user doesnt already exist
                file.read('users', email).then(() => {
                    reject({
                        statusCode: 400,
                        error: { Error: 'A user with that email number already exists' }
                    });
                }).catch(() => {
                    // Hash the password
                    let hashedPassword = helpers.hash(password); // Create the user object
                    
                    if(hashedPassword) {
                        let userObject = {
                            name,
                            email,
                            address,
                            streetAddress,
                            hashedPassword
                        };
                        // Store the user
                        
                        file.create('users', email, userObject).then(() => {
                            resolve(200);
                        }).catch(() => {
                            reject(500, { Error: 'Could not create the new user' });
                        });
                        
                    } else {
                        reject(500, { Error: 'Could not hash the user\'s password.' });
                    }
                });
            } else {
                reject({
                    statusCode: 400,
                    error: { Error: 'Missing required fields' }
                });
            }
        }));
    },
    // Required data: email
    // Optional data: none
    get: function(data) {
    // Check that email number is valid
        const email = helpers.getStringField(data.queryStringObject.email);
        
        return new Promise((resolve, reject) => {
            if (!email) {
                reject({
                    statusCode: 400,
                    error: { Error: 'Missing required field' }
                });
            }
            const token = helpers.getStringField(data.headers.token);
            
            tokens.verifyToken(token, email).then(() => {
                file.read('users', email).then((userData) => {
                    delete userData.hashedPassword;
                    resolve({
                        statusCode: 200,
                        payload: userData
                    });
                    console.log(userData);
                }).catch(() => {
                    reject({
                        statusCode: 404
                    });
                });
            }).catch(() => {
                reject({
                    statusCode: 403,
                    error: { Error: 'Missing required token in header, or token is invalid.' }
                });
            });

        });
    },

    // Required data: email
    // Optional data: firstName, lastName, password (at least one must be specified)
    put: function(data) {
    // Check for required field
        return new Promise((resolve, reject) => {
            
            let name = helpers.getStringField(data.payload.name);
            let email = helpers.getStringField(data.payload.email);
            let address = helpers.getStringField(data.payload.address);
            let streetAddress = helpers.getStringField(data.payload.streetAddress);
            
            if (!email) {
                return reject({
                    statusCode: 400,
                    error: { Error: 'Missing required field.' }
                });
            }

            if (!(name || address || streetAddress)) {
                return reject({
                    statusCode: 400,
                    error: { Error: 'Missing fields to update.' }
                });
            }

            // Check for optional fields
            if (name || email || address || streetAddress) {
                const token = helpers.getStringField(data.headers.token);
                tokens.verifyToken(token, email).then(() => {
                    file.read('users', email).then((userData) => {

                        if (name) {
                            userData.name = name;
                        }

                        if (email) {
                            userData.email = email;
                        }

                        if (address) {
                            userData.address = address;
                        }

                        if (streetAddress) {
                            userData.streetAddress = streetAddress;
                        }

                        file.update('users', email, userData).then(() => {
                            resolve({
                                statusCode: 200
                            });
                        }).catch(() => {
                            reject({
                                statusCode: 500,
                                error: { Error: 'Unable to save data!' }
                            });
                        });


                    }).catch(() => {
                        reject({
                            statusCode: 404,
                            error: { Error: 'Specified user does not exist.' }
                        });
                    });
                }).catch(() => {
                    reject({
                        statusCode: 403,
                        error: { Error: 'Missing required token in header, or token is invalid.' }
                    });
                });

            } else {
                reject({
                    statusCode: 400,
                    error: { Error: 'Missing required field.' }
                });
            }
        });
    },

    // Required data: email
    // @TODO Cleanup (delete) any other data files associated with the user
    delete: function(data) {
        // Check that email number is valid
        const email = helpers.getStringField(data.queryStringObject.email);
        const token = helpers.getStringField(data.headers.token);
        
        return new Promise((resolve, reject) => {

            if (!email) {
                return reject({
                    statusCode: 400,
                    error: { Error: 'Missing required field' }
                });
            }

            tokens.verifyToken(token, email).then(() => {
                file.read('users', email).then(() => {
                    file.delete('users', email).then(() => {
                        resolve({
                            statusCode: 200
                        });
                    }).catch(() => {
                        reject({
                            statusCode: 500,
                            error: { Error: 'Could not delete the specified user' }
                        });
                    });
                }).catch(() => {
                    reject({
                        statusCode: 404,
                        error: { Error: 'Could not find the specified user.' }
                    });
                });

            }).catch(() => {
                reject({
                    statusCode: 403,
                    error: { Error: 'Missing required token in header, or token is invalid.' }
                });
            });

        });
        
    }

};

module.exports = users;
