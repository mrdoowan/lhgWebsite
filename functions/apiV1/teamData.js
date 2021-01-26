/*  Declaring npm modules */
require('dotenv').config({ path: '../../.env' });
const redis = require('redis');
const cache = (process.env.NODE_ENV === 'production') ? redis.createClient(process.env.REDIS_URL) : redis.createClient(process.env.REDIS_PORT);

/*  Import dependency modules */
const GLOBAL = require('./dependencies/global');
const dynamoDb = require('./dependencies/dynamoDbHelper');
const mySql = require('./dependencies/mySqlHelper');
const keyBank = require('./dependencies/cacheKeys');
// Data Functions
import {
    getSeasonName,
    getSeasonShortName,
    getSeasonTime,
} from './seasonData';
import {
    getTournamentName,
    getTournamentShortName
} from './tournamentData';
import { getProfileName } from './profileData';

/**
 * Get the TeamPId of its Name from DynamoDb
 * @param {string} name       Team's name
 */
// Get TeamPId from TeamName
export const getTeamPId = (name) => {
    let simpleName = GLOBAL.filterName(name);
    const cacheKey = keyBank.TEAM_PID_PREFIX + simpleName;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, (err, data) => {
            if (err) { console.error(err); reject(err); return; }
            else if (data != null) { resolve(data); return; }
            dynamoDb.getItem('TeamNameMap', 'TeamName', simpleName)
            .then((obj) => {
                if (obj == null) { resolve(null); return; } // Not Found
                const tPId = GLOBAL.getTeamPId(obj['TeamHId']);
                cache.set(cacheKey, tPId);
                resolve(tPId);
            }).catch((ex) => { console.error(ex); reject(ex) });
        });
    });
}

/**
 * Get the TeamName of its hash ID from DynamoDb
 * @param {string} teamHId       Team's hash
 */
// Get TeamName from DynamoDb
export const getTeamName = (teamHId) => {
    let tPId = GLOBAL.getTeamPId(teamHId);
    const cacheKey = keyBank.TEAM_NAME_PREFIX + tPId;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, (err, data) => {
            if (err) { console.error(err); reject(err); return; }
            else if (data != null) { resolve(data); return; }
            dynamoDb.getItem('Team', 'TeamPId', tPId)
            .then((obj) => {
                if (obj == null) { resolve(null); return; } // Not Found
                const name = obj['TeamName'];
                cache.set(cacheKey, name);
                resolve(name);
            }).catch((ex) => { console.error(ex); reject(ex); });
        });
    });
}

/**
 * Get the TeamShortName of its hash ID from DynamoDb
 * @param {string} teamHId       Team's hash
 */
// Get Shortname from DynamoDb
export const getTeamShortName = (teamHId) => {
    let tPId = GLOBAL.getTeamPId(teamHId);
    const cacheKey = keyBank.TEAM_SHORTNAME_PREFIX + tPId;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, (err, data) => {
            if (err) { console.error(err); reject(err); return; }
            else if (data != null) { resolve(data); return; }
            dynamoDb.getItem('Team', 'TeamPId', tPId)
            .then((obj) => {
                if (obj == null) { resolve(null); return; } // Not Found
                const shortName = obj['Information']['TeamShortName'];
                cache.set(cacheKey, shortName);
                resolve(shortName);
            }).catch((ex) => { console.error(ex); reject(ex); });
        });
    });
}

export const getTeamInfo = (teamPId) => {
    const cacheKey = keyBank.TEAM_INFO_PREFIX + teamPId;
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
                            teamInfoJson['TrophyCase'][sPId]['Seasonname'] = getSeasonName(sPId);
                            teamInfoJson['TrophyCase'][sPId]['SeasonShortName'] = getSeasonShortName(sPId);
                        }
                    }
                    // Add Season List
                    let gameLogJson = (await dynamoDb.getItem('Team', 'TeamPId', teamPId))['GameLog'];
                    if (gameLogJson != null) {
                        teamInfoJson['SeasonList'] = await GLOBAL.getSeasonItems(Object.keys(gameLogJson));
                    }
                    // Add Tournament List
                    let statsLogJson = (await dynamoDb.getItem('Team', 'TeamPId', teamPId))['StatsLog'];
                    if (statsLogJson != null) {
                        teamInfoJson['TournamentList'] = await GLOBAL.getTourneyItems(Object.keys(statsLogJson));
                    }
                    cache.set(cacheKey, JSON.stringify(teamInfoJson, null, 2), 'EX', GLOBAL.TTL_DURATION);
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
export const getTeamScoutingBySeason = (teamPId, sPId=null) => {
    return new Promise(async function(resolve, reject) {
        try {
            let scoutingJson = (await dynamoDb.getItem('Team', 'TeamPId', teamPId))['Scouting'];
            if (scoutingJson != null) {
                const seasonId = (sPId) ? sPId : (Math.max(...Object.keys(scoutingJson)));    // if season parameter Id is null, find latest
                const cacheKey = keyBank.TEAM_SCOUT_PREFIX + teamPId + '-' + seasonId;
                cache.get(cacheKey, async (err, data) => {
                    if (err) { console(err); reject(err); return; }
                    else if (data != null) { resolve(JSON.parse(data)); return; }
                    let teamScoutingSeasonJson = scoutingJson[seasonId];
                    if (teamScoutingSeasonJson == null) { resolve(null); return; } // Not Found

                    // Process Data
                    teamScoutingSeasonJson['SeasonTime'] = await getSeasonTime(seasonId);
                    teamScoutingSeasonJson['SeasonName'] = await getSeasonName(seasonId);
                    teamScoutingSeasonJson['SeasonShortName'] = await getSeasonShortName(seasonId);
                    for (let i = 0; i < Object.values(teamScoutingSeasonJson['PlayerLog']).length; ++i) {
                        let roleMap = Object.values(teamScoutingSeasonJson['PlayerLog'])[i];
                        for (let j = 0; j < Object.keys(roleMap).length; ++j) {
                            let profileHId = Object.keys(roleMap)[j];
                            let statsJson = roleMap[profileHId];
                            statsJson['ProfileName'] = await getProfileName(profileHId);
                            statsJson['TotalKdaPlayer'] = (statsJson['TotalDeathsPlayer'] > 0) ? ((statsJson['TotalKillsPlayer'] + statsJson['TotalAssistsPlayer']) / statsJson['TotalDeathsPlayer']).toFixed(2).toString() : "Perfect";
                            statsJson['KillPctPlayer'] = (statsJson['TotalKillsTeam'] == 0) ? 0 : ((statsJson['TotalKillsPlayer'] + statsJson['TotalAssistsPlayer']) / statsJson['TotalKillsTeam']).toFixed(4);
                            statsJson['DamagePctPlayer'] = (statsJson['TotalDamagePlayer'] / statsJson['TotalDamageTeam']).toFixed(4);
                            statsJson['GoldPctPlayer'] = (statsJson['TotalGoldPlayer'] / statsJson['TotalGoldTeam']).toFixed(4);
                            statsJson['VsPctPlayer'] = (statsJson['TotalVsPlayer'] / statsJson['TotalVsTeam']).toFixed(4);
                        }
                    }
                    cache.set(cacheKey, JSON.stringify(teamScoutingSeasonJson, null, 2), 'EX', GLOBAL.TTL_DURATION);
                    resolve(teamScoutingSeasonJson);
                });
            }
            else {
                if (sPId == null) { resolve({}) }   // If 'Scouting' does not exist
                else { resolve(null); }             // Not Found
            }
        }
        catch (ex) { console.error(ex); reject(ex); }
    });
}

// Returns Object
export const getTeamGamesBySeason = (teamPId, sPId=null) => {
    return new Promise(async function(resolve, reject) {
        try {
            let teamObject = await dynamoDb.getItem('Team', 'TeamPId', teamPId);
            if (teamObject != null) {
                let gameLogJson = teamObject['GameLog'];
                const seasonId = (sPId) ? sPId : (Math.max(...Object.keys(gameLogJson)));    // if season parameter Id is null, find latest
                const cacheKey = keyBank.TEAM_GAMES_PREFIX + teamPId + '-' + seasonId;
                cache.get(cacheKey, async (err, data) => {
                    if (err) { console(err); reject(err); return; }
                    else if (data != null) { resolve(JSON.parse(data)); return; }
                    let teamSeasonGamesJson = gameLogJson[seasonId];
                    if (teamSeasonGamesJson == null) { resolve(null); return; } // Not Found

                    // Process Data
                    teamSeasonGamesJson['SeasonTime'] = await getSeasonTime(seasonId);
                    teamSeasonGamesJson['SeasonName'] = await getSeasonName(seasonId);
                    teamSeasonGamesJson['SeasonShortName'] = await getSeasonShortName(seasonId);
                    for (let i = 0; i < Object.values(teamSeasonGamesJson['Matches']).length; ++i) {
                        let matchObject = Object.values(teamSeasonGamesJson['Matches'])[i];
                        for (let j = 0; j < Object.values(matchObject['ChampPicks']).length; ++j) {
                            let champObject = Object.values(matchObject['ChampPicks'])[j];
                            champObject['ProfileName'] = await getProfileName(champObject['ProfileHId']);
                        }
                        matchObject['EnemyTeamName'] = await getTeamName(matchObject['EnemyTeamHId']);
                    }
                    cache.set(cacheKey, JSON.stringify(teamSeasonGamesJson, null, 2), 'EX', GLOBAL.TTL_DURATION);
                    resolve(teamSeasonGamesJson);
                });
            }
            else {
                if (sPId == null) { resolve({}); }  // If 'GameLog' does not exist
                else { resolve(null); }             // Not Found
            }
        }
        catch (ex) { console.error(ex); reject(ex); }
    });
}

// Returns Object
export const getTeamStatsByTourney = (teamPId, tPId=null) => {
    return new Promise(async function(resolve, reject) {
        try {
            let teamObject = await dynamoDb.getItem('Team', 'TeamPId', teamPId);
            if (teamObject != null) {
                let statsLogJson = teamObject['StatsLog'];
                const tourneyId = (tPId) ? tPId : (Math.max(...Object.keys(statsLogJson)));    // if tourney parameter Id is null, find latest
                const cacheKey = keyBank.TEAM_STATS_PREFIX + teamPId + '-' + tourneyId;
                cache.get(cacheKey, async (err, data) => {
                    if (err) { console(err); reject(err); return; }
                    else if (data != null) { resolve(JSON.parse(data)); return; }
                    let tourneyStatsJson = statsLogJson[tourneyId];
                    if (tourneyStatsJson == null) { resolve(null); return; } // Not Found

                    // Process Data
                    tourneyStatsJson['TournamentName'] = await getTournamentName(tourneyId);
                    tourneyStatsJson['TournamentShortName'] = await getTournamentShortName(tourneyId);
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
                    cache.set(cacheKey, JSON.stringify(tourneyStatsJson, null, 2), 'EX', GLOBAL.TTL_DURATION);
                    resolve(tourneyStatsJson);
                });
            }
            else {
                if (tPId == null) { resolve({}); }  // If 'StatsLog' does not exist
                //else { console.error("This team does not have any Games logged."); reject(404); }
                else { resolve(null); } // Not Found
            }
        }
        catch (ex) { console.error(ex); reject(ex); }
    });
}

// Add new teams into the DB
// BODY EXAMPLE:
// {
//     "teamName": "NAME",
//     "shortName": "XXX",
// }
// Add new Team to "Team", "TeamNameMap"
export const postNewTeam = (teamName, shortName) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Generate new Team PId
            let newPId = await GLOBAL.generateNewPId('Team');
            let newTeamItem = {
                'Information': {
                    'TeamName': teamName,
                    'TeamShortName': shortName,
                },
                'TeamName': teamName,
                'TeamPId': newPId,
            }
            // Add to 'Team' Table
            await dynamoDb.putItem('Team', newTeamItem, newPId);
            // Add to 'TeamNameMap' Table
            let simpleTeamName = GLOBAL.filterName(newTeamItem['TeamName']);
            let newTeamMap = {
                'TeamName': simpleTeamName,
                'TeamHId': GLOBAL.getTeamHId(newPId),
            }
            await dynamoDb.putItem('TeamNameMap', newTeamMap, simpleTeamName);
            
            resolve({
                'TeamName': newTeamItem['TeamName'],
                'TeamPId': newPId,
            });
        }
        catch (err) { console.error(err); reject(err); }
    });
}

// Doing both "GameLog" and "StatsLog" for Team Item
export const updateTeamGameLog = (teamPId, tournamentPId) => {
    return new Promise(async (resolve, reject) => {
        try {
            let tourneyDbObject = await dynamoDb.getItem('Tournament', 'TournamentPId', tournamentPId);
            let seasonPId = tourneyDbObject['Information']['SeasonPId'];
            let teamDbObject = await dynamoDb.getItem('Team', 'TeamPId', teamPId);

            /*  
                -------------------
                Init DynamoDB Items
                -------------------
            */
            // #region Init Items
            // Check 'GameLog' exists in TeamItem
            const initTeamSeasonGames = {
                'Matches': {}
            };
            const initTeamGameLog = { [seasonPId]: initTeamSeasonGames };
            if (!('GameLog' in teamDbObject)) {
                await dynamoDb.updateItem('Team', 'TeamPId', teamPId,
                    'SET #gLog = :val',
                    {
                        '#gLog': 'GameLog'
                    }, 
                    {
                        ':val': initTeamGameLog
                    }
                );
                teamDbObject['GameLog'] = initTeamGameLog;
            }
            else if (!(seasonPId in teamDbObject['GameLog'])) {
                await dynamoDb.updateItem('Team', 'TeamPId', teamPId,
                    'SET #gLog.#sId = :val',
                    {
                        '#gLog': 'GameLog',
                        '#sId': seasonPId,
                    },
                    {
                        ':val': initTeamSeasonGames
                    }
                );
                teamDbObject['GameLog'][seasonPId] = initTeamSeasonGames;
            }
            // Check 'Scouting' exists in TeamItem 
            const initTeamScouting = { [seasonPId]: {} };
            if (!('Scouting' in teamDbObject)) {
                await dynamoDb.updateItem('Team', 'TeamPId', teamPId, 
                    'SET #sct = :val',
                    {
                        '#sct': 'Scouting'
                    },
                    {
                        ':val': initTeamScouting
                    }
                );
                teamDbObject['Scouting'] = initTeamScouting;
            }
            else if (!(seasonPId in teamDbObject['Scouting'])) {
                teamDbObject['Scouting'][seasonPId] = {};
            }
            // #endregion

            // Shallow Copy
            let scoutingItem = teamDbObject['Scouting'][seasonPId];
            let gameLogTeamItem = teamDbObject['GameLog'][seasonPId]['Matches'];

            /*  
                -------------
                Game Log
                -------------
            */
            // #region Compile Data
            let teamMatchesSqlListTourney = await mySql.callSProc('teamMatchesByTournamentPId', teamPId, tournamentPId);
            for (let matchIdx = 0; matchIdx < teamMatchesSqlListTourney.length; ++matchIdx) {
                let sqlTeamMatch = teamMatchesSqlListTourney[matchIdx];
                let matchPId = sqlTeamMatch.riotMatchId;

                // Additional sProcs from MySQL
                let playerStatsSqlList = await mySql.callSProc('playerStatsByMatchIdTeamId', matchPId, teamPId);
                let bannedChampMatchSqlList = await mySql.callSProc('bannedChampsByMatchId', matchPId);
                
                let teamGameItem = {
                    'DatePlayed': sqlTeamMatch.datePlayed,
                    'TournamentType': sqlTeamMatch.tournamentType,
                    'GameWeekNumber': 0, // N/A
                    'ChampPicks': {},
                    'Side': sqlTeamMatch.side,
                    'Win': (sqlTeamMatch.win == 1) ? true : false,
                    'Vacated': false,
                    'EnemyTeamHId': GLOBAL.getTeamHId((sqlTeamMatch.side === 'Blue') ? sqlTeamMatch.redTeamPId : sqlTeamMatch.blueTeamPId),
                    'GameDuration': sqlTeamMatch.duration,
                    'Kills': sqlTeamMatch.totalKills,
                    'Deaths': sqlTeamMatch.totalDeaths,
                    'Assists': sqlTeamMatch.totalAssists,
                    'GoldPerMinute': sqlTeamMatch.goldPerMin,
                    'GoldDiffEarly': sqlTeamMatch.goldDiffEarly,
                    'GoldDiffMid': sqlTeamMatch.goldDiffMid,
                    'BannedByTeam': [],
                    'BannedAgainst': [],
                };
                for (let playerIdx = 0; playerIdx < playerStatsSqlList.length; ++playerIdx) {
                    let playerSqlRow = playerStatsSqlList[playerIdx];
                    teamGameItem['ChampPicks'][playerSqlRow.role] = { 
                        'ProfileHId': GLOBAL.getProfileHId(playerSqlRow.profilePId),
                        'ChampId': playerSqlRow.champId,
                        'PlayerKills': playerSqlRow.kills,
                        'PlayerDeaths': playerSqlRow.deaths,
                        'PlayerAssists': playerSqlRow.assists,
                        'PlayerGoldDiffEarly': playerSqlRow.goldDiffEarly,
                        'PlayerGoldDiffMid': playerSqlRow.goldDiffMid,
                    };
                }
                for (let k = 0; k < bannedChampMatchSqlList.length; ++k) {
                    let champSqlRow = bannedChampMatchSqlList[k];
                    if (champSqlRow.teamBannedById == teamPId) { teamGameItem['BannedByTeam'].push(champSqlRow.champId); }
                    else { teamGameItem['BannedAgainst'].push(champSqlRow.champId); }
                }
                gameLogTeamItem[matchPId] = teamGameItem;
            }
            // #endregion

            /*  
                -------------
                'Scouting' (Season Id dependent)
                -------------
            */
            // #region Compile Data
            // Banned Champs List
            const sqlTeamSeasonStats = (await mySql.callSProc('teamStatsBySeasonId', teamPId, seasonPId))[0];
            scoutingItem['Ongoing'] = false;
            scoutingItem['GamesPlayed'] = sqlTeamSeasonStats.gamesPlayed;
            scoutingItem['GamesWin'] = sqlTeamSeasonStats.gamesWin;
            scoutingItem['BannedByTeam'] = {};
            scoutingItem['BannedAgainstTeam'] = {};
            const bannedChampsSeasonSqlList = await mySql.callSProc('bannedChampsByTeamIdSeasonId', teamPId, seasonPId);
            for (let champIdx = 0; champIdx < bannedChampsSeasonSqlList.length; ++champIdx) {
                const champSqlRow = bannedChampsSeasonSqlList[champIdx];
                if (champSqlRow.teamBannedById == teamPId) { 
                    if (!(champSqlRow.champId in scoutingItem['BannedByTeam'])) {
                        scoutingItem['BannedByTeam'][champSqlRow.champId] = 0;
                    }
                    scoutingItem['BannedByTeam'][champSqlRow.champId]++;
                }
                else {
                    if (!(champSqlRow.champId in scoutingItem['BannedAgainstTeam'])) {
                        scoutingItem['BannedAgainstTeam'][champSqlRow.champId] = 0;
                    }
                    scoutingItem['BannedAgainstTeam'][champSqlRow.champId]++;
                }
            }
            // Player Log
            const playerScoutingSqlList = await mySql.callSProc('playerStatsTotalByTeamIdSeasonId', teamPId, seasonPId);
            let playerLog = {};
            for (let playerIdx = 0; playerIdx < playerScoutingSqlList.length; ++playerIdx) {
                const playerSqlRow = playerScoutingSqlList[playerIdx];
                const role = playerSqlRow.playerRole;
                if (!(role in playerLog)) {
                    playerLog[role] = {};
                }
                const { profilePId } = playerSqlRow;
                const profileHId = GLOBAL.getProfileHId(profilePId);
                if (!(profileHId in playerLog[role])) {
                    // New entry
                    playerLog[role][profileHId] = {
                        'GamesPlayed': playerSqlRow.gamesPlayed,
                        'TotalKillsPlayer': playerSqlRow.totalKills,
                        'TotalDeathsPlayer': playerSqlRow.totalDeaths,
                        'TotalAssistsPlayer': playerSqlRow.totalAssists,
                        'TotalDamagePlayer': playerSqlRow.totalDamage,
                        'TotalGoldPlayer': playerSqlRow.totalGold,
                        'TotalVsPlayer': playerSqlRow.totalVisionScore,
                        'TotalKillsTeam': playerSqlRow.totalTeamKills,
                        'TotalDamageTeam': playerSqlRow.totalTeamDamage,
                        'TotalGoldTeam': playerSqlRow.totalTeamGold,
                        'TotalVsTeam': playerSqlRow.totalTeamVisionScore,
                        'ChampsPlayed': {}
                    };
                }
                const champStatsSqlList = await mySql.callSProc('champStatsByProfileIdTeamIdRoleSeasonId', profilePId, teamPId, role, seasonPId, GLOBAL.MINUTE_AT_EARLY, GLOBAL.MINUTE_AT_MID);
                let champsPlayed = playerLog[role][profileHId]['ChampsPlayed'];
                for (let champIdx = 0; champIdx < champStatsSqlList.length; ++champIdx) {
                    const champStats = champStatsSqlList[champIdx];
                    const { champId } = champStats;
                    champsPlayed[champId] = {};
                    champsPlayed[champId]['GamesPlayed'] = champStats.gamesPlayed;
                    champsPlayed[champId]['GamesWon'] = champStats.gamesWin;
                    champsPlayed[champId]['TotalKills'] = champStats.totalKills;
                    champsPlayed[champId]['TotalDeaths'] = champStats.totalDeaths;
                    champsPlayed[champId]['TotalAssists'] = champStats.totalAssists;
                    champsPlayed[champId]['TotalDuration'] = champStats.totalDuration;
                    champsPlayed[champId]['TotalGold'] = champStats.totalGold;
                    champsPlayed[champId]['TotalCreepScore'] = champStats.totalCreepScore;
                    champsPlayed[champId]['TotalVisionScore'] = champStats.totalVisionScore;
                    champsPlayed[champId]['GamesPlayedEarly'] = champStats.gamesPlayedOverEarly;
                    champsPlayed[champId]['GamesPlayedMid'] = champStats.gamesPlayedOverMid;
                    champsPlayed[champId]['TotalGoldDiffEarly'] = champStats.totalGoldDiffEarly;
                    champsPlayed[champId]['TotalGoldDiffMid'] = champStats.totalGoldDiffMid;
                }
            }
            scoutingItem['PlayerLog'] = playerLog;
            // #endregion

            /*  
                ----------
                Push into DB
                ----------
            */
            await dynamoDb.updateItem('Team', 'TeamPId', teamPId,
                'SET #gLog.#sId.#mtchs = :val',
                {
                    '#gLog': 'GameLog',
                    '#sId': seasonPId,
                    '#mtchs': 'Matches'
                },
                {
                    ':val': gameLogTeamItem
                }
            );
            await dynamoDb.updateItem('Team', 'TeamPId', teamPId, 
                'SET #scout.#sId = :val',
                {
                    '#scout': 'Scouting',
                    '#sId': seasonPId
                },
                {
                    ':val': scoutingItem
                }
            );
            // Remove cache
            cache.del(keyBank.TEAM_GAMES_PREFIX + teamPId + '-' + seasonPId);
            cache.del(keyBank.TEAM_SCOUT_PREFIX + teamPId + '-' + seasonPId);
            
            resolve({
                teamId: teamPId,
                tournamentId: tournamentPId,
                seasonId: seasonPId,
                numberMatches: teamMatchesSqlListTourney.length,
                typeUpdated: 'GameLog',
            });
        }
        catch (err) { reject({error: err}) }
    });
}

// Update Stats Log
export const updateTeamStatsLog = (teamPId, tournamentPId) => {
    return new Promise(async (resolve, reject) => {
        try {
            let teamDbObject = await dynamoDb.getItem('Team', 'TeamPId', teamPId);

            /*  
                -------------------
                Init DynamoDB Items
                -------------------
            */
            // #region Init items
            // Check 'StatsLog' exists in TeamItem
            const initTeamStatsLog = { [tournamentPId]: {} };
            if (!('StatsLog' in teamDbObject)) {
                await dynamoDb.updateItem('Team', 'TeamPId', teamPId,
                    'SET #sLog = :val',
                    { 
                        '#sLog': 'StatsLog'
                    },
                    { 
                        ':val': initTeamStatsLog
                    }
                );
                teamDbObject['StatsLog'] = initTeamStatsLog;
            }
            // Check if that tournamentId in StatsLog
            else if (!(tournamentPId in teamDbObject['StatsLog'])) {
                teamDbObject['StatsLog'][tournamentPId] = {};
            }
            //#endregion

            // Shallow Copy
            let tourneyTeamStatsItem = teamDbObject['StatsLog'][tournamentPId];

            /*  
                -------------
                'StatsLog' (TournamentId dependent)
                -------------
            */
            // #region Compile Data
            let sqlTeamStatsTotal = (await mySql.callSProc('teamStatsTotalByTournamentPId', teamPId, tournamentPId, GLOBAL.MINUTE_AT_EARLY, GLOBAL.MINUTE_AT_MID))[0];
            tourneyTeamStatsItem['GamesPlayed'] = sqlTeamStatsTotal.gamesPlayed;
            tourneyTeamStatsItem['GamesPlayedOverEarly'] = sqlTeamStatsTotal.gamesPlayedOverEarly;
            tourneyTeamStatsItem['GamesPlayedOverMid'] = sqlTeamStatsTotal.gamesPlayedOverMid;
            tourneyTeamStatsItem['GamesWon'] = sqlTeamStatsTotal.totalWins;
            tourneyTeamStatsItem['GamesPlayedOnBlue'] = sqlTeamStatsTotal.gamesPlayedOnBlue;
            tourneyTeamStatsItem['BlueWins'] = sqlTeamStatsTotal.totalBlueWins;
            tourneyTeamStatsItem['TotalGameDuration'] = sqlTeamStatsTotal.totalDuration;
            tourneyTeamStatsItem['TotalXpDiffEarly'] = sqlTeamStatsTotal.totalXpDiffEarly;
            tourneyTeamStatsItem['TotalXpDiffMid'] = sqlTeamStatsTotal.totalXpDiffMid;
            tourneyTeamStatsItem['TotalGold'] = sqlTeamStatsTotal.totalGold;
            tourneyTeamStatsItem['TotalGoldDiffEarly'] = sqlTeamStatsTotal.totalGoldDiffEarly;
            tourneyTeamStatsItem['TotalGoldDiffMid'] = sqlTeamStatsTotal.totalGoldDiffMid;
            tourneyTeamStatsItem['TotalCreepScore'] = sqlTeamStatsTotal.totalCreepScore;
            tourneyTeamStatsItem['TotalCsDiffEarly'] = sqlTeamStatsTotal.totalCsDiffEarly;
            tourneyTeamStatsItem['TotalCsDiffMid'] = sqlTeamStatsTotal.totalCsDiffMid;
            tourneyTeamStatsItem['TotalDamageDealt'] = sqlTeamStatsTotal.totalDamageDealt;
            tourneyTeamStatsItem['TotalFirstBloods'] = sqlTeamStatsTotal.totalFirstBloods;
            tourneyTeamStatsItem['TotalFirstTowers'] = sqlTeamStatsTotal.totalFirstTowers;
            tourneyTeamStatsItem['TotalKills'] = sqlTeamStatsTotal.totalKills;
            tourneyTeamStatsItem['TotalDeaths'] = sqlTeamStatsTotal.totalDeaths;
            tourneyTeamStatsItem['TotalAssists'] = sqlTeamStatsTotal.totalAssists;
            tourneyTeamStatsItem['TotalTowersTaken'] = sqlTeamStatsTotal.totalTeamTowers;
            tourneyTeamStatsItem['TotalTowersLost'] = sqlTeamStatsTotal.totalEnemyTowers;
            tourneyTeamStatsItem['TotalDragonsTaken'] = sqlTeamStatsTotal.totalTeamDragons;
            tourneyTeamStatsItem['TotalEnemyDragons'] = sqlTeamStatsTotal.totalEnemyDragons;
            tourneyTeamStatsItem['TotalHeraldsTaken'] = sqlTeamStatsTotal.totalTeamHeralds;
            tourneyTeamStatsItem['TotalEnemyHeralds'] = sqlTeamStatsTotal.totalEnemyHeralds;
            tourneyTeamStatsItem['TotalBaronsTaken'] = sqlTeamStatsTotal.totalTeamBarons;
            tourneyTeamStatsItem['TotalEnemyBarons'] = sqlTeamStatsTotal.totalEnemyBarons;
            tourneyTeamStatsItem['TotalVisionScore'] = sqlTeamStatsTotal.totalVisionScore;
            tourneyTeamStatsItem['TotalWardsPlaced'] = sqlTeamStatsTotal.totalWardsPlaced;
            tourneyTeamStatsItem['TotalControlWardsBought'] = sqlTeamStatsTotal.totalControlWardsBought;
            tourneyTeamStatsItem['TotalWardsCleared'] = sqlTeamStatsTotal.totalWardsCleared;
            tourneyTeamStatsItem['TotalEnemyWardsPlaced'] = sqlTeamStatsTotal.totalEnemyWardsPlaced;
            // #endregion

            /*  
                ----------
                Push into DB
                ----------
            */
            await dynamoDb.updateItem('Team', 'TeamPId', teamPId,
                'SET #sLog.#tId = :val',
                {
                    '#sLog': 'StatsLog',
                    '#tId': tournamentPId
                },
                {
                    ':val': tourneyTeamStatsItem
                }
            );
            // Remove cache
            cache.del(keyBank.TEAM_STATS_PREFIX + teamPId + '-' + tournamentPId);

            resolve({
                teamId: teamPId,
                tournamentId: tournamentPId,
                typeUpdated: 'StatsLog',
            })
        }
        catch (err) { reject(err) }
    });
}