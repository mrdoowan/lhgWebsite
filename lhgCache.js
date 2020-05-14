module.exports = {
    LhgCache: LhgCache,
    outputCache: outputCache,
}

/*  Declaring npm modules */
const fs = require('fs');
var path = require('path');

/*  Globals */
const FILE_PREFIX = './cache/';
const FILE_EXT = '.json';

/*  Private Member variables */
var CacheName = '';
var Production = false; // 'true' when in production
var CacheObject = {};

// Ctor
function LhgCache(cacheName) {
    if (typeof cacheName !== 'string') {
        throw new TypeError('lhgCache: Provided filename must be a string');
    }
    if (cacheName.length === 0 || cacheName == undefined) {
        throw new TypeError('lhgCache: Provided filename must not be empty');
    }

    CacheName = cacheName;

    var pathName = FILE_PREFIX + cacheName + FILE_EXT;
    if (!Production) {
        // Check if the file exists.
        // If it does, load it into the object
        console.log(pathName);
        fs.stat(pathName, function(err, stat) {
            if (err == null) {
                console.log("File Found.");
                CacheObject = JSON.parse(fs.readFileSync(pathName));
            }
        });
    }
}

function outputCache() {
    console.log(CacheObject);
}