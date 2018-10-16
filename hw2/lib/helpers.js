/*
 * Helpers for various tasks
 *
 */

// Dependencies
let config = require('./config');
let crypto = require('crypto');

// Container for all the helpers
let helpers = {};

// Parse a JSON string to an object in all cases, without throwing
helpers.parseJsonToObject = function(str) {
    try{
        let obj = JSON.parse(str);
        return obj;
    } catch(e) {
        return {};
    }
};

// Create a SHA256 hash
helpers.hash = function(str) {
    if(typeof (str) == 'string' && str.length > 0) {
        let hash = crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex');
        return hash;
    }
    return false;
  
};

// Create a string of random alphanumeric characters, of a given length
helpers.createRandomString = function(strLength) {
    strLength = typeof (strLength) == 'number' && strLength > 0 ? strLength : false;
    if(strLength) {
    // Define all the possible characters that could go into a string
        let possibleCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789';

        // Start the final string
        let str = '';
        for(i = 1; i <= strLength; i++) {
        // Get a random charactert from the possibleCharacters string
            let randomCharacter = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));
            // Append this character to the string
            str += randomCharacter;
        }
        // Return the final string
        return str;
    }
    return false;
  
};
// Helpers for getting fields from payload or query params

helpers.getStringField = function(field) {
    return typeof (field) == 'string' && field.trim().length > 0 ? field.trim() : false;
};

helpers.getStringFieldOfLength = function(field, length) {
    return typeof (field) == 'string' && field.trim().length === length ? field.trim() : false;
};

helpers.getNumberField = function(field) {
    return typeof (field) == 'number' ? field : false;
};

helpers.isTrue = function(value) {
    return !!(typeof (value) == 'boolean' && value === true);
};

// Export the module
module.exports = helpers;
