module.exports = {
    getPId: getTeamPId,
    getName: getTeamName,
}

/*  Declaring npm modules */
require('dotenv').config({ path: '../.env' });
const redis = require('redis');
const cache = redis.createClient(process.env.REDIS_PORT);
const Hashids = require('hashids/cjs'); // For hashing and unhashing
const teamHashIds = new Hashids(process.env.TEAM_HID_SALT, parseInt(process.env.HID_LENGTH));

/*  Import helper function modules */
const dynamoDb = require('./dynamoDbHelper');
const keyBank = require('./cacheKeys');
const helper = require('./helper');

// Get TeamPId from TeamName
function getTeamPId(name) {
    let simpleName = helper.filterName(name);
    let cacheKey = keyBank.TEAM_PID_PREFIX + simpleName;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, (err, data) => {
            if (err) { console.error(err); reject(500); }
            else if (data != null) { resolve(data); }
            else {
                dynamoDb.getItem('TeamNameMap', 'TeamName', simpleName)
                .then((obj) => {
                    if (obj == null) { reject(404); } // Not Found
                    else {
                        let tPId = helper.getPId(obj['TeamHId'], teamHashIds);
                        cache.set(cacheKey, tPId);
                        resolve(tPId);
                    }
                }).catch((err) => { console.error(err); reject(500) });
            }
        });
    });
}

// Get TeamName from DynamoDb
function getTeamName(tHId) {
    let tPId = helper.getPId(tHId, teamHashIds);
    let cacheKey = keyBank.TEAM_NAME_PREFIX + tPId;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, (err, data) => {
            if (err) { reject(500) }
            else if (data != null) { resolve(data); }
            else {
                dynamoDb.getItem('Team', 'TeamPId', tPId, ['TeamName'])
                .then((obj) => {
                    if (obj == null) { reject(404); } // Not Found
                    else { 
                        let name = obj['TeamName'];
                        cache.set(cacheKey, name);
                        resolve(name);
                    }
                }).catch((err) => { console.error(err); reject(500) });
            }
        });
    });
}