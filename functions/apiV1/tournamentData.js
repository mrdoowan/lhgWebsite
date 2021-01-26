/*  Declaring npm modules */
require('dotenv').config({ path: '../../.env' });
const redis = require('redis');
const cache = (process.env.NODE_ENV === 'production') ? redis.createClient(process.env.REDIS_URL) : redis.createClient(process.env.REDIS_PORT);

/*  Import dependency modules */
import { ChampById } from '../../client/src/static/ChampById';
const GLOBAL = require('./dependencies/global');
const dynamoDb = require('./dependencies/dynamoDbHelper');
const mySql = require('./dependencies/mySqlHelper');
const keyBank = require('./dependencies/cacheKeys');
// Data Functions
import {
    getSeasonName,
    getSeasonShortName,
} from './seasonData';
import {
    getProfileName,
    getProfileStatsByTourney,
} from './profileData';
import {
    getTeamName,
    getTeamShortName,
    getTeamStatsByTourney,
} from './teamData';

/**
 * Get TournamentPId from DynamoDb
 * @param {string} shortName 
 */
export const getTournamentId = (shortName) => {
    let simpleName = GLOBAL.filterName(shortName);
    const cacheKey = keyBank.TN_ID_PREFIX + simpleName;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, (err, data) => {
            if (err) { console.error(err); reject(err); return; }
            else if (data != null) { resolve(parseInt(data)); return; } // NOTE: Needs to be number
            dynamoDb.scanTable('Tournament', ['TournamentPId'], 'TournamentShortName', simpleName)
            .then((obj) => {
                if (obj.length === 0) { resolve(null); return; } // Not Found
                let Id = obj[0]['TournamentPId'];
                cache.set(cacheKey, Id);
                resolve(Id);
            }).catch((ex) => { console.error(ex); reject(ex) });
        });
    });
}

/**
 * Get TournamentShortName of a Tourney Id from DynamoDb. Returns a string (i.e. "w2020plpost")
 * @param {number} tournamentPId      Tourney Id in number format
 */
export const getTournamentShortName = (tournamentPId) => {
    const cacheKey = keyBank.TN_CODE_PREFIX + tournamentPId;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, (err, data) => {
            if (err) { console(err); reject(err); return; }
            else if (data != null) { resolve(data); return; }
            dynamoDb.getItem('Tournament', 'TournamentPId', tournamentPId)
            .then((obj) => {
                if (obj == null) { resolve(null); return; } // Not Found
                let shortName = obj['TournamentShortName'];
                cache.set(cacheKey, shortName);
                resolve(shortName);
            }).catch((ex) => { console.error(ex); reject(ex); });
        });
    });
}

/**
 * Get TournamentName of a Tourney Id from DynamoDb. Returns a string (i.e. "Winter 2020 Premier League Playoffs")
 * @param {number} tournamentPId      Tourney Id in number format
 */
export const getTournamentName = (tournamentPId) => {
    const cacheKey = keyBank.TN_NAME_PREFIX + tournamentPId;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, (err, data) => {
            if (err) { console(err); reject(err); return; }
            else if (data != null) { resolve(data); return; }
            dynamoDb.getItem('Tournament', 'TournamentPId', tournamentPId)
            .then((obj) => {
                if (obj == null) { reject(null); return; } // Not Found
                let name = obj['Information']['TournamentName'];
                cache.set(cacheKey, name);
                resolve(name);
            }).catch((ex) => { console.error(ex); reject(ex); });
        });
    });
}

// Get TournamentTabName from DynamoDb
export const getTournamentTabName = (tournamentPId) => {
    const cacheKey = keyBank.TN_TAB_PREFIX + tournamentPId;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, (err, data) => {
            if (err) { console(err); reject(err); return; }
            else if (data != null) { resolve(data); return; }
            dynamoDb.getItem('Tournament', 'TournamentPId', tournamentPId)
            .then((obj) => {
                if (obj == null) { resolve(null); return; } // Not Found
                let name = obj['Information']['TournamentTabName'];
                cache.set(cacheKey, name);
                resolve(name);
            }).catch((ex) => { console.error(ex); reject(ex); });
        });
    });
}

export const getTournamentInfo = (tournamentPId) => {
    const cacheKey = keyBank.TN_INFO_PREFIX + tournamentPId;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, async (err, data) => {
            if (err) { console(err); reject(err); return; }
            else if (data != null) { resolve(JSON.parse(data)); return; }
            try {
                let tourneyInfoJson = (await dynamoDb.getItem('Tournament', 'TournamentPId', tournamentPId))['Information'];
                if (tourneyInfoJson != null) {
                    tourneyInfoJson['SeasonName'] = await getSeasonName(tourneyInfoJson['SeasonPId']);
                    tourneyInfoJson['SeasonShortName'] = await getSeasonShortName(tourneyInfoJson['SeasonPId']);
                    cache.set(cacheKey, JSON.stringify(tourneyInfoJson, null, 2), 'EX', GLOBAL.TTL_DURATION);
                    resolve(tourneyInfoJson);
                }
                else {
                    resolve({});    // If 'Information' does not exist
                }
            }
            catch (ex) { console.error(ex); reject(ex); }
        });
    });
}

export const getTournamentStats = (tournamentPId) => {
    const cacheKey = keyBank.TN_STATS_PREFIX + tournamentPId;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, async (err, data) => {
            if (err) { console(err); reject(err); return; }
            else if (data != null) { resolve(JSON.parse(data)); return; }
            try {
                let tourneyStatsJson = (await dynamoDb.getItem('Tournament', 'TournamentPId', tournamentPId))['TourneyStats'];
                if (tourneyStatsJson != null) {
                    cache.set(cacheKey, JSON.stringify(tourneyStatsJson, null, 2), 'EX', GLOBAL.TTL_DURATION);
                    resolve(tourneyStatsJson);
                }
                else {
                    resolve({});    // If 'TourneyStats' does not exist
                }
            }
            catch (ex) { console.error(ex); reject(ex); }
        });
    });
}

export const getTournamentLeaderboards = (tournamentPId) => {
    const cacheKey = keyBank.TN_LEADER_PREFIX + tournamentPId;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, async (err, data) => {
            if (err) { console(err); reject(err); return; }
            else if (data != null) { resolve(JSON.parse(data)); return; }
            try {
                let leaderboardJson = (await dynamoDb.getItem('Tournament', 'TournamentPId', tournamentPId))['Leaderboards'];
                if (leaderboardJson != null) {
                    let gameRecords = leaderboardJson['GameRecords'];
                    for (let i = 0; i < Object.values(gameRecords).length; ++i) {
                        let gameObject = Object.values(gameRecords)[i];
                        gameObject['BlueTeamName'] = await getTeamName(gameObject['BlueTeamHId']);
                        gameObject['RedTeamName'] = await getTeamName(gameObject['RedTeamHId']);
                        gameObject['BlueTeamShortName'] = await getTeamShortName(gameObject['BlueTeamHId']);
                        gameObject['RedTeamShortName'] = await getTeamShortName(gameObject['RedTeamHId']);
                    }
                    let playerRecords = leaderboardJson['PlayerSingleRecords'];
                    for (let i = 0; i < Object.values(playerRecords).length; ++i) {
                        let playerList = Object.values(playerRecords)[i];
                        for (let j = 0; j < playerList.length; ++j) {
                            let playerObject = playerList[j];
                            playerObject['ProfileName'] = await getProfileName(playerObject['ProfileHId']);
                            playerObject['BlueTeamName'] = await getTeamName(playerObject['BlueTeamHId']);
                            playerObject['RedTeamName'] = await getTeamName(playerObject['RedTeamHId']);
                            playerObject['BlueTeamShortName'] = await getTeamShortName(playerObject['BlueTeamHId']);
                            playerObject['RedTeamShortName'] = await getTeamShortName(playerObject['RedTeamHId']);
                        }
                    }
                    let teamRecords = leaderboardJson['TeamSingleRecords'];
                    for (let i = 0; i < Object.values(teamRecords).length; ++i) {
                        let teamList = Object.values(teamRecords)[i];
                        for (let j = 0; j < teamList.length; ++j) {
                            let teamObject = teamList[j];
                            teamObject['TeamName'] = await getTeamName(teamObject['TeamHId']);
                            teamObject['BlueTeamName'] = await getTeamName(teamObject['BlueTeamHId']);
                            teamObject['RedTeamName'] = await getTeamName(teamObject['RedTeamHId']);
                            teamObject['BlueTeamShortName'] = await getTeamShortName(teamObject['BlueTeamHId']);
                            teamObject['RedTeamShortName'] = await getTeamShortName(teamObject['RedTeamHId']);
                        }
                    }
                    cache.set(cacheKey, JSON.stringify(leaderboardJson, null, 2), 'EX', GLOBAL.TTL_DURATION);
                    resolve(leaderboardJson);
                }
                else {
                    resolve({});    // If 'Leaderboards' does not exist
                }
            }
            catch (ex) { console.error(ex); reject(ex); }
        });
    });
}

/**
 * Returns an Object['PlayerList'] that contains a list of Stats for each Player in the Tournament
 * @param {number} tournamentPId 
 */
export const getTournamentPlayerStats = (tournamentPId) => {
    const cacheKey = keyBank.TN_PLAYER_PREFIX + tournamentPId;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, async (err, data) => {
            if (err) { console(err); reject(err); return; }
            else if (data != null) { resolve(JSON.parse(data)); return; }
            try {
                let profileHIdList = (await dynamoDb.getItem('Tournament', 'TournamentPId', tournamentPId))['ProfileHIdList'];
                if (profileHIdList != null) {
                    let profileStatsList = [];
                    for (let i = 0; i < profileHIdList.length; ++i) {
                        let pPId = GLOBAL.getProfilePId(profileHIdList[i]);
                        let profileStatsLog = await getProfileStatsByTourney(pPId, tournamentPId);
                        if (profileStatsLog != null) {
                            for (let j = 0; j < Object.keys(profileStatsLog['RoleStats']).length; ++j) {
                                let role = Object.keys(profileStatsLog['RoleStats'])[j];
                                let statsObj = profileStatsLog['RoleStats'][role];
                                profileStatsList.push({
                                    'ProfileName': await getProfileName(profileHIdList[i]),
                                    'Role': role,
                                    'GamesPlayed': statsObj.GamesPlayed,
                                    'GamesWin': statsObj.GamesWin,
                                    'Kda': statsObj.Kda,
                                    'TotalKills': statsObj.TotalKills,
                                    'TotalDeaths': statsObj.TotalDeaths,
                                    'TotalAssists': statsObj.TotalAssists,
                                    'AverageKills': statsObj.AverageKills,
                                    'AverageDeaths': statsObj.AverageDeaths,
                                    'AverageAssists': statsObj.AverageAssists,
                                    'KillPct': statsObj.KillPct,
                                    'DeathPct': statsObj.DeathPct,
                                    'GoldPct': statsObj.GoldPct,
                                    'FirstBloodPct': statsObj.FirstBloodPct,
                                    'DamagePct': statsObj.DamagePct,
                                    'VisionScorePct': statsObj.VisionScorePct,
                                    'CreepScorePerMinute': statsObj.CreepScorePerMinute,
                                    'GoldPerMinute': statsObj.GoldPerMinute,
                                    'DamagePerMinute': statsObj.DamagePerMinute,
                                    'DamagePerMinuteStdDev': statsObj.DamagePerMinuteStdDev,
                                    'DamagePerGold': statsObj.DamagePerGold,
                                    'VisionScorePerMinute': statsObj.VisionScorePerMinute,
                                    'WardsPerMinute': statsObj.WardsPerMinute,
                                    'WardsClearedPerMinute': statsObj.WardsClearedPerMinute,
                                    'ControlWardsPerMinute': statsObj.ControlWardsPerMinute,
                                    'AverageCsAtEarly': statsObj.AverageCsAtEarly,
                                    'AverageGoldAtEarly': statsObj.AverageGoldAtEarly,
                                    'AverageXpAtEarly': statsObj.AverageXpAtEarly,
                                    'AverageCsDiffEarly': statsObj.AverageCsDiffEarly,
                                    'AverageGoldDiffEarly': statsObj.AverageGoldDiffEarly,
                                    'AverageXpDiffEarly': statsObj.AverageXpDiffEarly,
                                    'AverageCsAtMid': statsObj.AverageCsAtMid,
                                    'AverageGoldAtMid': statsObj.AverageGoldAtMid,
                                    'AverageXpAtMid': statsObj.AverageXpAtMid,
                                    'AverageCsDiffMid': statsObj.AverageCsDiffMid,
                                    'AverageGoldDiffMid': statsObj.AverageGoldDiffMid,
                                    'AverageXpDiffMid': statsObj.AverageXpDiffMid,
                                    'TotalDoubleKills': statsObj.TotalDoubleKills,
                                    'TotalTripleKills': statsObj.TotalTripleKills,
                                    'TotalQuadraKills': statsObj.TotalQuadraKills,
                                    'TotalPentaKills': statsObj.TotalPentaKills,
                                    'TotalSoloKills': statsObj.TotalSoloKills,
                                });
                            }
                        }
                    }
                    let profileObject = {};
                    profileObject['PlayerList'] = profileStatsList;
                    cache.set(cacheKey, JSON.stringify(profileObject, null, 2), 'EX', GLOBAL.TTL_DURATION);
                    resolve(profileObject);
                }
                else {
                    resolve({});    // If 'ProfileHIdList' does not exist
                }
            }
            catch (ex) { console.error(ex); reject(ex); }
        });
    });
}

/**
 * Returns an Object['TeamList'] that contains a list of Stats for each Team in the Tournament
 * @param {number} tournamentPId 
 */
export const getTournamentTeamStats = (tournamentPId) => {
    const cacheKey = keyBank.TN_TEAM_PREFIX + tournamentPId;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, async (err, data) => {
            if (err) { console(err); reject(err); return; }
            else if (data != null) { resolve(JSON.parse(data)); return; }
            try {
                let teamHIdList = (await dynamoDb.getItem('Tournament', 'TournamentPId', tournamentPId))['TeamHIdList'];
                if (teamHIdList != null) {
                    let teamStatsList = [];
                    for (let i = 0; i < teamHIdList.length; ++i) {
                        let teamId = GLOBAL.getTeamPId(teamHIdList[i]);
                        let teamStatsLog = await getTeamStatsByTourney(teamId, tournamentPId);
                        if (teamStatsLog != null) {
                            teamStatsList.push({
                                'TeamName': await getTeamName(teamHIdList[i]),
                                'GamesPlayed': teamStatsLog.GamesPlayed,
                                'GamesWin': teamStatsLog.GamesWon,
                                'AverageGameDuration': teamStatsLog.AverageGameDuration,
                                'KillDeathRatio': teamStatsLog.KillDeathRatio,
                                'AverageKills': teamStatsLog.AverageKills,
                                'AverageDeaths': teamStatsLog.AverageDeaths,
                                'AverageAssists': teamStatsLog.AverageAssists,
                                'CreepScorePerMinute': teamStatsLog.CreepScorePerMinute,
                                'DamagePerMinute': teamStatsLog.DamagePerMinute,
                                'GoldPerMinute': teamStatsLog.GoldPerMinute,
                                'VisionScorePerMinute': teamStatsLog.VisionScorePerMinute,
                                'WardsPerMinute': teamStatsLog.WardsPerMinute,
                                'ControlWardsPerMinute': teamStatsLog.ControlWardsPerMinute,
                                'WardsClearedPerMinute': teamStatsLog.WardsClearedPerMinute,
                                'FirstBloodPct': teamStatsLog.FirstBloodPct,
                                'FirstTowerPct': teamStatsLog.FirstTowerPct,
                                'DragonPct': teamStatsLog.DragonPct,
                                'HeraldPct': teamStatsLog.HeraldPct,
                                'BaronPct': teamStatsLog.BaronPct,
                                'WardsClearedPct': teamStatsLog.WardsClearedPct,
                                'AverageTowersTaken': teamStatsLog.AverageTowersTaken,
                                'AverageTowersLost': teamStatsLog.AverageTowersLost,
                                'AverageDragonsTaken': teamStatsLog.AverageDragonsTaken,
                                'AverageHeraldsTaken': teamStatsLog.AverageHeraldsTaken,
                                'AverageBaronsTaken': teamStatsLog.AverageBaronsTaken,
                                'AverageXpDiffEarly': teamStatsLog.AverageXpDiffEarly,
                                'AverageXpDiffMid': teamStatsLog.AverageXpDiffMid,
                                'AverageGoldDiffEarly': teamStatsLog.AverageGoldDiffEarly,
                                'AverageGoldDiffMid': teamStatsLog.AverageGoldDiffMid,
                                'AverageCsDiffEarly': teamStatsLog.AverageCsDiffEarly,
                                'AverageCsDiffMid': teamStatsLog.AverageCsDiffMid,
                            });
                        }
                    }
                    let teamObject = {};
                    teamObject['TeamList'] = teamStatsList;
                    cache.set(cacheKey, JSON.stringify(teamObject, null, 2), 'EX', GLOBAL.TTL_DURATION);
                    resolve(teamObject);
                }
                else {
                    resolve({});    // If 'TeamHIdList' does not exist
                }
            }
            catch (ex) { console.error(ex); reject(ex); }
        });
    });
}

export const getTournamentPickBans = (tournamentPId) => {
    const cacheKey = keyBank.TN_PICKBANS_PREFIX + tournamentPId;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, async (err, data) => {
            if (err) { console(err); reject(err); return; }
            else if (data != null) { resolve(JSON.parse(data)); return; }
            try {
                let tourneyJson = (await dynamoDb.getItem('Tournament', 'TournamentPId', tournamentPId));
                let pickBansJson = {}
                if ('PickBans' in tourneyJson && 'TourneyStats' in tourneyJson) {
                    pbList = [];
                    const numberGames = tourneyJson['TourneyStats']['NumberGames'];
                    pickBansJson['NumberGames'] = numberGames;
                    let numberChampsWithPresence = 0;
                    for (let i = 0; i < Object.keys(tourneyJson['PickBans']).length; ++i) {
                        let champId = Object.keys(tourneyJson['PickBans'])[i];
                        let champObject = tourneyJson['PickBans'][champId];
                        champObject['Id'] = champId;
                        champObject['TimesPicked'] = champObject['BluePicks'] + champObject['RedPicks'];
                        champObject['TimesBanned'] = champObject['BlueBans'] + champObject['RedBans'];
                        const presence = champObject['TimesPicked'] + champObject['TimesBanned'];
                        if (presence > 0) { numberChampsWithPresence++; }
                        champObject['Presence'] = (numberGames == 0) ? 0 : (presence / numberGames).toFixed(4);
                        champObject['PickPct'] = (numberGames == 0) ? 0 : (champObject['TimesPicked'] / numberGames).toFixed(4);
                        champObject['BanPct'] = (numberGames == 0) ? 0 : (champObject['TimesBanned'] / numberGames).toFixed(4);
                        champObject['NumLosses'] = champObject['TimesPicked'] - champObject['NumWins'];
                        champObject['WinPct'] = (champObject['TimesPicked'] == 0) ? 0 : (champObject['NumWins'] / champObject['TimesPicked']).toFixed(4);
                        pbList.push(champObject);
                    }
                    pickBansJson['ChampsWithPresence'] = numberChampsWithPresence;
                    pickBansJson['PickBanList'] = pbList;
                    cache.set(cacheKey, JSON.stringify(pickBansJson, null, 2), 'EX', GLOBAL.TTL_DURATION);
                }
                resolve(pickBansJson);
            }
            catch (ex) { console.error(ex); reject(ex); }
        });
    });
}

export const getTournamentGames = (tournamentPId) => {
    const cacheKey = keyBank.TN_GAMES_PREFIX + tournamentPId;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, async (err, data) => {
            if (err) { console(err); reject(err); return; }
            else if (data != null) { resolve(JSON.parse(data)); return; }
            try {
                let gameLogJson = (await dynamoDb.getItem('Tournament', 'TournamentPId', tournamentPId))['GameLog'];
                if (gameLogJson != null) {
                    for (let i = 0; i < Object.keys(gameLogJson).length; ++i) {
                        let matchId = Object.keys(gameLogJson)[i];
                        let gameJson = gameLogJson[matchId];
                        gameJson['MatchPId'] = matchId;
                        gameJson['BlueTeamName'] = await getTeamName(gameJson['BlueTeamHId']);
                        gameJson['RedTeamName'] = await getTeamName(gameJson['RedTeamHId']);
                    }
                    cache.set(cacheKey, JSON.stringify(gameLogJson, null, 2), 'EX', GLOBAL.TTL_DURATION);
                    resolve(gameLogJson);
                }
                else {
                    resolve({});    // If 'GameLog' does not exist
                }
            }
            catch (ex) { console.error(ex); reject(ex); }
        });
    });
}

/**
 * Returns a unique list of Player IDs that participated in the Tournament
 * @param {number} tournamentPId 
 */
export const getTournamentPlayerList = (tournamentPId) => {
    return new Promise(async (resolve, reject) => {
        try {
            let profileIdsSqlList = await mySql.callSProc('profilePIdsByTournamentPId', tournamentPId);
            resolve(profileIdsSqlList.map(a => a.profilePId));
        }
        catch (err) { console.error(err); reject(err); }
    });
}

/**
 * Returns a unique list of Team IDs that participated in the Tournament
 * @param {number} tournamentPId 
 */
export const getTournamentTeamList = (tournamentPId) => {
    return new Promise(async (resolve, reject) => {
        try {
            let teamIdsSqlList = await mySql.callSProc('teamPIdsByTournamentPId', tournamentPId);
            resolve(teamIdsSqlList.map(a => a.teamPId));
        }
        catch (err) { console.error(err); reject(err); }
    });
}

/**
 * Updates Tourney Information into DynamoDb by grabbing from the list of Matches
 * @param {number} tournamentPId 
 */
export const updateTournamentOverallStats = (tournamentPId) => {
    return new Promise(async (resolve, reject) => {
        try {
            let tourneyDbObject = await dynamoDb.getItem('Tournament', 'TournamentPId', tournamentPId);
            /*  
                -------------------
                Init DynamoDB Items
                -------------------
            */
            //#region Init Items (Shallow Copies)
            let tourneyStatsItem = {
                'NumberGames': 0,
                'BlueSideWins': 0,
                'TotalGameDuration': 0,
                'CloudDrakes': 0,
                'OceanDrakes': 0,
                'InfernalDrakes': 0,
                'MountainDrakes': 0,
                'ElderDrakes': 0,
            }
            let pickBansObject = initPickBansObject();
            let profileHIdSet = new Set();
            let teamHIdSet = new Set();
            let gameLogTourneyItem = {};

            let leaderboardsItem = {};
            leaderboardsItem['GameRecords'] = {};
            let gameRecords = leaderboardsItem['GameRecords'];
            //#endregion

            /*  
                -------------------
                Compile Data
                -------------------
            */
            const matchStatsSqlList = await mySql.callSProc('matchStatsByTournamentId', tournamentPId);
            //#region Process GameLog Data
            for (let matchIdx = 0; matchIdx < matchStatsSqlList.length; ++matchIdx) {
                let matchStatsSqlRow = matchStatsSqlList[matchIdx];
                let matchPId = matchStatsSqlRow.riotMatchId;
                /*  
                    --------------
                    'TourneyStats'
                    --------------
                */
                tourneyStatsItem['NumberGames']++;
                tourneyStatsItem['BlueSideWins'] += matchStatsSqlRow.blueWin;
                tourneyStatsItem['TotalGameDuration'] += matchStatsSqlRow.duration;
                tourneyStatsItem['CloudDrakes'] += matchStatsSqlRow.cloudDragons;
                tourneyStatsItem['OceanDrakes'] += matchStatsSqlRow.oceanDragons;
                tourneyStatsItem['InfernalDrakes'] += matchStatsSqlRow.infernalDragons;
                tourneyStatsItem['MountainDrakes'] += matchStatsSqlRow.mountainDragons;
                tourneyStatsItem['ElderDrakes'] += matchStatsSqlRow.elderDragons;
    
                let matchObject = await dynamoDb.getItem('Matches', 'MatchPId', matchPId.toString());
                for (let teamIdx = 0; teamIdx < Object.keys(matchObject['Teams']).length; ++teamIdx) {
                    let teamId = Object.keys(matchObject['Teams'])[teamIdx];
                    let teamObject = matchObject['Teams'][teamId];    
                    /*
                        --------------
                        'PickBans'
                        --------------
                    */
                    // Bans
                    addBansToTourneyItem(pickBansObject, teamObject['Bans'], teamId);
                    // Picks
                    addWinPicksToTourneyItem(pickBansObject, teamObject, teamId);
                    /*
                        --------------
                        'ProfileHIdList' / 'TeamHIdList'
                        --------------
                    */
                    for (let playerIdx = 0; playerIdx < Object.values(teamObject['Players']).length; ++playerIdx) {
                        let playerObject = Object.values(teamObject['Players'])[playerIdx];
                        profileHIdSet.add(playerObject['ProfileHId']);
                    }
                    teamHIdSet.add(teamObject['TeamHId']);
                }
                /*
                    --------------
                    'GameLog'
                    --------------
                */
                gameLogTourneyItem[matchPId] = {
                    'DatePlayed': matchObject.DatePlayed,
                    'BlueTeamHId': matchObject['Teams'][GLOBAL.BLUE_ID]['TeamHId'],
                    'RedTeamHId': matchObject['Teams'][GLOBAL.RED_ID]['TeamHId'],
                    'Duration': matchObject.GameDuration,
                    'BlueWin': Boolean(matchObject['Teams'][GLOBAL.BLUE_ID]['Win']),
                    'Patch': matchObject.GamePatchVersion,
                };
                // Update 'MostRecentPatch'
                tourneyDbObject['Information']['MostRecentPatch'] = matchObject.GamePatchVersion;
            }
            //#endregion
            //#region Process Leaderboard Data
            //#region GameRecords
            // Shortest Game
            const shortestGameSqlRow = matchStatsSqlList[0];
            gameRecords['ShortestGame'] = buildDefaultLeaderboardItem(shortestGameSqlRow);
            // Longest Game
            const longestGameSqlRow = matchStatsSqlList[matchStatsSqlList.length - 1];
            gameRecords['LongestGame'] = buildDefaultLeaderboardItem(longestGameSqlRow);
            // Most Kills
            const mostKillsGameSqlRow = (await mySql.callSProc('mostKillsGameByTournamentId', tournamentPId))[0];
            gameRecords['MostKillGame'] = buildDefaultLeaderboardItem(mostKillsGameSqlRow);
            gameRecords['MostKillGame']['Kills'] = mostKillsGameSqlRow.totalKills;
            //#endregion
            leaderboardsItem['PlayerSingleRecords'] = {};
            let playerRecords = leaderboardsItem['PlayerSingleRecords'];
            //#region PlayerSingleRecords
            // Players Most Damage
            let playerMostDamageList = [];
            let mostDamageListSql = await mySql.callSProc('playerMostDamageByTournamentId', tournamentPId);
            for (let j = 0; j < mostDamageListSql.length; ++j) {
                let mostDamageRowSql = mostDamageListSql[j];
                let playerMostDamageItem = buildDefaultLeaderboardItem(mostDamageRowSql); GLOBAL.getProfileHId
                playerMostDamageItem['ProfileHId'] = GLOBAL.getProfileHId(mostDamageRowSql.profilePId);
                playerMostDamageItem['ChampId'] = mostDamageRowSql.champId;
                playerMostDamageItem['Role'] = mostDamageRowSql.role;
                playerMostDamageItem['Side'] = mostDamageRowSql.side;
                playerMostDamageItem['DamagePerMin'] = mostDamageRowSql.dmgDealtPerMin;
                playerMostDamageItem['DamageDealt'] = mostDamageRowSql.damageDealt;
                playerMostDamageList.push(playerMostDamageItem);
            }
            playerRecords['PlayerMostDamage'] = playerMostDamageList;
            // Player Most Farm
            let playerMostFarmList = [];
            let mostFarmListSql = await mySql.callSProc('playerMostFarmByTournamentId', tournamentPId);
            for (let j = 0; j < mostFarmListSql.length; ++j) {
                let mostFarmRowSql = mostFarmListSql[j];
                let playerMostFarmItem = buildDefaultLeaderboardItem(mostFarmRowSql);
                playerMostFarmItem['ProfileHId'] = GLOBAL.getProfileHId(mostFarmRowSql.profilePId);
                playerMostFarmItem['ChampId'] = mostFarmRowSql.champId;
                playerMostFarmItem['Role'] = mostFarmRowSql.role;
                playerMostFarmItem['Side'] = mostFarmRowSql.side;
                playerMostFarmItem['CsPerMin'] = mostFarmRowSql.csPerMin;
                playerMostFarmItem['CreepScore'] = mostFarmRowSql.creepScore;
                playerMostFarmList.push(playerMostFarmItem);
            }
            playerRecords['PlayerMostFarm'] = playerMostFarmList;
            // Player Most GD@Early
            let playerMostGDiffEarlyList = [];
            let mostGDiffEarlyList = await mySql.callSProc('playerMostGDEarlyByTournamentId', tournamentPId);
            for (let j = 0; j < mostGDiffEarlyList.length; ++j) {
                let mostGDiffEarlyRowSql = mostGDiffEarlyList[j];
                let playerMostGDiffEarlyItem = buildDefaultLeaderboardItem(mostGDiffEarlyRowSql);
                playerMostGDiffEarlyItem['ProfileHId'] = GLOBAL.getProfileHId(mostGDiffEarlyRowSql.profilePId);
                playerMostGDiffEarlyItem['ChampId'] = mostGDiffEarlyRowSql.champId;
                playerMostGDiffEarlyItem['Role'] = mostGDiffEarlyRowSql.role;
                playerMostGDiffEarlyItem['Side'] = mostGDiffEarlyRowSql.side;
                playerMostGDiffEarlyItem['GDiffEarly'] = mostGDiffEarlyRowSql.goldDiffEarly;
                playerMostGDiffEarlyItem['GAtEarly'] = mostGDiffEarlyRowSql.goldAtEarly;
                playerMostGDiffEarlyList.push(playerMostGDiffEarlyItem);
            }
            playerRecords['PlayerMostGoldDiffEarly'] = playerMostGDiffEarlyList;
            // Player Most XPD@Early
            let playerMostXpDiffEarlyList = [];
            let mostXpDiffListSql = await mySql.callSProc('playerMostXPDEarlyByTournamentId', tournamentPId);
            for (let j = 0; j < mostXpDiffListSql.length; ++j) {
                let mostXpDiffEarlyRowSql = mostXpDiffListSql[j];
                let playerMostXpDiffEarlyItem = buildDefaultLeaderboardItem(mostXpDiffEarlyRowSql);
                playerMostXpDiffEarlyItem['ProfileHId'] = GLOBAL.getProfileHId(mostXpDiffEarlyRowSql.profilePId);
                playerMostXpDiffEarlyItem['ChampId'] = mostXpDiffEarlyRowSql.champId;
                playerMostXpDiffEarlyItem['Role'] = mostXpDiffEarlyRowSql.role;
                playerMostXpDiffEarlyItem['Side'] = mostXpDiffEarlyRowSql.side;
                playerMostXpDiffEarlyItem['XpDiffEarly'] = mostXpDiffEarlyRowSql.xpDiffEarly;
                playerMostXpDiffEarlyItem['XpAtEarly'] = mostXpDiffEarlyRowSql.xpAtEarly;
                playerMostXpDiffEarlyList.push(playerMostXpDiffEarlyItem);
            }
            playerRecords['PlayerMostXpDiffEarly'] = playerMostXpDiffEarlyList;
            // Player Most Vision
            let playerMostVisionList = [];
            let mostVisionListSql = await mySql.callSProc('playerMostVisionByTournamentId', tournamentPId);
            for (let j = 0; j < mostVisionListSql.length; ++j) {
                let mostVisionRowSql = mostVisionListSql[j];
                let playerMostVisionItem = buildDefaultLeaderboardItem(mostVisionRowSql);
                playerMostVisionItem['ProfileHId'] = GLOBAL.getProfileHId(mostVisionRowSql.profilePId);
                playerMostVisionItem['ChampId'] = mostVisionRowSql.champId;
                playerMostVisionItem['Role'] = mostVisionRowSql.role;
                playerMostVisionItem['Side'] = mostVisionRowSql.side;
                playerMostVisionItem['VsPerMin'] = mostVisionRowSql.vsPerMin;
                playerMostVisionItem['VisionScore'] = mostVisionRowSql.visionScore;
                playerMostVisionList.push(playerMostVisionItem);
            }
            playerRecords['PlayerMostVision'] = playerMostVisionList;
            //#endregion
            leaderboardsItem['TeamSingleRecords'] = {};
            let teamRecords = leaderboardsItem['TeamSingleRecords'];
            //#region TeamSingleRecords
            // Team Top Baron Power Plays
            let teamTopBaronPPList = [];
            let topBaronPPListSql = await mySql.callSProc('teamTopBaronPPByTournamentId', tournamentPId);
            for (let j = 0; j < topBaronPPListSql.length; ++j) {
                let topBaronPPRowSql = topBaronPPListSql[j];
                let teamBaronPPItem = buildDefaultLeaderboardItem(topBaronPPRowSql);
                teamBaronPPItem['TeamHId'] = GLOBAL.getTeamHId(topBaronPPRowSql.teamPId);
                teamBaronPPItem['Timestamp'] = topBaronPPRowSql.timestamp;
                teamBaronPPItem['BaronPowerPlay'] = topBaronPPRowSql.baronPowerPlay;
                teamTopBaronPPList.push(teamBaronPPItem);
            }
            teamRecords['TeamTopBaronPowerPlay'] = teamTopBaronPPList;
            // Team Earliest Towers
            let teamEarliestTowerList = [];
            let earliestTowerListSql = await mySql.callSProc('teamEarliestTowerByTournamentId', tournamentPId);
            for (let j = 0; j < earliestTowerListSql.length; ++j) {
                let earliestTowerRowSql = earliestTowerListSql[j];
                let teamEarliestTowerItem = buildDefaultLeaderboardItem(earliestTowerRowSql);
                teamEarliestTowerItem['TeamHId'] = GLOBAL.getTeamHId(earliestTowerRowSql.teamPId);
                teamEarliestTowerItem['Timestamp'] = earliestTowerRowSql.timestamp;
                teamEarliestTowerItem['Lane'] = earliestTowerRowSql.lane;
                teamEarliestTowerItem['TowerType'] = earliestTowerRowSql.towerType;
                teamEarliestTowerList.push(teamEarliestTowerItem);
            }
            teamRecords['TeamEarliestTower'] = teamEarliestTowerList;
            //#endregion
            //#endregion

            /*  
                -------------------
                Push to Db
                -------------------
            */
            //#region Push to Db
            await dynamoDb.updateItem('Tournament', 'TournamentPId', tournamentPId,
                'SET #info = :val',
                {
                    '#info': 'Information'
                },
                {
                    ':val': tourneyDbObject['Information']
                }
            );
            await dynamoDb.updateItem('Tournament', 'TournamentPId', tournamentPId,
                'SET #tStats = :val',
                {
                    '#tStats': 'TourneyStats'
                },
                {
                    ':val': tourneyStatsItem
                }
            );
            await dynamoDb.updateItem('Tournament', 'TournamentPId', tournamentPId,
                'SET #pb = :val',
                {
                    '#pb': 'PickBans'
                },
                {
                    ':val': pickBansObject
                }
            );
            await dynamoDb.updateItem('Tournament', 'TournamentPId', tournamentPId,
                'SET #pHIdList = :val',
                {
                    '#pHIdList': 'ProfileHIdList'
                },
                {
                    ':val': Array.from(profileHIdSet)
                }
            );
            await dynamoDb.updateItem('Tournament', 'TournamentPId', tournamentPId,
                'SET #tHIdList = :val',
                {
                    '#tHIdList': 'TeamHIdList'
                },
                {
                    ':val': Array.from(teamHIdSet)
                }
            );
            await dynamoDb.updateItem('Tournament', 'TournamentPId', tournamentPId,
                'SET #gLog = :val',
                {
                    '#gLog': 'GameLog'
                },
                {
                    ':val': gameLogTourneyItem
                }
            );
            await dynamoDb.updateItem('Tournament', 'TournamentPId', tournamentPId,
                'SET #lb = :val',
                {
                    '#lb': 'Leaderboards'
                },
                {
                    ':val': leaderboardsItem
                }
            );
            //#endregion
            //#region Remove Cache
            cache.del(keyBank.TN_INFO_PREFIX + tournamentPId);
            cache.del(keyBank.TN_STATS_PREFIX + tournamentPId);
            cache.del(keyBank.TN_PLAYER_PREFIX + tournamentPId);
            cache.del(keyBank.TN_TEAM_PREFIX + tournamentPId);
            cache.del(keyBank.TN_PICKBANS_PREFIX + tournamentPId);
            cache.del(keyBank.TN_GAMES_PREFIX + tournamentPId);
            cache.del(keyBank.TN_LEADER_PREFIX + tournamentPId);
            //#endregion

            // Return
            resolve({
                tournamentId: tournamentPId,
                tournamentName: tourneyDbObject['TournamentName'],
                gamesUpdated: matchStatsSqlList.length,
            });
        }
        catch (err) { console.error(err); reject( err ); }
    });
}

/*
    ----------------------
    Helper Functions
    ----------------------
*/
//#region Helper

/**
 * Returns an initialized pickBansObject
 */
function initPickBansObject() {
    let newPickBansObject = {};
    for (let i = 0; i < Object.keys(ChampById).length; ++i) {
        const champId = Object.keys(ChampById)[i];
        newPickBansObject[champId] = {
            'BluePicks': 0,
            'RedPicks': 0,
            'NumWins': 0,
            'BlueBans': 0,
            'RedBans': 0,
        }
    }
    return newPickBansObject;
}

/**
 * Add ban array into existing pickBansObject
 * @param {object} pickBansObject   Pick bans object
 * @param {Array} banArray          Array of ban Ids from Team
 * @param {string} teamId           "100" == Blue, "200" == Red
 */
function addBansToTourneyItem(pickBansObject, banArray, teamId) {
    for (let k = 0; k < banArray.length; ++k) {
        const champBanned = banArray[k];
        if (teamId == GLOBAL.BLUE_ID) {
            pickBansObject[champBanned]['BlueBans']++;
        }
        else if (teamId == GLOBAL.RED_ID) {
            pickBansObject[champBanned]['RedBans']++;
        }
    }
}

/**
 * Add champs played array into existing pickBansObject
 * @param {object} pickBansObject       Pick Bans object
 * @param {object} teamObject           Item from Team['Players']
 * @param {string} teamId               "100" == Blue, "200" == Red
 */
function addWinPicksToTourneyItem(pickBansObject, teamObject, teamId) {
    let playersObject = teamObject['Players'];
    for (let k = 0; k < Object.values(playersObject).length; ++k) {
        let playerObject = Object.values(playersObject)[k];
        let champPicked = playerObject['ChampId'];
        if (teamId == GLOBAL.BLUE_ID) {
            pickBansObject[champPicked]['BluePicks']++;
        }
        else if (teamId == GLOBAL.RED_ID) {
            pickBansObject[champPicked]['RedPicks']++;
        }
        pickBansObject[champPicked]['NumWins'] += teamObject['Win'];
    }
}

/**
 * @param {object} matchSqlRow      Each row of the MySQL query from MatchStats
 */
function buildDefaultLeaderboardItem(matchSqlRow) {
    return {
        'GameDuration': matchSqlRow.duration,
        'MatchPId': matchSqlRow.riotMatchId,
        'Patch': matchSqlRow.patch,
        'BlueTeamHId': GLOBAL.getTeamHId(matchSqlRow.blueTeamPId),
        'RedTeamHId': GLOBAL.getTeamHId(matchSqlRow.redTeamPId),
    };
}
//#endregion