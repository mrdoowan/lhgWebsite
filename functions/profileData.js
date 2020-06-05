module.exports = {
    getIdByName: getProfilePIdByName,
    getIdBySummoner: getProfilePIdBySummonerId,
    getName: getProfileName,
    getInfo: getProfileInfo,
    getGames: getProfileGamesBySeason,
    getStats: getProfileStatsByTourney,
    getSummonerId: getSummonerIdBySummonerName,
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
            if (err) { console.error(err); reject(500); return; }
            else if (data != null) { resolve(data); return; }
            dynamoDb.getItem('ProfileNameMap', 'ProfileName', simpleName)
            .then((obj) => {
                if (obj == null) { console.error("Profile Name '" + name + "' Not Found"); reject(404); return; } // Not Found 
                let pPId = helper.getProfilePId(obj['ProfileHId']);
                cache.set(cacheKey, pPId);
                resolve(pPId);
            }).catch((err) => { console.error(err); reject(500) });
        });
    });
}

// Get ProfilePId from Riot Summoner Id
function getProfilePIdBySummonerId(summId) {
    let cacheKey = keyBank.PROFILE_SUMM_PREFIX + summId;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, (err, data) => {
            if (err) { console.error(err); reject(500); return; }
            else if (data != null) { resolve(data); return; }
            dynamoDb.getItem('SummonerIdMap', 'SummonerId', summId)
            .then((obj) => {
                if (obj == null) { console.error("Summoner Id '" + summId + "' Not Found"); reject(404); return } // Not Found
                let pPId = helper.getProfilePId(obj['ProfileHId']);
                cache.set(cacheKey, pPId);
                resolve(pPId);
            }).catch((err) => { console.error(err); reject(500) });
        });
    });
}

// Get ProfileName from DynamoDb
function getProfileName(id, hash=true) {
    let pPId = (hash) ? helper.getProfilePId(id) : id;
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

function getProfileInfo(pPId) {
    let cacheKey = keyBank.PROFILE_INFO_PREFIX + pPId;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, async (err, data) => {
            if (err) { console(err); reject(500); }
            else if (data != null) { resolve(JSON.parse(data)); }
            else {
                try {
                    let profileInfoJson = (await dynamoDb.getItem('Profile', 'ProfilePId', pPId, ['Information']))['Information'];
                    if (profileInfoJson != null) { 
                        if ('ActiveSeasonPId' in profileInfoJson) {
                            profileInfoJson['ActiveSeasonShortName'] = await Season.getShortName(profileInfoJson['ActiveSeasonPId']);
                            profileInfoJson['ActiveSeasonName'] = await Season.getName(profileInfoJson['ActiveSeasonPId']);
                        }
                        if ('ActiveTeamHId' in profileInfoJson) {
                            profileInfoJson['ActiveTeamName'] = await Team.getName(profileInfoJson['ActiveTeamHId']);
                        }
                        // Add Season List
                        let gameLogJson = (await dynamoDb.getItem('Profile', 'ProfilePId', pPId, ['GameLog']))['GameLog'];
                        if (gameLogJson != null) {
                            profileInfoJson['SeasonList'] = await helper.getSeasonItems(Object.keys(gameLogJson));
                        }
                        // Add Tournament List
                        let statsLogJson = (await dynamoDb.getItem('Profile', 'ProfilePId', pPId, ['StatsLog']))['StatsLog'];
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
                catch (err) { console.error(err); reject(500); }
            }
        });
    });
}

function getProfileGamesBySeason(pPId, sPId=null) {
    let cacheKey = keyBank.PROFILE_GAMES_PREFIX + pPId + '-' + sPId;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, async (err, data) => {
            if (err) { console(err); reject(500); }
            else if (data != null) { resolve(JSON.parse(data)); }
            else {
                try {
                    let gameLogJson = (await dynamoDb.getItem('Profile', 'ProfilePId', pPId, ['GameLog']))['GameLog'];
                    if (gameLogJson != null) {
                        let seasonId = (sPId) ? sPId : (Math.max(...Object.keys(gameLogJson)));    // if season parameter Id is null, find latest
                        let profileGamesJson = gameLogJson[seasonId];
                        if (profileGamesJson == null) { console.error("This player does not have this Season logged."); reject(404); }
                        else {
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
                    }
                    else {
                        if (sPId == null) { resolve({}); }  // If 'GameLog' does not exist
                        else { console.error("This team does not have any Games logged."); reject(404); }
                    }
                }
                catch (err) { console.error(err); reject(500); }
            }
        });
    });
}

function getProfileStatsByTourney(pPId, tPId) {
    let cacheKey = keyBank.PROFILE_STATS_PREFIX + pPId + '-' + tPId;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, async (err, data) => {
            if (err) { console(err); reject(500); }
            else if (data != null) { resolve(JSON.parse(data)); }
            else {
                try {
                    let statsLogJson = (await dynamoDb.getItem('Profile', 'ProfilePId', pPId, ['StatsLog']))['StatsLog'];
                    if (statsLogJson != null) {
                        let tourneyId = (tPId) ? tPId : (Math.max(...Object.keys(statsLogJson)));    // if tourney parameter Id is null, find latest
                        let profileStatsJson = statsLogJson[tourneyId];
                        if (profileStatsJson == null) { console.error("This player does not have this Tournament logged."); reject(404); }
                        else {
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
                    }
                    else {
                        if (tPId == null) { resolve({}); }  // If 'StatsLog' does not exist
                        else { console.error("This team does not have any Games logged."); reject(404); }
                    }
                }
                catch (err) { console.error(err); reject(500); }
            }
        });
    });
}

// Get Summoner Id from Summoner Name
// Won't need to cache this. Just call directly from Riot API
function getSummonerIdBySummonerName(summName) {
    return new Promise(function(resolve, reject) {
        lambda.getSummonerId(summName).then((data) => {
            resolve(data['id']);
        }).catch((err) => { console.error(err); reject(404); })
    });
}

function postNewProfile(profileObject) {
    
}