module.exports = {
    getId: getTeamPId,
    getName: getTeamName,
    getInfo: getTeamInfo,
    getScouting: getTeamScoutingBySeason,
    getGames: getTeamGamesBySeason,
    getStats: getTeamStatsByTourney,
}

/*  Declaring npm modules */
require('dotenv').config({ path: '../.env' });
const redis = require('redis');
const cache = redis.createClient(process.env.REDIS_PORT);

/*  Import helper function modules */
const dynamoDb = require('./dynamoDbHelper');
const keyBank = require('./cacheKeys');
const helper = require('./helper');
// Data Functions
const Season = require('./seasonData');
const Tournament = require('./tournamentData');
const Profile = require('./profileData');

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
                    if (obj == null) { console.error("Team Name '" + name + "' Not Found"); reject(404); } // Not Found
                    else {
                        let tPId = helper.getTeamPId(obj['TeamHId']);
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
    let tPId = helper.getTeamPId(tHId);
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

function getTeamInfo(teamPId) {
    let cacheKey = keyBank.TEAM_INFO_PREFIX + teamPId;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, async (err, data) => {
            if (err) { console(err); reject(500); }
            else if (data != null) { resolve(JSON.parse(data)); }
            else {
                try {
                    let teamInfoJson = (await dynamoDb.getItem('Team', 'TeamPId', teamPId, ['Information']))['Information'];
                    if (teamInfoJson != null) {
                        if ('TrophyCase' in teamInfoJson) {
                            for (let i = 0; i < Object.keys(teamInfoJson['TrophyCase']).length; ++i) {
                                let sPId = Object.keys(teamInfoJson['TrophyCase'])[i];
                                teamInfoJson['TrophyCase'][sPId]['Seasonname'] = Season.getName(sPId);
                                teamInfoJson['TrophyCase'][sPId]['SeasonShortName'] = Season.getShortName(sPId);
                            }
                        }
                        cache.set(cacheKey, JSON.stringify(teamInfoJson, null, 2));
                        resolve(teamInfoJson);
                    }
                    else {
                        resolve({});    // If 'Information' does not exist
                    }
                }
                catch (err) { console.error(err); reject(500); }
            }
        });
    });
}

function getTeamScoutingBySeason(teamPId, sPId) {
    let cacheKey = keyBank.TEAM_SCOUT_PREFIX + teamPId + '-' + sPId;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, async (err, data) => {
            if (err) { console(err); reject(500); }
            else if (data != null) { resolve(JSON.parse(data)); }
            else {
                try {
                    let teamScoutingLogJson = (await dynamoDb.getItem('Team', 'TeamPId', teamPId, ['Scouting']))['Scouting'];
                    if (teamScoutingLogJson != null) {
                        let teamScoutingSeasonJson = teamScoutingLogJson[sPId];
                        if (teamScoutingSeasonJson == null) { console.error("This team does not have this Season logged."); reject(404); }
                        else {
                            teamScoutingSeasonJson['SeasonTime'] = await Season.getTime(sPId);
                            for (let i = 0; i < Object.values(teamScoutingSeasonJson['PlayerLog']).length; ++i) {
                                let roleMap = Object.values(teamScoutingSeasonJson['PlayerLog'])[i];
                                for (let j = 0; j < Object.keys(roleMap).length; ++j) {
                                    let profileHId = Object.keys(roleMap)[j];
                                    let statsJson = roleMap[profileHId];
                                    statsJson['ProfileName'] = await Profile.getName(profileHId);
                                    statsJson['TotalKdaPlayer'] = (statsJson['TotalDeathsPlayer'] > 0) ? ((statsJson['TotalKillsPlayer'] + statsJson['TotalAssistsPlayer']) / statsJson['TotalDeathsPlayer']).toFixed(2).toString() : "Perfect";
                                    statsJson['KillPctPlayer'] = ((statsJson['TotalKillsPlayer'] + statsJson['TotalAssistsPlayer']) / statsJson['TotalKillsTeam']).toFixed(4);
                                    statsJson['DamagePctPlayer'] = (statsJson['TotalDamagePlayer'] / statsJson['TotalDamageTeam']).toFixed(4);
                                    statsJson['GoldPctPlayer'] = (statsJson['TotalGoldPlayer'] / statsJson['TotalGoldTeam']).toFixed(4);
                                    statsJson['VsPctPlayer'] = (statsJson['TotalVsPlayer'] / statsJson['TotalVsTeam']).toFixed(4);
                                }
                            }
                            cache.set(cacheKey, JSON.stringify(teamScoutingSeasonJson, null, 2));
                            resolve(teamScoutingSeasonJson);
                        }
                    }
                    else {
                        resolve({});    // If 'Scouting' does not exist
                    }
                }
                catch (err) { console.error(err); reject(500); }
            }
        });
    });
}

function getTeamGamesBySeason(teamPId, sPId) {
    let cacheKey = keyBank.TEAM_GAMES_PREFIX + teamPId + '-' + sPId;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, async (err, data) => {
            if (err) { console(err); reject(500); }
            else if (data != null) { resolve(JSON.parse(data)); }
            else {
                try {
                    let teamGameLogJson = (await dynamoDb.getItem('Team', 'TeamPId', teamPId, ['GameLog']))['GameLog'];
                    if (teamGameLogJson != null) {
                        let teamSeasonGamesJson = teamGameLogJson[sPId];
                        if (teamSeasonGamesJson == null) { console.error("This team does not have this Season logged."); reject(404); }
                        else {
                            teamSeasonGamesJson['SeasonTime'] = Season.getTime(sPId);
                            for (let i = 0; i < Object.values(teamSeasonGamesJson['Matches']).length; ++i) {
                                let matchObject = Object.values(teamSeasonGamesJson['Matches'])[i];
                                for (let j = 0; j < Object.values(matchObject['ChampPicks']).length; ++j) {
                                    let champObject = Object.values(matchObject['ChampPicks'])[j];
                                    champObject['ProfileName'] = await Profile.getName(champObject['ProfileHId']);
                                }
                                matchObject['EnemyTeamName'] = await getTeamName(matchObject['EnemyTeamHId']);
                            }
                            cache.set(cacheKey, JSON.stringify(teamSeasonGamesJson, null, 2));
                            resolve(teamSeasonGamesJson);
                        }
                    }
                    else {
                        resolve({});    // If 'GameLog' does not exist
                    }
                }
                catch (err) { console.error(err); reject(500); }
            }
        });
    });
}

function getTeamStatsByTourney(teamPId, tPId) {
    let cacheKey = keyBank.TEAM_STATS_PREFIX + teamPId + '-' + tPId;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, async (err, data) => {
            if (err) { console(err); reject(500); }
            else if (data != null) resolve(JSON.parse(data));
            else {
                try {
                    let teamStatsLogJson = (await dynamoDb.getItem('Team', 'TeamPId', teamPId, ['StatsLog']))['StatsLog'];
                    if (teamStatsLogJson != null) {
                        let tourneyStatsJson = teamStatsLogJson[tPId];
                        if (tourneyStatsJson == null) { console.error("This team does not have this Tournament logged."); reject(404); }
                        else {
                            let totalGameDurationMinute = tourneyStatsJson['TotalGameDuration'] / 60;
                            tourneyStatsJson['TournamentName'] = await Tournament.getName(tPId);
                            tourneyStatsJson['GamesPlayedOnRed'] = tourneyStatsJson['GamesPlayed'] - tourneyStatsJson['GamesPlayedOnBlue'];
                            tourneyStatsJson['RedWins'] = tourneyStatsJson['GamesWon'] - tourneyStatsJson['BlueWins'];
                            tourneyStatsJson['AverageGameDuration'] = (tourneyStatsJson['TotalGameDuration'] / tourneyStatsJson['GamesPlayed']).toFixed(2);
                            tourneyStatsJson['AverageKills'] = (tourneyStatsJson['TotalKills'] / tourneyStatsJson['GamesPlayed']).toFixed(1);
                            tourneyStatsJson['AverageDeaths'] = (tourneyStatsJson['TotalDeaths'] / tourneyStatsJson['GamesPlayed']).toFixed(1);
                            tourneyStatsJson['KillDeathRatio'] = (tourneyStatsJson['TotalDeaths'] > 0) ? (tourneyStatsJson['TotalKills'] / tourneyStatsJson['TotalDeaths']).toFixed(2).toString() : "Perfect";
                            tourneyStatsJson['AverageAssists'] = (tourneyStatsJson['TotalAssists'] / tourneyStatsJson['GamesPlayed']).toFixed(1);
                            tourneyStatsJson['GoldPerMinute'] = (tourneyStatsJson['TotalGold'] / totalGameDurationMinute).toFixed(2);
                            tourneyStatsJson['DamagePerMinute'] = (tourneyStatsJson['TotalDamageDealt'] / totalGameDurationMinute).toFixed(2);
                            tourneyStatsJson['CreepScorePerMinute'] = (tourneyStatsJson['TotalCreepScore'] / totalGameDurationMinute).toFixed(2);
                            tourneyStatsJson['VisionScorePerMinute'] = (tourneyStatsJson['TotalVisionScore'] / totalGameDurationMinute).toFixed(2);
                            tourneyStatsJson['WardsPerMinute'] = (tourneyStatsJson['TotalWardsPlaced'] / totalGameDurationMinute).toFixed(2);
                            tourneyStatsJson['ControlWardsPerMinute'] = (tourneyStatsJson['TotalControlWardsBought'] / totalGameDurationMinute).toFixed(2);
                            tourneyStatsJson['WardsClearedPerMinute'] = (tourneyStatsJson['TotalWardsCleared'] / totalGameDurationMinute).toFixed(2);
                            tourneyStatsJson['AverageTowersTaken'] = (tourneyStatsJson['TotalTowersTaken'] / tourneyStatsJson['GamesPlayed']).toFixed(1);
                            tourneyStatsJson['AverageTowersLost'] = (tourneyStatsJson['TotalTowersLost'] / tourneyStatsJson['GamesPlayed']).toFixed(1);
                            tourneyStatsJson['FirstBloodPct'] = (tourneyStatsJson['TotalFirstBloods'] / tourneyStatsJson['GamesPlayed']).toFixed(4);
                            tourneyStatsJson['FirstTowerPct'] = (tourneyStatsJson['TotalFirstTowers'] / tourneyStatsJson['GamesPlayed']).toFixed(4);
                            tourneyStatsJson['AverageDragonsTaken'] = (tourneyStatsJson['TotalDragonsTaken'] / tourneyStatsJson['GamesPlayed']).toFixed(1);
                            tourneyStatsJson['DragonPct'] = (tourneyStatsJson['TotalDragonsTaken'] / (tourneyStatsJson['TotalDragonsTaken'] + tourneyStatsJson['TotalEnemyDragons'])).toFixed(4);
                            tourneyStatsJson['AverageHeraldsTaken'] = (tourneyStatsJson['TotalHeraldsTaken'] / tourneyStatsJson['GamesPlayed']).toFixed(1);
                            tourneyStatsJson['HeraldPct'] = (tourneyStatsJson['TotalHeraldsTaken'] / (tourneyStatsJson['TotalHeraldsTaken'] + tourneyStatsJson['TotalEnemyHeralds'])).toFixed(4);
                            tourneyStatsJson['AverageBaronsTaken'] = (tourneyStatsJson['TotalBaronsTaken'] / tourneyStatsJson['GamesPlayed']).toFixed(1);
                            tourneyStatsJson['BaronPct'] = (tourneyStatsJson['TotalBaronsTaken'] / (tourneyStatsJson['TotalBaronsTaken'] + tourneyStatsJson['TotalEnemyBarons'])).toFixed(4);
                            tourneyStatsJson['WardsClearedPct'] = (tourneyStatsJson['TotalWardsCleared'] / tourneyStatsJson['TotalEnemyWardsPlaced']).toFixed(4);
                            tourneyStatsJson['AverageXpDiffEarly'] = (tourneyStatsJson['TotalXpDiffEarly'] / tourneyStatsJson['GamesPlayedOverEarly']).toFixed(1);
                            tourneyStatsJson['AverageXpDiffMid'] = (tourneyStatsJson['TotalXpDiffMid'] / tourneyStatsJson['GamesPlayedOverMid']).toFixed(1);
                            tourneyStatsJson['AverageGoldDiffEarly'] = (tourneyStatsJson['TotalGoldDiffEarly'] / tourneyStatsJson['GamesPlayedOverEarly']).toFixed(1);
                            tourneyStatsJson['AverageGoldDiffMid'] = (tourneyStatsJson['TotalGoldDiffMid'] / tourneyStatsJson['GamesPlayedOverMid']).toFixed(1);
                            tourneyStatsJson['AverageCsDiffEarly'] = (tourneyStatsJson['TotalCsDiffEarly'] / tourneyStatsJson['GamesPlayedOverEarly']).toFixed(1);
                            tourneyStatsJson['AverageCsDiffMid'] = (tourneyStatsJson['TotalCsDiffMid'] / tourneyStatsJson['GamesPlayedOverMid']).toFixed(1);
                            cache.set(cacheKey, JSON.stringify(tourneyStatsJson, null, 2));
                            resolve(tourneyStatsJson);
                        }
                    }
                    else {
                        resolve({});    // If 'StatsLog' does not exist
                    }
                }
                catch (err) { console.error(err); reject(500); }
            }
        });
    });
}