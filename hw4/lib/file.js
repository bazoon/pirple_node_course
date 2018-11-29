/*
 * Library for storing and editing data
 *
*/

// Dependencies
const fs = require('fs');
const path = require('path');
const helpers = require('./helpers');

// Container for module (to be exported)
const lib = {
    // Base directory of data folder
    baseDir: path.join(__dirname, '/../.data/'),
    // Write data to a file
    create: function(dir, file, data) {
        // Open the file for writing
        return new Promise((resolve, reject) => {
            fs.open(`${lib.baseDir}${dir}/${file}.json`, 'wx', (err, fileDescriptor) => {
                if(!err && fileDescriptor) {
                    // Convert data to string
                    const stringData = JSON.stringify(data); // Write to file and close it
                    fs.writeFile(fileDescriptor, stringData, (err) => {
                        if(!err) {
                            fs.close(fileDescriptor, (err) => {
                                if(!err) {
                                    resolve();
                                } else {
                                    reject('Error closing new file');
                                }
                            });
                        } else {
                            reject('Error writing to new file');
                        }
                    });
                } else {
                    reject('Could not create new file, it may already exist');
                }
            });
        });
    },
    // Read data from a file
    read: function(dir, file) {
        return new Promise(((resolve, reject) => {
            fs.readFile(`${lib.baseDir + dir}/${file}.json`, 'utf8', (err, data) => {
                if(!err && data) {
                    const parsedData = helpers.parseJsonToObject(data);
                    resolve(parsedData);
                } else {
                    reject(err);
                }
            });
        
        }));
    },
    update: function(dir, file, data) {
        return new Promise(((resolve, reject) => {
            // Open the file for writing
            fs.open(`${lib.baseDir + dir}/${file}.json`, 'r+', (err, fileDescriptor) => {
                if(!err && fileDescriptor) {
                    // Convert data to string
                    const stringData = JSON.stringify(data); // Truncate the file
                    fs.truncate(fileDescriptor, (err) => {
                        if(!err) {
                            // Write to file and close it
                            fs.writeFile(fileDescriptor, stringData, (err) => {
                                if(!err) {
                                    fs.close(fileDescriptor, (err) => {
                                        if(!err) {
                                            resolve();
                                        } else {
                                            reject('Error closing existing file');
                                        }
                                    });
                                } else {
                                    reject('Error writing to existing file');
                                }
                            });
                        } else {
                            reject('Error truncating file');
                        }
                    });
                } else {
                    reject('Could not open file for updating, it may not exist yet');
                }
            });
        }));
    },
    // Unlink the file from the filesystem
    delete: function(dir, file) {
        return new Promise(((resolve, reject) => {
            fs.unlink(`${lib.baseDir + dir}/${file}.json`, (err) => {
                if(!err) {
                    resolve(err);
                } else {
                    reject(err);
                }
            });
          
        }));
    },
    list: function (dir) {
        return new Promise(function (resolve, reject) {
            fs.readdir(`${lib.baseDir}${dir}`, (err, files) => {
                files.forEach(file => {
                    resolve(files);
                });
            })
        });
    }
  
  
};
// Delete a file// Export the module
module.exports = lib;
