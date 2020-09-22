module.exports = {
    getId: getTournamentId,
    getShortName: getTournamentShortName,
    getTabName: getTournamentTabName,
    getName: getTournamentName,
    getInfo: getTourneyInfo,
    getTourneyStats: getTourneyStats,
    getLeaderboards: getTourneyLeaderboards,
    getPlayerStats: getTourneyPlayerStats,
    getTeamStats: getTourneyTeamStats,
    getPBStats: getTourneyPickBans,
    getGames: getTourneyGames,
    getPlayerList: getPlayerList,
    getTeamList: getTeamList,
    putOverallStats: updateTourneyOverall,
}

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
const Season = require('./seasonData');
const Profile = require('./profileData');
const Team = require('./teamData');

// Get TournamentPId from DynamoDb
function getTournamentId(shortName) {
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
 * @param {number} sPId      Tourney Id in number format
 */
function getTournamentShortName(tPId) {
    const cacheKey = keyBank.TN_CODE_PREFIX + tPId;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, (err, data) => {
            if (err) { console(err); reject(err); return; }
            else if (data != null) { resolve(data); return; }
            dynamoDb.getItem('Tournament', 'TournamentPId', tPId)
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
 * @param {number} sPId      Tourney Id in number format
 */
function getTournamentName(tPId) {
    const cacheKey = keyBank.TN_NAME_PREFIX + tPId;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, (err, data) => {
            if (err) { console(err); reject(err); return; }
            else if (data != null) { resolve(data); return; }
            dynamoDb.getItem('Tournament', 'TournamentPId', tPId)
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
function getTournamentTabName(tPId) {
    const cacheKey = keyBank.TN_TAB_PREFIX + tPId;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, (err, data) => {
            if (err) { console(err); reject(err); return; }
            else if (data != null) { resolve(data); return; }
            dynamoDb.getItem('Tournament', 'TournamentPId', tPId)
            .then((obj) => {
                if (obj == null) { resolve(null); return; } // Not Found
                let name = obj['Information']['TournamentTabName'];
                cache.set(cacheKey, name);
                resolve(name);
            }).catch((ex) => { console.error(ex); reject(ex); });
        });
    });
}

function getTourneyInfo(tPId) {
    const cacheKey = keyBank.TN_INFO_PREFIX + tPId;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, async (err, data) => {
            if (err) { console(err); reject(err); return; }
            else if (data != null) { resolve(JSON.parse(data)); return; }
            try {
                let tourneyInfoJson = (await dynamoDb.getItem('Tournament', 'TournamentPId', tPId))['Information'];
                if (tourneyInfoJson != null) {
                    tourneyInfoJson['SeasonName'] = await Season.getName(tourneyInfoJson['SeasonPId']);
                    tourneyInfoJson['SeasonShortName'] = await Season.getShortName(tourneyInfoJson['SeasonPId']);
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

function getTourneyStats(tPId) {
    const cacheKey = keyBank.TN_STATS_PREFIX + tPId;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, async (err, data) => {
            if (err) { console(err); reject(err); return; }
            else if (data != null) { resolve(JSON.parse(data)); return; }
            try {
                let tourneyStatsJson = (await dynamoDb.getItem('Tournament', 'TournamentPId', tPId))['TourneyStats'];
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

function getTourneyLeaderboards(tPId) {
    const cacheKey = keyBank.TN_LEADER_PREFIX + tPId;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, async (err, data) => {
            if (err) { console(err); reject(err); return; }
            else if (data != null) { resolve(JSON.parse(data)); return; }
            try {
                let leaderboardJson = (await dynamoDb.getItem('Tournament', 'TournamentPId', tPId))['Leaderboards'];
                if (leaderboardJson != null) {
                    let gameRecords = leaderboardJson['GameRecords'];
                    for (let i = 0; i < Object.values(gameRecords).length; ++i) {
                        let gameObject = Object.values(gameRecords)[i];
                        gameObject['BlueTeamName'] = await Team.getName(gameObject['BlueTeamHId']);
                        gameObject['RedTeamName'] = await Team.getName(gameObject['RedTeamHId']);
                        gameObject['BlueTeamShortName'] = await Team.getShortName(gameObject['BlueTeamHId']);
                        gameObject['RedTeamShortName'] = await Team.getShortName(gameObject['RedTeamHId']);
                    }
                    let playerRecords = leaderboardJson['PlayerSingleRecords'];
                    for (let i = 0; i < Object.values(playerRecords).length; ++i) {
                        let playerList = Object.values(playerRecords)[i];
                        for (let j = 0; j < playerList.length; ++j) {
                            let playerObject = playerList[j];
                            playerObject['ProfileName'] = await Profile.getName(playerObject['ProfileHId']);
                            playerObject['BlueTeamName'] = await Team.getName(playerObject['BlueTeamHId']);
                            playerObject['RedTeamName'] = await Team.getName(playerObject['RedTeamHId']);
                            playerObject['BlueTeamShortName'] = await Team.getShortName(playerObject['BlueTeamHId']);
                            playerObject['RedTeamShortName'] = await Team.getShortName(playerObject['RedTeamHId']);
                        }
                    }
                    let teamRecords = leaderboardJson['TeamSingleRecords'];
                    for (let i = 0; i < Object.values(teamRecords).length; ++i) {
                        let teamList = Object.values(teamRecords)[i];
                        for (let j = 0; j < teamList.length; ++j) {
                            let teamObject = teamList[j];
                            teamObject['TeamName'] = await Team.getName(teamObject['TeamHId']);
                            teamObject['BlueTeamName'] = await Team.getName(teamObject['BlueTeamHId']);
                            teamObject['RedTeamName'] = await Team.getName(teamObject['RedTeamHId']);
                            teamObject['BlueTeamShortName'] = await Team.getShortName(teamObject['BlueTeamHId']);
                            teamObject['RedTeamShortName'] = await Team.getShortName(teamObject['RedTeamHId']);
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
 * @param {number} tPId 
 */
function getTourneyPlayerStats(tPId) {
    const cacheKey = keyBank.TN_PLAYER_PREFIX + tPId;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, async (err, data) => {
            if (err) { console(err); reject(err); return; }
            else if (data != null) { resolve(JSON.parse(data)); return; }
            try {
                let profileHIdList = (await dynamoDb.getItem('Tournament', 'TournamentPId', tPId))['ProfileHIdList'];
                if (profileHIdList != null) {
                    let profileStatsList = [];
                    for (let i = 0; i < profileHIdList.length; ++i) {
                        let pPId = GLOBAL.getProfilePId(profileHIdList[i]);
                        let profileStatsLog = await Profile.getStats(pPId, tPId);
                        if (profileStatsLog != null) {
                            for (let j = 0; j < Object.keys(profileStatsLog['RoleStats']).length; ++j) {
                                let role = Object.keys(profileStatsLog['RoleStats'])[j];
                                let statsObj = profileStatsLog['RoleStats'][role];
                                profileStatsList.push({
                                    'ProfileName': await Profile.getName(profileHIdList[i]),
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
 * @param {number} tPId 
 */
function getTourneyTeamStats(tPId) {
    const cacheKey = keyBank.TN_TEAM_PREFIX + tPId;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, async (err, data) => {
            if (err) { console(err); reject(err); return; }
            else if (data != null) { resolve(JSON.parse(data)); return; }
            try {
                let teamHIdList = (await dynamoDb.getItem('Tournament', 'TournamentPId', tPId))['TeamHIdList'];
                if (teamHIdList != null) {
                    let teamStatsList = [];
                    for (let i = 0; i < teamHIdList.length; ++i) {
                        let teamId = GLOBAL.getTeamPId(teamHIdList[i]);
                        let teamStatsLog = await Team.getStats(teamId, tPId);
                        if (teamStatsLog != null) {
                            teamStatsList.push({
                                'TeamName': await Team.getName(teamHIdList[i]),
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

function getTourneyPickBans(tPId) {
    const cacheKey = keyBank.TN_PICKBANS_PREFIX + tPId;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, async (err, data) => {
            if (err) { console(err); reject(err); return; }
            else if (data != null) { resolve(JSON.parse(data)); return; }
            try {
                let tourneyJson = (await dynamoDb.getItem('Tournament', 'TournamentPId', tPId));
                let pickBansJson = {}
                if ('PickBans' in tourneyJson && 'TourneyStats' in tourneyJson) {
                    pbList = [];
                    let numberGames = tourneyJson['TourneyStats']['NumberGames'];
                    pickBansJson['NumberGames'] = numberGames;
                    for (let i = 0; i < Object.keys(tourneyJson['PickBans']).length; ++i) {
                        let champId = Object.keys(tourneyJson['PickBans'])[i];
                        let champObject = tourneyJson['PickBans'][champId];
                        champObject['Id'] = champId;
                        champObject['TimesPicked'] = champObject['BluePicks'] + champObject['RedPicks'];
                        champObject['TimesBanned'] = champObject['Phase1Bans'] + champObject['Phase2Bans'];
                        champObject['Presence'] = ((champObject['TimesPicked'] + champObject['TimesBanned']) / numberGames).toFixed(4);
                        champObject['NumLosses'] = champObject['TimesPicked'] - champObject['NumWins'];
                        pbList.push(champObject);
                    }
                    pickBansJson['PickBanList'] = pbList;
                    cache.set(cacheKey, JSON.stringify(pickBansJson, null, 2), 'EX', GLOBAL.TTL_DURATION);
                }
                resolve(pickBansJson);
            }
            catch (ex) { console.error(ex); reject(ex); }
        });
    });
}

function getTourneyGames(tPId) {
    const cacheKey = keyBank.TN_GAMES_PREFIX + tPId;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, async (err, data) => {
            if (err) { console(err); reject(err); return; }
            else if (data != null) { resolve(JSON.parse(data)); return; }
            try {
                let gameLogJson = (await dynamoDb.getItem('Tournament', 'TournamentPId', tPId))['GameLog'];
                if (gameLogJson != null) {
                    for (let i = 0; i < Object.keys(gameLogJson).length; ++i) {
                        let matchId = Object.keys(gameLogJson)[i];
                        let gameJson = gameLogJson[matchId];
                        gameJson['MatchPId'] = matchId;
                        gameJson['BlueTeamName'] = await Team.getName(gameJson['BlueTeamHId']);
                        gameJson['RedTeamName'] = await Team.getName(gameJson['RedTeamHId']);
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
function getPlayerList(tournamentPId) {
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
function getTeamList(tournamentPId) {
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
function updateTourneyOverall(tournamentPId) {
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
            let pickBansItem = {};
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
                    let phase1BanArray = teamObject['Phase1Bans'];
                    addBansToTourneyItem(pickBansItem, phase1BanArray, teamId, 1);
                    let phase2BanArray = teamObject['Phase2Bans'];
                    addBansToTourneyItem(pickBansItem, phase2BanArray, teamId, 2);
                    // Picks
                    addWinPicksToTourneyItem(pickBansItem, teamObject, teamId);
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
                    ':val': pickBansItem
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
function addBansToTourneyItem(pickBansItem, banArray, teamId, phaseNum) {
    let banPhaseString = 'Phase' + phaseNum + 'Bans';
    for (let k = 0; k < banArray.length; ++k) {
        let champBanned = banArray[k];
        if (!(champBanned in pickBansItem)) {
            pickBansItem[champBanned] = {
                'BluePicks': 0,
                'RedPicks': 0,
                'NumWins': 0,
                'Phase1Bans': 0,
                'Phase2Bans': 0,
                'BluePhase1Bans': 0,
                'RedPhase1Bans': 0,
                'BluePhase2Bans': 0,
                'RedPhase2Bans': 0
            };
        }
        pickBansItem[champBanned][banPhaseString]++;
        if (teamId == GLOBAL.BLUE_ID) {
            pickBansItem[champBanned]['Blue'+banPhaseString]++;
        }
        else if (teamId == GLOBAL.RED_ID) {
            pickBansItem[champBanned]['Red'+banPhaseString]++;
        }
    }
}

function addWinPicksToTourneyItem(pickBansItem, teamObject, teamId) {
    let playersObject = teamObject['Players'];
    for (let k = 0; k < Object.values(playersObject).length; ++k) {
        let playerObject = Object.values(playersObject)[k];
        let champPicked = playerObject['ChampId'];
        if (!(champPicked in pickBansItem)) {
            pickBansItem[champPicked] = {
                'BluePicks': 0,
                'RedPicks': 0,
                'NumWins': 0,
                'Phase1Bans': 0,
                'Phase2Bans': 0,
                'BluePhase1Bans': 0,
                'RedPhase1Bans': 0,
                'BluePhase2Bans': 0,
                'RedPhase2Bans': 0
            };
        }
        if (teamId == GLOBAL.BLUE_ID) {
            pickBansItem[champPicked]['BluePicks']++;
        }
        else if (teamId == GLOBAL.RED_ID) {
            pickBansItem[champPicked]['RedPicks']++;
        }
        pickBansItem[champPicked]['NumWins'] += teamObject['Win'];
    }
}

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