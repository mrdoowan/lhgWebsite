/*  Declaring npm modules */
const redis = require('redis');
const cache = (process.env.NODE_ENV === 'production') ? redis.createClient(process.env.REDIS_URL) : redis.createClient(process.env.REDIS_PORT);

/*  Import dependency modules */
import {
    filterName,
    getProfilePIdFromHash,
    getProfileHashId,
    getTeamPIdFromHash,
    getTeamHashId,
    GLOBAL_CONSTS,
} from './dependencies/global';
import {
    dynamoDbGetItem,
    dynamoDbUpdateItem,
    dynamoDbScanTable,
} from './dependencies/dynamoDbHelper';
import { mySqlCallSProc } from './dependencies/mySqlHelper';
import { CACHE_KEYS } from './dependencies/cacheKeys'
/*  Import data functions */
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
import { createChampObject } from '../../services/ddragonChampion';

/**
 * Get TournamentPId from DynamoDb
 * @param {string} shortName 
 */
export const getTournamentId = (shortName) => {
    const simpleName = filterName(shortName);
    const cacheKey = CACHE_KEYS.TN_ID_PREFIX + simpleName;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, (err, data) => {
            if (err) { console.error(err); reject(err); return; }
            else if (data) { resolve(parseInt(data)); return; } // NOTE: Needs to be number
            dynamoDbScanTable('Tournament', ['TournamentPId'], 'TournamentShortName', simpleName)
            .then((obj) => {
                if (obj.length === 0) { resolve(null); return; } // Not Found
                const Id = obj[0]['TournamentPId'];
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
    const cacheKey = CACHE_KEYS.TN_CODE_PREFIX + tournamentPId;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, (err, data) => {
            if (err) { console(err); reject(err); return; }
            else if (data) { resolve(data); return; }
            dynamoDbGetItem('Tournament', tournamentPId)
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
    const cacheKey = CACHE_KEYS.TN_NAME_PREFIX + tournamentPId;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, (err, data) => {
            if (err) { console(err); reject(err); return; }
            else if (data) { resolve(data); return; }
            dynamoDbGetItem('Tournament', tournamentPId)
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
    const cacheKey = CACHE_KEYS.TN_TAB_PREFIX + tournamentPId;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, (err, data) => {
            if (err) { console(err); reject(err); return; }
            else if (data != null) { resolve(data); return; }
            dynamoDbGetItem('Tournament', tournamentPId)
            .then((obj) => {
                if (obj == null) { resolve(null); return; } // Not Found
                let name = obj['Information']['TournamentTabName'];
                cache.set(cacheKey, name);
                resolve(name);
            }).catch((ex) => { console.error(ex); reject(ex); });
        });
    });
}

/**
 * 
 * @param {number} tournamentPId 
 */
export const getTournamentInfo = (tournamentPId) => {
    const cacheKey = CACHE_KEYS.TN_INFO_PREFIX + tournamentPId;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, async (err, data) => {
            if (err) { console(err); reject(err); return; }
            else if (data != null) { resolve(JSON.parse(data)); return; }
            try {
                let tourneyInfoJson = (await dynamoDbGetItem('Tournament', tournamentPId))['Information'];
                if (tourneyInfoJson != null) {
                    tourneyInfoJson['SeasonName'] = await getSeasonName(tourneyInfoJson['SeasonPId']);
                    tourneyInfoJson['SeasonShortName'] = await getSeasonShortName(tourneyInfoJson['SeasonPId']);
                    cache.set(cacheKey, JSON.stringify(tourneyInfoJson, null, 2), 'EX', GLOBAL_CONSTS.TTL_DURATION);
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
    const cacheKey = CACHE_KEYS.TN_STATS_PREFIX + tournamentPId;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, async (err, data) => {
            if (err) { console(err); reject(err); return; }
            else if (data != null) { resolve(JSON.parse(data)); return; }
            try {
                let tourneyStatsJson = (await dynamoDbGetItem('Tournament', tournamentPId))['TourneyStats'];
                if (tourneyStatsJson != null) {
                    cache.set(cacheKey, JSON.stringify(tourneyStatsJson, null, 2), 'EX', GLOBAL_CONSTS.TTL_DURATION);
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
    const cacheKey = CACHE_KEYS.TN_LEADER_PREFIX + tournamentPId;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, async (err, data) => {
            if (err) { console(err); reject(err); return; }
            else if (data != null) { resolve(JSON.parse(data)); return; }
            try {
                let leaderboardJson = (await dynamoDbGetItem('Tournament', tournamentPId))['Leaderboards'];
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
                    cache.set(cacheKey, JSON.stringify(leaderboardJson, null, 2), 'EX', GLOBAL_CONSTS.TTL_DURATION);
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
    const cacheKey = CACHE_KEYS.TN_PLAYER_PREFIX + tournamentPId;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, async (err, data) => {
            if (err) { console(err); reject(err); return; }
            else if (data) { resolve(JSON.parse(data)); return; }
            dynamoDbGetItem('Tournament', tournamentPId).then((tournamentObject) => {
                const profileHIdList = tournamentObject.ProfileHIdList;
                if (profileHIdList) {
                    Promise.all(profileHIdList.map(async (profileHId) => {
                        const profilePId = getProfilePIdFromHash(profileHId);
                        const profileStatsLog = await getProfileStatsByTourney(profilePId, tournamentPId);
                        if (profileStatsLog) {
                            return Promise.all(Object.keys(profileStatsLog.RoleStats).map(async (role) => {
                                return new Promise(async (resolveObject) => {
                                    const statsObject = profileStatsLog.RoleStats[role];
                                    statsObject.ProfileName = await getProfileName(profileHId);
                                    statsObject.Role = role;
                                    resolveObject(statsObject);
                                });
                            }));
                        }
                    })).then((statsLogArray) => {
                        const profileObject = {};
                        profileObject['PlayerList'] = statsLogArray.flat();;
                        cache.set(cacheKey, JSON.stringify(profileObject, null, 2), 'EX', GLOBAL_CONSTS.TTL_DURATION);
                        resolve(profileObject);
                    });
                }
                else {
                    resolve({});    // If 'ProfileHIdList' does not exist
                }
            }).catch((ex) => { 
                console.error(ex); reject(ex); 
            });
        });
    });
}

/**
 * Returns an Object['TeamList'] that contains a list of Stats for each Team in the Tournament
 * @param {number} tournamentPId 
 */
export const getTournamentTeamStats = (tournamentPId) => {
    const cacheKey = CACHE_KEYS.TN_TEAM_PREFIX + tournamentPId;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, (err, data) => {
            if (err) { console(err); reject(err); return; }
            else if (data) { resolve(JSON.parse(data)); return; }
            dynamoDbGetItem('Tournament', tournamentPId).then((tournamentObject) => {
                const teamHIdList = tournamentObject.TeamHIdList;
                if (teamHIdList) {
                    Promise.all(teamHIdList.map(async (teamHId) => {
                        const teamPId = getTeamPIdFromHash(teamHId);
                        const teamStatsLog = await getTeamStatsByTourney(teamPId, tournamentPId);
                        if (teamStatsLog) {
                            return new Promise(async (resolveObject) => {
                                teamStatsLog.TeamName = await getTeamName(teamHId);
                                resolveObject(teamStatsLog);
                            });
                        }
                    })).then((statsLogArray) => {
                        const teamObject = {};
                        teamObject['TeamList'] = statsLogArray;
                        cache.set(cacheKey, JSON.stringify(teamObject, null, 2), 'EX', GLOBAL_CONSTS.TTL_DURATION);
                        resolve(teamObject);
                    });
                }
                else {
                    resolve({});    // If 'TeamHIdList' does not exist
                }
            }).catch((ex) => { 
                console.error(ex); reject(ex); 
            });
        });
    });
}

export const getTournamentPickBans = (tournamentPId) => {
    const cacheKey = CACHE_KEYS.TN_PICKBANS_PREFIX + tournamentPId;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, async (err, data) => {
            if (err) { console(err); reject(err); return; }
            else if (data != null) { resolve(JSON.parse(data)); return; }
            try {
                let tourneyJson = (await dynamoDbGetItem('Tournament', tournamentPId));
                let pickBansJson = {}
                if (tourneyJson.PickBans) {
                    const pbList = [];
                    const numberGames = tourneyJson.TourneyStats?.NumberGames;
                    pickBansJson['NumberGames'] = numberGames;
                    pickBansJson['MostRecentPatch'] = tourneyJson.Information?.MostRecentPatch;
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
                    cache.set(cacheKey, JSON.stringify(pickBansJson, null, 2), 'EX', GLOBAL_CONSTS.TTL_DURATION);
                }
                resolve(pickBansJson);
            }
            catch (ex) { console.error(ex); reject(ex); }
        });
    });
}

export const getTournamentGames = (tournamentPId) => {
    const cacheKey = CACHE_KEYS.TN_GAMES_PREFIX + tournamentPId;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, async (err, data) => {
            if (err) { console(err); reject(err); return; }
            else if (data != null) { resolve(JSON.parse(data)); return; }
            try {
                let gameLogJson = (await dynamoDbGetItem('Tournament', tournamentPId))['GameLog'];
                if (gameLogJson != null) {
                    for (let i = 0; i < Object.keys(gameLogJson).length; ++i) {
                        let matchId = Object.keys(gameLogJson)[i];
                        let gameJson = gameLogJson[matchId];
                        gameJson['MatchPId'] = matchId;
                        gameJson['BlueTeamName'] = await getTeamName(gameJson['BlueTeamHId']);
                        gameJson['RedTeamName'] = await getTeamName(gameJson['RedTeamHId']);
                    }
                    cache.set(cacheKey, JSON.stringify(gameLogJson, null, 2), 'EX', GLOBAL_CONSTS.TTL_DURATION);
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
            const profileIdsSqlList = await mySqlCallSProc('profilePIdsByTournamentPId', tournamentPId);
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
            const teamIdsSqlList = await mySqlCallSProc('teamPIdsByTournamentPId', tournamentPId);
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
            const tourneyDbObject = await dynamoDbGetItem('Tournament', tournamentPId);
            /*  
                -------------------
                Init DynamoDB Items
                -------------------
            */
            //#region Init Items (Shallow Copies)
            const tourneyStatsItem = {
                'NumberGames': 0,
                'BlueSideWins': 0,
                'TotalGameDuration': 0,
                'CloudDrakes': 0,
                'OceanDrakes': 0,
                'InfernalDrakes': 0,
                'MountainDrakes': 0,
                'ElderDrakes': 0,
            }
            const pickBansObject = await initPickBansObject(tourneyDbObject.Information.MostRecentPatch);
            const profileHIdSet = new Set();
            const teamHIdSet = new Set();
            const gameLogTourneyItem = {};

            const leaderboardsItem = {};
            leaderboardsItem['GameRecords'] = {};
            const gameRecords = leaderboardsItem['GameRecords'];
            //#endregion

            /*  
                -------------------
                Compile Data
                -------------------
            */
            const matchStatsSqlList = await mySqlCallSProc('matchStatsByTournamentId', tournamentPId);
            //#region Process GameLog Data
            for (const matchStatsSqlRow of matchStatsSqlList) {
                const matchPId = matchStatsSqlRow.riotMatchId;
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
    
                const matchObject = await dynamoDbGetItem('Matches', matchPId.toString());
                for (const teamId in matchObject.Teams) {
                    const teamObject = matchObject['Teams'][teamId];    
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
                    for (const playerObject of Object.values(teamObject['Players'])) {
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
                    'BlueTeamHId': matchObject['Teams'][GLOBAL_CONSTS.BLUE_ID]['TeamHId'],
                    'RedTeamHId': matchObject['Teams'][GLOBAL_CONSTS.RED_ID]['TeamHId'],
                    'Duration': matchObject.GameDuration,
                    'BlueWin': Boolean(matchObject['Teams'][GLOBAL_CONSTS.BLUE_ID]['Win']),
                    'Patch': matchObject.GamePatchVersion,
                };
                // Update 'MostRecentPatch'
                tourneyDbObject.Information.MostRecentPatch = matchObject.GamePatchVersion;
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
            const mostKillsGameSqlRow = (await mySqlCallSProc('mostKillsGameByTournamentId', tournamentPId))[0];
            gameRecords['MostKillGame'] = buildDefaultLeaderboardItem(mostKillsGameSqlRow);
            gameRecords['MostKillGame']['Kills'] = mostKillsGameSqlRow.totalKills;
            //#endregion
            leaderboardsItem['PlayerSingleRecords'] = {};
            const playerRecords = leaderboardsItem['PlayerSingleRecords'];
            //#region PlayerSingleRecords
            // Players Most Damage
            const playerMostDamageList = [];
            const mostDamageListSql = await mySqlCallSProc('playerMostDamageByTournamentId', tournamentPId);
            for (const mostDamageRowSql of mostDamageListSql) {
                const playerMostDamageItem = buildDefaultLeaderboardItem(mostDamageRowSql);
                playerMostDamageItem['ProfileHId'] = getProfileHashId(mostDamageRowSql.profilePId);
                playerMostDamageItem['ChampId'] = mostDamageRowSql.champId;
                playerMostDamageItem['Role'] = mostDamageRowSql.role;
                playerMostDamageItem['Side'] = mostDamageRowSql.side;
                playerMostDamageItem['DamagePerMin'] = mostDamageRowSql.dmgDealtPerMin;
                playerMostDamageItem['DamageDealt'] = mostDamageRowSql.damageDealt;
                playerMostDamageList.push(playerMostDamageItem);
            }
            playerRecords['PlayerMostDamage'] = playerMostDamageList;
            // Player Most Farm
            const playerMostFarmList = [];
            const mostFarmListSql = await mySqlCallSProc('playerMostFarmByTournamentId', tournamentPId);
            for (const mostFarmRowSql of mostFarmListSql) {
                const playerMostFarmItem = buildDefaultLeaderboardItem(mostFarmRowSql);
                playerMostFarmItem['ProfileHId'] = getProfileHashId(mostFarmRowSql.profilePId);
                playerMostFarmItem['ChampId'] = mostFarmRowSql.champId;
                playerMostFarmItem['Role'] = mostFarmRowSql.role;
                playerMostFarmItem['Side'] = mostFarmRowSql.side;
                playerMostFarmItem['CsPerMin'] = mostFarmRowSql.csPerMin;
                playerMostFarmItem['CreepScore'] = mostFarmRowSql.creepScore;
                playerMostFarmList.push(playerMostFarmItem);
            }
            playerRecords['PlayerMostFarm'] = playerMostFarmList;
            // Player Most GD@Early
            const playerMostGDiffEarlyList = [];
            const mostGDiffEarlyList = await mySqlCallSProc('playerMostGDEarlyByTournamentId', tournamentPId);
            for (const mostGDiffEarlyRowSql of mostGDiffEarlyList) {
                const playerMostGDiffEarlyItem = buildDefaultLeaderboardItem(mostGDiffEarlyRowSql);
                playerMostGDiffEarlyItem['ProfileHId'] = getProfileHashId(mostGDiffEarlyRowSql.profilePId);
                playerMostGDiffEarlyItem['ChampId'] = mostGDiffEarlyRowSql.champId;
                playerMostGDiffEarlyItem['Role'] = mostGDiffEarlyRowSql.role;
                playerMostGDiffEarlyItem['Side'] = mostGDiffEarlyRowSql.side;
                playerMostGDiffEarlyItem['GDiffEarly'] = mostGDiffEarlyRowSql.goldDiffEarly;
                playerMostGDiffEarlyItem['GAtEarly'] = mostGDiffEarlyRowSql.goldAtEarly;
                playerMostGDiffEarlyList.push(playerMostGDiffEarlyItem);
            }
            playerRecords['PlayerMostGoldDiffEarly'] = playerMostGDiffEarlyList;
            // Player Most XPD@Early
            const playerMostXpDiffEarlyList = [];
            const mostXpDiffListSql = await mySqlCallSProc('playerMostXPDEarlyByTournamentId', tournamentPId);
            for (const mostXpDiffEarlyRowSql of mostXpDiffListSql) {
                const playerMostXpDiffEarlyItem = buildDefaultLeaderboardItem(mostXpDiffEarlyRowSql);
                playerMostXpDiffEarlyItem['ProfileHId'] = getProfileHashId(mostXpDiffEarlyRowSql.profilePId);
                playerMostXpDiffEarlyItem['ChampId'] = mostXpDiffEarlyRowSql.champId;
                playerMostXpDiffEarlyItem['Role'] = mostXpDiffEarlyRowSql.role;
                playerMostXpDiffEarlyItem['Side'] = mostXpDiffEarlyRowSql.side;
                playerMostXpDiffEarlyItem['XpDiffEarly'] = mostXpDiffEarlyRowSql.xpDiffEarly;
                playerMostXpDiffEarlyItem['XpAtEarly'] = mostXpDiffEarlyRowSql.xpAtEarly;
                playerMostXpDiffEarlyList.push(playerMostXpDiffEarlyItem);
            }
            playerRecords['PlayerMostXpDiffEarly'] = playerMostXpDiffEarlyList;
            // Player Most Vision
            const playerMostVisionList = [];
            const mostVisionListSql = await mySqlCallSProc('playerMostVisionByTournamentId', tournamentPId);
            for (const mostVisionRowSql of mostVisionListSql) {
                const playerMostVisionItem = buildDefaultLeaderboardItem(mostVisionRowSql);
                playerMostVisionItem['ProfileHId'] = getProfileHashId(mostVisionRowSql.profilePId);
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
            const teamRecords = leaderboardsItem['TeamSingleRecords'];
            //#region TeamSingleRecords
            // Team Top Baron Power Plays
            const teamTopBaronPPList = [];
            const topBaronPPListSql = await mySqlCallSProc('teamTopBaronPPByTournamentId', tournamentPId);
            for (const topBaronPPRowSql of topBaronPPListSql) {
                const teamBaronPPItem = buildDefaultLeaderboardItem(topBaronPPRowSql);
                teamBaronPPItem['TeamHId'] = getTeamHashId(topBaronPPRowSql.teamPId);
                teamBaronPPItem['Timestamp'] = topBaronPPRowSql.timestamp;
                teamBaronPPItem['BaronPowerPlay'] = topBaronPPRowSql.baronPowerPlay;
                teamTopBaronPPList.push(teamBaronPPItem);
            }
            teamRecords['TeamTopBaronPowerPlay'] = teamTopBaronPPList;
            // Team Earliest Towers
            const teamEarliestTowerList = [];
            const earliestTowerListSql = await mySqlCallSProc('teamEarliestTowerByTournamentId', tournamentPId);
            for (const earliestTowerRowSql of earliestTowerListSql) {
                const teamEarliestTowerItem = buildDefaultLeaderboardItem(earliestTowerRowSql);
                teamEarliestTowerItem['TeamHId'] = getTeamHashId(earliestTowerRowSql.teamPId);
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
            await dynamoDbUpdateItem('Tournament', tournamentPId,
                'SET #info = :val',
                {
                    '#info': 'Information'
                },
                {
                    ':val': tourneyDbObject['Information']
                }
            );
            await dynamoDbUpdateItem('Tournament', tournamentPId,
                'SET #tStats = :val',
                {
                    '#tStats': 'TourneyStats'
                },
                {
                    ':val': tourneyStatsItem
                }
            );
            await dynamoDbUpdateItem('Tournament', tournamentPId,
                'SET #pb = :val',
                {
                    '#pb': 'PickBans'
                },
                {
                    ':val': pickBansObject
                }
            );
            await dynamoDbUpdateItem('Tournament', tournamentPId,
                'SET #pHIdList = :val',
                {
                    '#pHIdList': 'ProfileHIdList'
                },
                {
                    ':val': Array.from(profileHIdSet)
                }
            );
            await dynamoDbUpdateItem('Tournament', tournamentPId,
                'SET #tHIdList = :val',
                {
                    '#tHIdList': 'TeamHIdList'
                },
                {
                    ':val': Array.from(teamHIdSet)
                }
            );
            await dynamoDbUpdateItem('Tournament', tournamentPId,
                'SET #gLog = :val',
                {
                    '#gLog': 'GameLog'
                },
                {
                    ':val': gameLogTourneyItem
                }
            );
            await dynamoDbUpdateItem('Tournament', tournamentPId,
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
            cache.del(CACHE_KEYS.TN_INFO_PREFIX + tournamentPId);
            cache.del(CACHE_KEYS.TN_STATS_PREFIX + tournamentPId);
            cache.del(CACHE_KEYS.TN_PLAYER_PREFIX + tournamentPId);
            cache.del(CACHE_KEYS.TN_TEAM_PREFIX + tournamentPId);
            cache.del(CACHE_KEYS.TN_PICKBANS_PREFIX + tournamentPId);
            cache.del(CACHE_KEYS.TN_GAMES_PREFIX + tournamentPId);
            cache.del(CACHE_KEYS.TN_LEADER_PREFIX + tournamentPId);
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
 * @param {string} patch        If null, will return latest
 * @returns Promise<Object>
 */
function initPickBansObject(patch) {
    return new Promise((resolve, reject) => {
        createChampObject(patch).then((champObject) => {
            const newPickBansObject = {};
            for (const champId in champObject) {
                newPickBansObject[champId] = {
                    'BluePicks': 0,
                    'RedPicks': 0,
                    'NumWins': 0,
                    'BlueBans': 0,
                    'RedBans': 0,
                }
            }
            resolve(newPickBansObject);
        }).catch((err) => {
            reject(err);
        })
    })
}

/**
 * Add ban array into existing pickBansObject
 * @param {object} pickBansObject   Pick bans object
 * @param {Array} banArray          Array of ban Ids from Team
 * @param {string} teamId           "100" == Blue, "200" == Red
 */
function addBansToTourneyItem(pickBansObject, banArray, teamId) {
    for (const champBanned of banArray) {
        if (teamId == GLOBAL_CONSTS.BLUE_ID) {
            pickBansObject[champBanned]['BlueBans']++;
        }
        else if (teamId == GLOBAL_CONSTS.RED_ID) {
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
    const playersObject = teamObject['Players'];
    for (const singlePlayerObject of Object.values(playersObject)) {
        const champPicked = singlePlayerObject['ChampId'];
        if (teamId == GLOBAL_CONSTS.BLUE_ID) {
            pickBansObject[champPicked]['BluePicks']++;
        }
        else if (teamId == GLOBAL_CONSTS.RED_ID) {
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
        'BlueTeamHId': getTeamHashId(matchSqlRow.blueTeamPId),
        'RedTeamHId': getTeamHashId(matchSqlRow.redTeamPId),
    };
}
//#endregion