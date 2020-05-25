module.exports = {
    getPId: getProfilePId,
    getName: getProfileName,
}

/*  Declaring npm modules */
require('dotenv').config({ path: '../.env' });
const redis = require('redis');
const cache = redis.createClient(process.env.REDIS_PORT);
const Hashids = require('hashids/cjs'); // For hashing and unhashing
const profileHashIds = new Hashids(process.env.PROFILE_HID_SALT, parseInt(process.env.HID_LENGTH));

/*  Import helper function modules */
const dynamoDb = require('./dynamoDbHelper');
const keyBank = require('./cacheKeys');
const helper = require('./helper');

// Get ProfilePId from ProfileName
function getProfilePId(name) {
    let simpleName = helper.filterName(name);
    let cacheKey = keyBank.PROFILE_PID_PREFIX + simpleName;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, (err, data) => {
            if (err) { console.error(err); reject(500); }
            else if (data != null) { resolve(data); }
            else {
                dynamoDb.getItem('ProfileNameMap', 'ProfileName', simpleName)
                .then((obj) => {
                    if (obj == null) { reject(404); } // Not Found 
                    else {
                        let pPId = helper.getPId(obj['ProfileHId'], profileHashIds);
                        cache.set(cacheKey, pPId);
                        resolve(pPId);
                    }
                }).catch((err) => { console.error(err); reject(500) });
            }
        });
    });
}

// Get ProfileName from DynamoDb
function getProfileName(pHId) {
    let pPId = helper.getPId(pHId, profileHashIds);
    let cacheKey = keyBank.PROFILE_NAME_PREFIX + pPId;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, (err, data) => {
            if (err) { console.error(err); reject(500) }
            else if (data != null) { resolve(data); }
            else {
                dynamoDb.getItem('Profile', 'ProfilePId', pPId, ['ProfileName'])
                .then((obj) => {
                    if (obj == null) { reject(404); } // Not Found
                    else {
                        cache.set(cacheKey, obj['ProfileName']);
                        resolve(obj['ProfileName']);
                    }
                }).catch((err) => { console.error(err); reject(500) });
            }
        });
    });
}

