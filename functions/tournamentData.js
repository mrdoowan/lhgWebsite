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
const Profile = require('./profileData');
const Team = require('./teamData');

// Get TournamentPId from DynamoDb
function getTournamentId(shortName) {
    let simpleName = helper.filterName(shortName);
    let cacheKey = keyBank.TN_ID_PREFIX + simpleName;
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

// Get TournamentShortName from DynamoDb
function getTournamentShortName(tPId) {
    let cacheKey = keyBank.TN_CODE_PREFIX + tPId;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, (err, data) => {
            if (err) { console(err); reject(err); return; }
            else if (data != null) { resolve(data); return; }
            dynamoDb.getItem('Tournament', 'TournamentPId', tPId, ['TournamentShortName'])
            .then((obj) => {
                if (obj == null) { resolve(null); return; } // Not Found
                let shortName = obj['TournamentShortName'];
                cache.set(cacheKey, shortName);
                resolve(shortName);
            }).catch((ex) => { console.error(ex); reject(ex); });
        });
    });
}

// Get TournamentName from DynamoDb
function getTournamentName(tPId) {
    let cacheKey = keyBank.TN_NAME_PREFIX + tPId;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, (err, data) => {
            if (err) { console(err); reject(err); return; }
            else if (data != null) { resolve(data); return; }
            dynamoDb.getItem('Tournament', 'TournamentPId', tPId, ['Information'])
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
    let cacheKey = keyBank.TN_TAB_PREFIX + tPId;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, (err, data) => {
            if (err) { console(err); reject(err); return; }
            else if (data != null) { resolve(data); return; }
            dynamoDb.getItem('Tournament', 'TournamentPId', tPId, ['Information'])
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
    let cacheKey = keyBank.TN_INFO_PREFIX + tPId;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, async (err, data) => {
            if (err) { console(err); reject(err); return; }
            else if (data != null) { resolve(JSON.parse(data)); return; }
            try {
                let tourneyInfoJson = (await dynamoDb.getItem('Tournament', 'TournamentPId', tPId, ['Information']))['Information'];
                if (tourneyInfoJson != null) {
                    tourneyInfoJson['SeasonName'] = await Season.getName(tourneyInfoJson['SeasonPId']);
                    tourneyInfoJson['SeasonShortName'] = await Season.getShortName(tourneyInfoJson['SeasonPId']);
                    cache.set(cacheKey, JSON.stringify(tourneyInfoJson, null, 2));
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
    let cacheKey = keyBank.TN_STATS_PREFIX + tPId;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, async (err, data) => {
            if (err) { console(err); reject(err); return; }
            else if (data != null) { resolve(JSON.parse(data)); return; }
            try {
                let tourneyStatsJson = (await dynamoDb.getItem('Tournament', 'TournamentPId', tPId, ['TourneyStats']))['TourneyStats'];
                if (tourneyStatsJson != null) {
                    cache.set(cacheKey, JSON.stringify(tourneyStatsJson, null, 2));
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
    let cacheKey = keyBank.TN_LEADER_PREFIX + tPId;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, async (err, data) => {
            if (err) { console(err); reject(err); return; }
            else if (data != null) { resolve(JSON.parse(data)); return; }
            try {
                let leaderboardJson = (await dynamoDb.getItem('Tournament', 'TournamentPId', tPId, ['Leaderboards']))['Leaderboards'];
                if (leaderboardJson != null) {
                    let gameRecords = leaderboardJson['GameRecords'];
                    for (let i = 0; i < Object.values(gameRecords).length; ++i) {
                        let gameObject = Object.values(gameRecords)[i];
                        gameObject['BlueTeamName'] = await Team.getName(gameObject['BlueTeamHId']);
                        gameObject['RedTeamName'] = await Team.getName(gameObject['RedTeamHId']);
                    }
                    let playerRecords = leaderboardJson['PlayerSingleRecords'];
                    for (let i = 0; i < Object.values(playerRecords).length; ++i) {
                        let playerList = Object.values(playerRecords)[i];
                        for (let j = 0; j < playerList.length; ++j) {
                            let playerObject = playerList[j];
                            playerObject['ProfileName'] = await Profile.getName(playerObject['ProfileHId']);
                            playerObject['BlueTeamName'] = await Team.getName(playerObject['BlueTeamHId']);
                            playerObject['RedTeamName'] = await Team.getName(playerObject['RedTeamHId']);
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
                        }
                    }
                    cache.set(cacheKey, JSON.stringify(leaderboardJson, null, 2));
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

function getTourneyPlayerStats(tPId) {
    let cacheKey = keyBank.TN_PLAYER_PREFIX + tPId;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, async (err, data) => {
            if (err) { console(err); reject(err); return; }
            else if (data != null) { resolve(JSON.parse(data)); return; }
            try {
                let profileHIdList = (await dynamoDb.getItem('Tournament', 'TournamentPId', tPId, ['ProfileHIdList']))['ProfileHIdList'];
                if (profileHIdList != null) {
                    let profileStatsList = [];
                    for (let i = 0; i < profileHIdList.length; ++i) {
                        let pPId = helper.getProfilePId(profileHIdList[i]);
                        let profileStatsLog = await Profile.getStats(pPId, tPId);
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
                                'KillPct': statsObj.KillPct,
                                'DeathPct': statsObj.DeathPct,
                                'GoldPct': statsObj.GoldPct,
                                'FirstBloodPct': statsObj.FirstBloodPct,
                                'DamagePct': statsObj.DamagePct,
                                'VisionScorePct': statsObj.VisionScorePct,
                                'CreepScorePerMinute': statsObj.CreepScorePerMinute,
                                'GoldPerMinute': statsObj.GoldPerMinute,
                                'DamagePerMinute': statsObj.DamagePerMinute,
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
                                'TotalDoubleKills': statsObj.TotalDoubleKills,
                                'TotalTripleKills': statsObj.TotalTripleKills,
                                'TotalQuadraKills': statsObj.TotalQuadraKills,
                                'TotalPentaKills': statsObj.TotalPentaKills,
                                'TotalSoloKills': statsObj.TotalSoloKills,
                            });
                        }
                    }
                    let profileObject = {};
                    profileObject['PlayerList'] = profileStatsList;
                    cache.set(cacheKey, JSON.stringify(profileObject, null, 2));
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

function getTourneyTeamStats(tPId) {
    let cacheKey = keyBank.TN_TEAM_PREFIX + tPId;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, async (err, data) => {
            if (err) { console(err); reject(err); return; }
            else if (data != null) { resolve(JSON.parse(data)); return; }
            try {
                let teamHIdList = (await dynamoDb.getItem('Tournament', 'TournamentPId', tPId, ['TeamHIdList']))['TeamHIdList'];
                if (teamHIdList != null) {
                    let teamStatsList = [];
                    for (let i = 0; i < teamHIdList.length; ++i) {
                        let teamId = helper.getTeamPId(teamHIdList[i]);
                        let teamStatsLog = await Team.getStats(teamId, tPId);
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
                    let teamObject = {};
                    teamObject['TeamList'] = teamStatsList;
                    cache.set(cacheKey, JSON.stringify(teamObject, null, 2));
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
    let cacheKey = keyBank.TN_PICKBANS_PREFIX + tPId;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, async (err, data) => {
            if (err) { console(err); reject(err); return; }
            else if (data != null) { resolve(JSON.parse(data)); return; }
            try {
                let tourneyJson = (await dynamoDb.getItem('Tournament', 'TournamentPId', tPId, ['PickBans', 'TourneyStats']));
                let pickBansJson = {}
                if (Object.keys(tourneyJson).length > 0) {
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
                    cache.set(cacheKey, JSON.stringify(pickBansJson, null, 2));
                }
                resolve(pickBansJson);
            }
            catch (ex) { console.error(ex); reject(ex); }
        });
    });
}

function getTourneyGames(tPId) {
    let cacheKey = keyBank.TN_GAMES_PREFIX + tPId;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, async (err, data) => {
            if (err) { console(err); reject(err); return; }
            else if (data != null) { resolve(JSON.parse(data)); return; }
            try {
                let gameLogJson = (await dynamoDb.getItem('Tournament', 'TournamentPId', tPId, ['GameLog']))['GameLog'];
                if (gameLogJson != null) {
                    for (let i = 0; i < Object.keys(gameLogJson).length; ++i) {
                        let matchId = Object.keys(gameLogJson)[i];
                        let gameJson = gameLogJson[matchId];
                        gameJson['MatchPId'] = matchId;
                        gameJson['BlueTeamName'] = await Team.getName(gameJson['BlueTeamHId']);
                        gameJson['RedTeamName'] = await Team.getName(gameJson['RedTeamHId']);
                    }
                    cache.set(cacheKey, JSON.stringify(gameLogJson, null, 2));
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