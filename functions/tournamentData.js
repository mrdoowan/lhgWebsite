module.exports = {
    getId: getTournamentId,
    getShortName: getTournamentShortName,
    getName: getTournamentName,
}

/*  Declaring npm modules */
require('dotenv').config({ path: '../.env' });
const redis = require('redis');
const cache = redis.createClient(process.env.REDIS_PORT);

/*  Import helper function modules */
const dynamoDb = require('./dynamoDbHelper');
const keyBank = require('./cacheKeys');

// Get TournamentPId from DynamoDb
function getTournamentId(shortName) {
    let simpleName = helper.filterName(shortName);
    let cacheKey = keyBank.TN_ID_PREFIX + simpleName;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, (err, data) => {
            if (err) { console.error(err); reject(500) }
            else if (data != null) { resolve(parseInt(data)); } // NOTE: Needs to be number
            else {
                dynamoDb.scanTable('Tournament', ['TournamentPId'], 'TournamentShortName', simpleName)
                .then((obj) => {
                    if (obj.length === 0) { reject(404); }
                    else {
                        let Id = obj[0]['TournamentPId'];
                        cache.set(cacheKey, Id);
                        resolve(Id);
                    }
                }).catch((err) => { console.error(err); reject(500) });
            }
        });
    });
}

// Get TournamentShortName from DynamoDb
function getTournamentShortName(tPId) {
    let cacheKey = keyBank.TN_CODE_PREFIX + tPId;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, (err, data) => {
            if (err) { console(err); reject(500); }
            else if (data != null) { resolve(data); }
            else {
                dynamoDb.getItem('Tournament', 'TournamentPId', tPId, ['TournamentShortName'])
                .then((obj) => {
                    if (obj == null) { reject(404); } // Not Found
                    else {
                        let shortName = obj['TournamentShortName'];
                        cache.set(cacheKey, shortName);
                        resolve(shortName);
                    }
                }).catch((err) => { console.error(err); reject(500) });
            }
        });
    });
}

// Get TournamentName from DynamoDb
function getTournamentName(tPId) {
    let cacheKey = keyBank.TN_NAME_PREFIX + tPId;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, (err, data) => {
            if (err) { console(err); reject(500); }
            else if (data != null) { resolve(data); }
            else {
                dynamoDb.getItem('Tournament', 'TournamentPId', tPId, ['Information'])
                .then((obj) => {
                    if (obj == null) { reject(404); } // Not Found
                    else {
                        let name = obj['Information']['TournamentName'];
                        cache.set(cacheKey, name);
                        resolve(name);
                    }
                }).catch((err) => { console.error(err); reject(500) });
            }
        });
    });
}

