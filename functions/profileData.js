module.exports = {
    getIdByName: getProfilePIdByName,
    getIdBySummonerId: getProfilePIdBySummonerId,
    getName: getProfileName,
    getInfo: getProfileInfo,
    getGames: getProfileGamesBySeason,
    getStats: getProfileStatsByTourney,
    getSummonerId: getSummonerIdBySummonerName,
    postNew: postNewProfile,
    putInfo: updateProfileInfo,
    updateName: updateProfileName,
}

/*  Declaring npm modules */
require('dotenv').config({ path: '../.env' });
const redis = require('redis');
const cache = redis.createClient(process.env.REDIS_PORT);

/*  Import helper function modules */
const dynamoDb = require('./dynamoDbHelper');
const lambda = require('./awsLambdaHelper');
const keyBank = require('./cacheKeys');
const helper = require('./helper');
// Data Functions
const Season = require('./seasonData');
const Tournament = require('./tournamentData');
const Team = require('./teamData');

// Get ProfilePId from ProfileName
function getProfilePIdByName(name) {
    let simpleName = helper.filterName(name);
    let cacheKey = keyBank.PROFILE_PID_PREFIX + simpleName;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, (err, data) => {
            if (err) { console.error(err); reject(err); return; }
            else if (data != null) { resolve(data); return; }
            dynamoDb.getItem('ProfileNameMap', 'ProfileName', simpleName)
            .then((obj) => {
                if (obj == null) { resolve(null); return; } // Not Found 
                let pPId = helper.getProfilePId(obj['ProfileHId']);
                cache.set(cacheKey, pPId);
                resolve(pPId);
            }).catch((error) => { console.error(error); reject(error) });
        });
    });
}

// Get ProfilePId from Riot Summoner Id
function getProfilePIdBySummonerId(summId) {
    let cacheKey = keyBank.PROFILE_SUMM_PREFIX + summId;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, (err, data) => {
            if (err) { console.error(err); reject(err); return; }
            else if (data != null) { resolve(data); return; }
            dynamoDb.getItem('SummonerIdMap', 'SummonerId', summId)
            .then((obj) => {
                if (obj == null) { resolve(null); return; } // Not Found
                let pPId = helper.getProfilePId(obj['ProfileHId']);
                cache.set(cacheKey, pPId);
                resolve(pPId);
            }).catch((error) => { console.error(error); reject(error) });
        });
    });
}

// Get ProfileName from DynamoDb
// hash=true if id is HId, hash=false if id id PId
function getProfileName(id, hash=true) {
    let pPId = (hash) ? helper.getProfilePId(id) : id;
    let cacheKey = keyBank.PROFILE_NAME_PREFIX + pPId;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, (err, data) => {
            if (err) { console.error(err); reject(err); return; }
            else if (data != null) { resolve(data); return; }
            dynamoDb.getItem('Profile', 'ProfilePId', pPId)
            .then((obj) => {
                if (obj == null) { resolve(null); return; } // Not Found
                cache.set(cacheKey, obj['ProfileName']);
                resolve(obj['ProfileName']);
            }).catch((error) => { console.error(error); reject(error) });
        });
    });
}

function getProfileInfo(pPId) {
    let cacheKey = keyBank.PROFILE_INFO_PREFIX + pPId;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, async (err, data) => {
            if (err) { console(err); reject(err); return; }
            else if (data != null) { resolve(JSON.parse(data)); return; }
            try {
                let profileInfoJson = (await dynamoDb.getItem('Profile', 'ProfilePId', pPId))['Information'];
                if (profileInfoJson != null) { 
                    if ('ActiveSeasonPId' in profileInfoJson) {
                        profileInfoJson['ActiveSeasonShortName'] = await Season.getShortName(profileInfoJson['ActiveSeasonPId']);
                        profileInfoJson['ActiveSeasonName'] = await Season.getName(profileInfoJson['ActiveSeasonPId']);
                    }
                    if ('ActiveTeamHId' in profileInfoJson) {
                        profileInfoJson['ActiveTeamName'] = await Team.getName(profileInfoJson['ActiveTeamHId']);
                    }
                    // Add Season List
                    let gameLogJson = (await dynamoDb.getItem('Profile', 'ProfilePId', pPId))['GameLog'];
                    if (gameLogJson != null) {
                        profileInfoJson['SeasonList'] = await helper.getSeasonItems(Object.keys(gameLogJson));
                    }
                    // Add Tournament List
                    let statsLogJson = (await dynamoDb.getItem('Profile', 'ProfilePId', pPId))['StatsLog'];
                    if (statsLogJson != null) {
                        profileInfoJson['TournamentList'] = await helper.getTourneyItems(Object.keys(statsLogJson));
                    }
                    cache.set(cacheKey, JSON.stringify(profileInfoJson, null, 2));
                    resolve(profileInfoJson);
                }
                else {
                    resolve({}) // If 'Information' does not exist
                }
            }
            catch (error) { console.error(error); reject(error); }
        });
    });
}

function getProfileGamesBySeason(pPId, sPId=null) {
    let cacheKey = keyBank.PROFILE_GAMES_PREFIX + pPId + '-' + sPId;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, async (err, data) => {
            if (err) { console(err); reject(err); return; }
            else if (data != null) { resolve(JSON.parse(data)); return; }
            try {
                let gameLogJson = (await dynamoDb.getItem('Profile', 'ProfilePId', pPId))['GameLog'];
                if (gameLogJson != null) {
                    let seasonId = (sPId) ? sPId : (Math.max(...Object.keys(gameLogJson)));    // if season parameter Id is null, find latest
                    let profileGamesJson = gameLogJson[seasonId];
                    if (profileGamesJson == null) { resolve(null); return; } // Not Found
                    profileGamesJson['SeasonTime'] = await Season.getTime(seasonId);
                    for (let i = 0; i < Object.values(profileGamesJson['Matches']).length; ++i) {
                        let matchJson = Object.values(profileGamesJson['Matches'])[i];
                        matchJson['TeamName'] = await Team.getName(matchJson['TeamHId']);
                        matchJson['EnemyTeamName'] = await Team.getName(matchJson['EnemyTeamHId']);
                        matchJson['KillPct'] = ((matchJson['Kills'] + matchJson['Assists']) / matchJson['TeamKills']).toFixed(4);
                        matchJson['DamagePct'] = (matchJson['DamageDealt'] / matchJson['TeamDamage']).toFixed(4);
                        matchJson['GoldPct'] = (matchJson['Gold'] / matchJson['TeamGold']).toFixed(4);
                        matchJson['VisionScorePct'] = (matchJson['VisionScore'] / matchJson['TeamVS']).toFixed(4);
                    }
                    cache.set(cacheKey, JSON.stringify(profileGamesJson, null, 2));
                    resolve(profileGamesJson);
                }
                else {
                    if (sPId == null) { resolve({}); }  // If 'GameLog' does not exist
                    else { resolve(null); return; } // Not Found
                }
            }
            catch (error) { console.error(error); reject(error); }
        });
    });
}

function getProfileStatsByTourney(pPId, tPId) {
    let cacheKey = keyBank.PROFILE_STATS_PREFIX + pPId + '-' + tPId;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, async (err, data) => {
            if (err) { console(err); reject(err); return; }
            else if (data != null) { resolve(JSON.parse(data)); return; }
            try {
                let statsLogJson = (await dynamoDb.getItem('Profile', 'ProfilePId', pPId))['StatsLog'];
                if (statsLogJson != null) {
                let tourneyId = (tPId) ? tPId : (Math.max(...Object.keys(statsLogJson)));    // if tourney parameter Id is null, find latest
                let profileStatsJson = statsLogJson[tourneyId];
                if (profileStatsJson == null) { resolve(null); return; }
                    profileStatsJson['TournamentName'] = await Tournament.getName(tourneyId);
                    for (let i = 0; i < Object.keys(profileStatsJson['RoleStats']).length; ++i) {
                        let role = Object.keys(profileStatsJson['RoleStats'])[i];
                        let statsJson = profileStatsJson['RoleStats'][role];
                        let gameDurationMinute = statsJson['TotalGameDuration'] / 60;
                        statsJson['Kda'] = (statsJson['TotalDeaths'] > 0) ? ((statsJson['TotalKills'] + statsJson['TotalAssists']) / statsJson['TotalDeaths']).toFixed(2).toString() : "Perfect";
                        statsJson['KillPct'] = ((statsJson['TotalKills'] + statsJson['TotalAssists']) / statsJson['TotalTeamKills']).toFixed(4);
                        statsJson['DeathPct'] = (statsJson['TotalDeaths'] / statsJson['TotalTeamDeaths']).toFixed(4);
                        statsJson['CreepScorePerMinute'] = (statsJson['TotalCreepScore'] / gameDurationMinute).toFixed(2);
                        statsJson['GoldPerMinute'] = (statsJson['TotalGold'] / gameDurationMinute).toFixed(2);
                        statsJson['GoldPct'] = (statsJson['TotalGold'] / statsJson['TotalTeamGold']).toFixed(4);
                        statsJson['DamagePerMinute'] = (statsJson['TotalDamage'] / gameDurationMinute).toFixed(2);
                        statsJson['DamagePct'] = (statsJson['TotalDamage'] / statsJson['TotalTeamDamage']).toFixed(4);
                        statsJson['VisionScorePerMinute'] = (statsJson['TotalVisionScore'] / gameDurationMinute).toFixed(2);
                        statsJson['VisionScorePct'] = (statsJson['TotalVisionScore'] / statsJson['TotalTeamVisionScore']).toFixed(4);
                        statsJson['WardsPerMinute'] = (statsJson['TotalWardsPlaced'] / gameDurationMinute).toFixed(2);
                        statsJson['WardsClearedPerMinute'] = (statsJson['TotalWardsCleared'] / gameDurationMinute).toFixed(2);
                        statsJson['ControlWardsPerMinute'] = (statsJson['TotalControlWardsBought'] / gameDurationMinute).toFixed(2);
                        statsJson['AverageCsAtEarly'] = (statsJson['TotalCsAtEarly'] / statsJson['GamesPlayedOverEarly']).toFixed(1);
                        statsJson['AverageGoldAtEarly'] = (statsJson['TotalGoldAtEarly'] / statsJson['GamesPlayedOverEarly']).toFixed(1);
                        statsJson['AverageXpAtEarly'] = (statsJson['TotalXpAtEarly'] / statsJson['GamesPlayedOverEarly']).toFixed(1);
                        statsJson['AverageCsDiffEarly'] = (statsJson['TotalCsDiffEarly'] / statsJson['GamesPlayedOverEarly']).toFixed(1);
                        statsJson['AverageGoldDiffEarly'] = (statsJson['TotalGoldDiffEarly'] / statsJson['GamesPlayedOverEarly']).toFixed(1);
                        statsJson['AverageXpDiffEarly'] = (statsJson['TotalXpDiffEarly'] / statsJson['GamesPlayedOverEarly']).toFixed(1);
                        statsJson['FirstBloodPct'] = (statsJson['TotalFirstBloods'] / statsJson['GamesPlayed']).toFixed(4);
                    }
                    cache.set(cacheKey, JSON.stringify(profileStatsJson, null, 2));
                    resolve(profileStatsJson);
                }
                else {
                    if (tPId == null) { resolve({}); }  // If 'StatsLog' does not exist
                    else { resolve(null); return; }
                }
            }
            catch (error) { console.error(error); reject(error); }
        });
    });
}

// Get Summoner Id from Summoner Name
// Won't need to cache this. Just call directly from Riot API
function getSummonerIdBySummonerName(summName) {
    return new Promise(function(resolve, reject) {
        lambda.getSummonerId(summName).then((data) => {
            try { resolve(data['id']); }
            catch { resolve(null); } // Not Found
        }).catch((err) => { reject(err); })
    });
}

// Add to "Profile", "ProfileNameMap", "SummonerIdMap" Table
function postNewProfile(newProfileItem, profileId, summId) {
    return new Promise(async (resolve, reject) => {
        try {
            // Add to 'Profile' Table
            await dynamoDb.putItem('Profile', newProfileItem, profileId);
            // Add to 'ProfileNameMap' Table
            let simpleProfileName = helper.filterName(newProfileItem['ProfileName']);
            let newProfileMap = {
                'ProfileName': simpleProfileName,
                'ProfileHId': helper.getProfileHId(profileId),
            }
            await dynamoDb.putItem('ProfileNameMap', newProfileMap, simpleProfileName);
            // Add to 'SummonerIdMap' Table
            let newSummonerMap = {
                'SummonerId': summId,
                'ProfileHId': helper.getProfileHId(profileId),
            };
            await dynamoDb.putItem('SummonerIdMap', newSummonerMap, summId);
            // Cache set Key: PROFILE_INFO_PREFIX
            let cacheKey = keyBank.PROFILE_INFO_PREFIX + profileId;
            cache.set(cacheKey, JSON.stringify(newProfileItem['Information'], null, 2));
            resolve({
                'SummonerId': summId,
                'ProfileName': newProfileItem['ProfileName'],
                'ProfilePId': profileId,
            });
        }
        catch (err) { console.error(err); reject(err); }
    });
}

// Update "Profile" Information
function updateProfileInfo(profileId, item) {
    return new Promise(async (resolve, reject) => {
        try {
            await dynamoDb.updateItem('Profile', 'ProfilePId', profileId,
                'SET #key = :data',
                {
                    '#key': 'Information',
                },
                {
                    ':data': item
                }
            );
            // Cache set Key: PROFILE_INFO_PREFIX
            let cacheKey = keyBank.PROFILE_INFO_PREFIX + profileId;
            cache.set(cacheKey, JSON.stringify(item, null, 2));
            resolve(item);
        }
        catch (err) { console.error(err); reject(err); }
    });
}

// Change Profile name. Update "Profile", "ProfileNameMap" table
function updateProfileName(profileId, newName, oldName) {
    return new Promise(async (resolve, reject) => {
        try {
            // Update "Profile" table
            await dynamoDb.updateItem('Profile', 'ProfilePId', profileId,
                'SET #name = :new, #info.#name = :new',
                {
                    '#name': 'ProfileName',
                    '#info': 'Information',                    
                },
                {
                    ':new': newName,
                }
            );
            // Add newName to "ProfileNameMap" table
            await dynamoDb.putItem('ProfileNameMap', {
                'ProfileName': helper.filterName(newName),
                'ProfileHId': helper.getProfileHId(profileId),
            }, helper.filterName(newName));
            // Delete oldName from "ProfileNameMap" table
            await dynamoDb.deleteItem('ProfileNameMap', 'ProfileName', helper.filterName(oldName));

            // Cache
            cache.del(keyBank.PROFILE_PID_PREFIX + helper.filterName(oldName)); // Del 'PROFILE_PID_PREFIX + oldName' Cache
            cache.set(keyBank.PROFILE_PID_PREFIX + helper.filterName(newName), profileId); // Set 'PROFILE_PID_PREFIX + newName' Cache
            cache.set(keyBank.PROFILE_NAME_PREFIX + profileId, newName); // Set 'PROFILE_NAME_PREFIX + PId' Cache
            let profileInfoJson = (await dynamoDb.getItem('Profile', 'ProfilePId', profileId))['Information'];
            cache.set(keyBank.PROFILE_INFO_PREFIX + profileId, JSON.stringify(profileInfoJson, null, 2)) // Set 'PROFILE_INFO_PREFIX + PId' Cache

            resolve({
                'ProfilePId': profileId,
                'NewProfileName': newName,
                'OldProfileName': oldName,
            });
        }
        catch (err) { console.error(err); reject(err); }
    })
}