module.exports = {
    getId: getTeamPId,
    getName: getTeamName,
    getInfo: getTeamInfo,
    getScouting: getTeamScoutingBySeason,
    getGames: getTeamGamesBySeason,
    getStats: getTeamStatsByTourney,
    postNew: postNewTeam,
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
            if (err) { console.error(err); reject(err); return; }
            else if (data != null) { resolve(data); return; }
            dynamoDb.getItem('TeamNameMap', 'TeamName', simpleName)
            .then((obj) => {
                if (obj == null) { resolve(null); return; } // Not Found
                let tPId = helper.getTeamPId(obj['TeamHId']);
                cache.set(cacheKey, tPId);
                resolve(tPId);
            }).catch((ex) => { console.error(ex); reject(ex) });
        });
    });
}

// Get TeamName from DynamoDb
function getTeamName(tHId) {
    let tPId = helper.getTeamPId(tHId);
    let cacheKey = keyBank.TEAM_NAME_PREFIX + tPId;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, (err, data) => {
            if (err) { console.error(err); reject(err); return; }
            else if (data != null) { resolve(data); return; }
            dynamoDb.getItem('Team', 'TeamPId', tPId)
            .then((obj) => {
                if (obj == null) { resolve(null); return; } // Not Found
                let name = obj['TeamName'];
                cache.set(cacheKey, name);
                resolve(name);
            }).catch((ex) => { console.error(ex); reject(ex); });
        });
    });
}

function getTeamInfo(teamPId) {
    let cacheKey = keyBank.TEAM_INFO_PREFIX + teamPId;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, async (err, data) => {
            if (err) { console(err); reject(err); return; }
            else if (data != null) { resolve(JSON.parse(data)); return; }
            try {
                let teamInfoJson = (await dynamoDb.getItem('Team', 'TeamPId', teamPId))['Information'];
                if (teamInfoJson != null) {
                    if ('TrophyCase' in teamInfoJson) {
                        for (let i = 0; i < Object.keys(teamInfoJson['TrophyCase']).length; ++i) {
                            let sPId = Object.keys(teamInfoJson['TrophyCase'])[i];
                            teamInfoJson['TrophyCase'][sPId]['Seasonname'] = Season.getName(sPId);
                            teamInfoJson['TrophyCase'][sPId]['SeasonShortName'] = Season.getShortName(sPId);
                        }
                    }
                    // Add Season List
                    let gameLogJson = (await dynamoDb.getItem('Team', 'TeamPId', teamPId))['GameLog'];
                    if (gameLogJson != null) {
                        teamInfoJson['SeasonList'] = await helper.getSeasonItems(Object.keys(gameLogJson));
                    }
                    // Add Tournament List
                    let statsLogJson = (await dynamoDb.getItem('Team', 'TeamPId', teamPId))['StatsLog'];
                    if (statsLogJson != null) {
                        teamInfoJson['TournamentList'] = await helper.getTourneyItems(Object.keys(statsLogJson));
                    }
                    cache.set(cacheKey, JSON.stringify(teamInfoJson, null, 2));
                    resolve(teamInfoJson);
                }
                else {
                    resolve({});    // If 'Information' does not exist
                }
            }
            catch (ex) { console.error(ex); reject(ex); }
        });
    });
}

// Returns Object
function getTeamScoutingBySeason(teamPId, sPId=null) {
    let cacheKey = keyBank.TEAM_SCOUT_PREFIX + teamPId + '-' + sPId;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, async (err, data) => {
            if (err) { console(err); reject(err); return; }
            else if (data != null) { resolve(JSON.parse(data)); return; }
            try {
                let scoutingJson = (await dynamoDb.getItem('Team', 'TeamPId', teamPId))['Scouting'];
                if (scoutingJson != null) {
                    let seasonId = (sPId) ? sPId : (Math.max(...Object.keys(scoutingJson)));    // if season parameter Id is null, find latest
                    let teamScoutingSeasonJson = scoutingJson[seasonId];
                    //if (teamScoutingSeasonJson == null) { console.error("This team does not have this Season logged."); reject(404); }
                    if (teamScoutingSeasonJson == null) { resolve(null); return; } // Not Found
                    teamScoutingSeasonJson['SeasonTime'] = await Season.getTime(seasonId);
                    teamScoutingSeasonJson['SeasonName'] = await Season.getName(seasonId);
                    teamScoutingSeasonJson['SeasonShortName'] = await Season.getShortName(seasonId);
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
                else {
                    if (sPId == null) { resolve({}) }   // If 'Scouting' does not exist
                    //else { console.error("This team does not have any Games logged."); reject(404); }
                    else { resolve(null); }
                }
            }
            catch (ex) { console.error(ex); reject(ex); }
        });
    });
}

// Returns Object
function getTeamGamesBySeason(teamPId, sPId=null) {
    let cacheKey = keyBank.TEAM_GAMES_PREFIX + teamPId + '-' + sPId;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, async (err, data) => {
            if (err) { console(err); reject(err); return; }
            else if (data != null) { resolve(JSON.parse(data)); return; }
            try {
                let gameLogJson = (await dynamoDb.getItem('Team', 'TeamPId', teamPId))['GameLog'];
                if (gameLogJson != null) {
                    let seasonId = (sPId) ? sPId : (Math.max(...Object.keys(gameLogJson)));    // if season parameter Id is null, find latest
                    let teamSeasonGamesJson = gameLogJson[seasonId];
                    //if (teamSeasonGamesJson == null) { console.error("This team does not have this Season logged."); reject(404); }
                    if (teamSeasonGamesJson == null) { resolve(null); return; } // Not Found
                    teamSeasonGamesJson['SeasonTime'] = await Season.getTime(seasonId);
                    teamSeasonGamesJson['SeasonName'] = await Season.getName(seasonId);
                    teamSeasonGamesJson['SeasonShortName'] = await Season.getShortName(seasonId);
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
                else {
                    if (sPId == null) { resolve({}); }  // If 'GameLog' does not exist
                    //else { console.error("This team does not have any Games logged."); reject(404); }
                    else { resolve(null); } // Not Found
                }
            }
            catch (ex) { console.error(ex); reject(ex); }
        });
    });
}

// Returns Object
function getTeamStatsByTourney(teamPId, tPId=null) {
    let cacheKey = keyBank.TEAM_STATS_PREFIX + teamPId + '-' + tPId;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, async (err, data) => {
            if (err) { console(err); reject(err); return; }
            else if (data != null) { resolve(JSON.parse(data)); return; }
            try {
                let statsLogJson = (await dynamoDb.getItem('Team', 'TeamPId', teamPId))['StatsLog'];
                if (statsLogJson != null) {
                    let tourneyId = (tPId) ? tPId : (Math.max(...Object.keys(statsLogJson)));    // if tourney parameter Id is null, find latest
                    let tourneyStatsJson = statsLogJson[tourneyId];
                    //if (tourneyStatsJson == null) { console.error("This team does not have this Tournament logged."); reject(404); }
                    if (tourneyStatsJson == null) { resolve(null); return; } // Not Found
                    tourneyStatsJson['TournamentName'] = await Tournament.getName(tourneyId);
                    tourneyStatsJson['TournamentShortName'] = await Tournament.getShortName(tourneyId);
                    let totalGameDurationMinute = tourneyStatsJson['TotalGameDuration'] / 60;
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
                else {
                    if (tPId == null) { resolve({}); }  // If 'StatsLog' does not exist
                    //else { console.error("This team does not have any Games logged."); reject(404); }
                    else { resolve(null); } // Not Found
                }
            }
            catch (ex) { console.error(ex); reject(ex); }
        });
    });
}

// Add new Team to "Team", "TeamNameMap"
function postNewTeam(newTeamItem, teamId) {
    return new Promise(async (resolve, reject) => {
        try {
            // Add to 'Team' Table
            await dynamoDb.putItem('Team', newTeamItem, teamId);
            // Add to 'TeamNameMap' Table
            let simpleTeamName = helper.filterName(newTeamItem['TeamName']);
            let newTeamMap = {
                'TeamName': simpleTeamName,
                'TeamHId': helper.getTeamHId(teamId),
            }
            await dynamoDb.putItem('TeamNameMap', newTeamMap, simpleTeamName);
            // Cache set Key: TEAM_INFO_PREFIX
            let cacheKey = keyBank.TEAM_INFO_PREFIX + teamId;
            cache.set(cacheKey, JSON.stringify(newTeamItem['Information'], null, 2));
            resolve({
                'TeamName': newTeamItem['TeamName'],
                'TeamPId': teamId,
            });
        }
        catch (err) { console.error(err); reject(err); }
    });
}