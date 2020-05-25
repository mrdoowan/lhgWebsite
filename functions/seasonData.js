module.exports = {
    getId: getSeasonId,
    getShortName: getSeasonShortName,
    getName: getSeasonName,
    getTime: getSeasonTime,
    getLeagues: getLeagues,
}

/*  Declaring npm modules */
require('dotenv').config({ path: '../.env' });
const redis = require('redis');
const cache = redis.createClient(process.env.REDIS_PORT);

/*  Import helper function modules */
const dynamoDb = require('./dynamoDbHelper');
const keyBank = require('./cacheKeys');

// Get SeasonPId from DynamoDb
function getSeasonId(shortName) {
    let simpleName = helper.filterName(shortName);
    let cacheKey = keyBank.SEASON_ID_PREFIX + simpleName;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, (err, data) => {
            if (err) { console.error(err); reject(500) }
            else if (data != null) { resolve(parseInt(data)); } // NOTE: Needs to be number
            else {
                dynamoDb.scanTable('Season', ['SeasonPId'], 'SeasonShortName', simpleName)
                .then((obj) => {
                    if (obj.length === 0) { reject(404); } // Not Found
                    else {
                        let Id = obj[0]['SeasonPId'];
                        cache.set(cacheKey, Id);
                        resolve(Id);
                    }
                }).catch((err) => { console.error(err); reject(500) });
            }
        });
    });
}

// Get SeasonShortName from DynamoDb
function getSeasonShortName(sPId) {
    let cacheKey = cacheKey.SEASON_CODE_PREFIX + sPId;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, (err, data) => {
            if (err) { console(err); reject(500); }
            else if (data != null) { resolve(data); }
            else {
                dynamoDb.getItem('Season', 'SeasonPId', sPId, ['SeasonShortName'])
                .then((obj) => {
                    if (obj == null) { reject(404); }
                    else {
                        let shortName = obj['SeasonShortName'];
                        cache.set(cacheKey, shortName);
                        resolve(shortName);
                    }
                }).catch((err) => { console.error(err); reject(500) });
            }
        });
    });
}

// Get SeasonName from DynamoDb
function getSeasonName(sPId) {
    let cacheKey = keyBank.SEASON_NAME_PREFIX + sPId;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, (err, data) => {
            if (err) { console(err); reject(500); }
            else if (data != null) { resolve(data); }
            else {
                dynamoDb.getItem('Season', 'SeasonPId', sPId, ['Information'])
                .then((obj) => {
                    if (obj == null) { reject(404); }
                    else {
                        let name = obj['Information']['SeasonName'];
                        cache.set(cacheKey, name);
                        resolve(name);
                    }
                }).catch((err) => { console.error(err); reject(500) });
            }
        });
    });
}

function getSeasonTime(sPId) {
    let cacheKey = keyBank.SEASON_TIME_PREFIX + sPId;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, (err, data) => {
            if (err) { console(err); reject(500); }
            else if (data != null) { resolve(data); }
            else {
                dynamoDb.getItem('Season', 'SeasonPId', sPId, ['Information'])
                .then((obj) => {
                    if (obj == null) { reject(404); }
                    else {
                        let time = obj['Information']['SeasonTime'];
                        cache.set(cacheKey, time);
                        resolve(time);
                    }
                }).catch((err) => { console.error(err); reject(500) });
            }
        });
    });
}

// For leagues
function getLeagues() {
    return new Promise(function(resolve, reject) {
        cache.get(keyBank.LEAGUE_KEY, async (err, data) => {
            if (err) { console.error(err); reject(500); }
            else if (data != null) { resolve(JSON.parse(data)); }
            else {
                try {
                    let seasonList = await dynamoDb.scanTable('Season', ['Information']);
                    if (seasonList != null) {
                        let leagueObject = {};
                        seasonList.map((seasonInfoDb) => {
                            const { SeasonTime, DateOpened, LeagueType, SeasonShortName } = seasonInfoDb['Information'];
                            if (!(SeasonTime in leagueObject)) {
                                leagueObject[SeasonTime] = { 'SeasonTime': SeasonTime }
                            }
                            leagueObject[SeasonTime]['Date'] = DateOpened;
                            leagueObject[SeasonTime][LeagueType] = {};
                            leagueObject[SeasonTime][LeagueType]['League'] = LeagueType;
                            leagueObject[SeasonTime][LeagueType]['ShortName'] = SeasonShortName;
                        });
                        let returnObject = {};
                        returnObject['Leagues'] = Object.values(leagueObject).sort((a, b) => (a.Date < b.Date) ? 1 : -1);
                        cache.set(keyBank.LEAGUE_KEY, JSON.stringify(returnObject, null, 2));
                        resolve(returnObject);
                    }
                    else {
                        resolve({});   // Return empty if does not exist
                    }     
                }
                catch (err) { console.error(err); reject(500); }
            }
        });
    })
}