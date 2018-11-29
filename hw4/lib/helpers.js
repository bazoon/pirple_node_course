/*
 * Helpers for various tasks
 *
 */

// Dependencies
let config = require('./config');
let crypto = require('crypto');
let path = require('path');
let fs = require('fs');

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

helpers.getTemplate = function (name, data={}) {
    name = typeof(name) === 'string' && name.length > 0 ? name : null;
    return new Promise((resolve, reject) => {
        if (name) {
            const templatesDirectory = path.join(__dirname, '../templates/');    
              
            fs.readFile(templatesDirectory + name + '.html', 'utf8', (err, str) => {
                if(!err && str) {
                    const finalString = helpers.interpolate(str, data);
                    resolve(finalString);
                } else {
                    reject('No template can be found!');
                }
            });
            
        } else {
            reject('Template name not specified!');
        }

    });
}

helpers.addUniversalTemplates = function (str, data) {
    return new Promise((resolve, reject) => {
        helpers.getTemplate('_header', data).then((header) => {
            helpers.getTemplate('_footer', data).then((footer) => {
                resolve(header + str + footer);
                
            })
        }).catch((err) => reject(err));
    });

}

helpers.interpolate = function (str='', localData={}) {
    let data = Object.assign({}, localData, config.templateGlobals);
    
    for (let key in data) {
        if (data.hasOwnProperty(key)) {
            let replace = data[key];
            let find = `{${key}}`;
            str = str.replace(find, replace);
            // console.log('replace ', replace, 'find: ', find, str)
            // console.log('==============')
        }
    }
    return str;

}

helpers.getStaticAsset = function (fileName) {
    fileName = typeof(fileName) === 'string' && fileName.length > 0 ? fileName : null;

    return new Promise((resolve, reject) => {
        if (fileName) {
            const publicDir = path.join(__dirname, '/../public/');
            fs.readFile(publicDir + fileName, function (err, data) {
                if (!err) {
                    resolve(data);
                } else {
                    reject(err);
                }
            });
        } else {
            reject("File not found");
        }
    });


}


// Export the module
module.exports = helpers;
