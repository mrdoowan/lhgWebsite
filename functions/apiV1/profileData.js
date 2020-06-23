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
    putGameLog: updateProfileGameLog,
    putStatsLog: updateProfileStatsLog,
    updateName: updateProfileName,
}

/*  Declaring npm modules */
require('dotenv').config({ path: '../../.env' });
const redis = require('redis');
const cache = (process.env.NODE_ENV === 'production') ? redis.createClient(process.env.REDIS_URL) : redis.createClient(process.env.REDIS_PORT);

/*  Import helper function modules */
const GLOBAL = require('./global');
const dynamoDb = require('./dynamoDbHelper');
const mySql = require('./mySqlHelper');
const lambda = require('./awsLambdaHelper');
const keyBank = require('./cacheKeys');
// Data Functions
const Season = require('./seasonData');
const Tournament = require('./tournamentData');
const Team = require('./teamData');
const matchData = require('./matchData');

// Get ProfilePId from ProfileName
function getProfilePIdByName(name) {
    let simpleName = GLOBAL.filterName(name);
    const cacheKey = keyBank.PROFILE_PID_BYNAME_PREFIX + simpleName;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, (err, data) => {
            if (err) { console.error(err); reject(err); return; }
            else if (data != null) { resolve(data); return; }
            dynamoDb.getItem('ProfileNameMap', 'ProfileName', simpleName)
            .then((obj) => {
                if (obj == null) { resolve(null); return; } // Not Found 
                let pPId = GLOBAL.getProfilePId(obj['ProfileHId']);
                cache.set(cacheKey, pPId);
                resolve(pPId);
            }).catch((error) => { console.error(error); reject(error) });
        });
    });
}

// Get ProfilePId from Riot Summoner Id
function getProfilePIdBySummonerId(summId) {
    const cacheKey = keyBank.PROFILE_PID_BYSUMM_PREFIX + summId;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, (err, data) => {
            if (err) { console.error(err); reject(err); return; }
            else if (data != null) { resolve(data); return; }
            dynamoDb.getItem('SummonerIdMap', 'SummonerId', summId)
            .then((obj) => {
                if (obj == null) { resolve(null); return; } // Not Found
                let pPId = GLOBAL.getProfilePId(obj['ProfileHId']);
                cache.set(cacheKey, pPId);
                resolve(pPId);
            }).catch((error) => { console.error(error); reject(error) });
        });
    });
}

// Get ProfileName from DynamoDb
// hash=true if id is HId, hash=false if id id PId
function getProfileName(id, hash=true) {
    let pPId = (hash) ? GLOBAL.getProfilePId(id) : id;
    const cacheKey = keyBank.PROFILE_NAME_PREFIX + pPId;
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
    const cacheKey = keyBank.PROFILE_INFO_PREFIX + pPId;
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
                        profileInfoJson['SeasonList'] = await GLOBAL.getSeasonItems(Object.keys(gameLogJson));
                    }
                    // Add Tournament List
                    let statsLogJson = (await dynamoDb.getItem('Profile', 'ProfilePId', pPId))['StatsLog'];
                    if (statsLogJson != null) {
                        profileInfoJson['TournamentList'] = await GLOBAL.getTourneyItems(Object.keys(statsLogJson));
                    }
                    cache.set(cacheKey, JSON.stringify(profileInfoJson, null, 2), 'EX', GLOBAL.TTL_DURATION_2HRS);
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
    return new Promise(async function(resolve, reject) {
        try {
            let gameLogJson = (await dynamoDb.getItem('Profile', 'ProfilePId', pPId))['GameLog'];
            if (gameLogJson != null) {
                const seasonId = (sPId) ? sPId : (Math.max(...Object.keys(gameLogJson)));    // if season parameter Id is null, find latest
                const cacheKey = keyBank.PROFILE_GAMES_PREFIX + pPId + '-' + seasonId;
                cache.get(cacheKey, async (err, data) => {
                    if (err) { console(err); reject(err); return; }
                    else if (data != null) { resolve(JSON.parse(data)); return; }
                    let profileGamesJson = gameLogJson[seasonId];
                    if (profileGamesJson == null) { resolve(null); return; } // Not Found

                    // Process Data
                    profileGamesJson['SeasonTime'] = await Season.getTime(seasonId);
                    profileGamesJson['SeasonName'] = await Season.getName(seasonId);
                    profileGamesJson['SeasonShortName'] = await Season.getShortName(seasonId);
                    for (let i = 0; i < Object.values(profileGamesJson['Matches']).length; ++i) {
                        let matchJson = Object.values(profileGamesJson['Matches'])[i];
                        matchJson['TeamName'] = await Team.getName(matchJson['TeamHId']);
                        matchJson['EnemyTeamName'] = await Team.getName(matchJson['EnemyTeamHId']);
                        matchJson['KillPct'] = ((matchJson['Kills'] + matchJson['Assists']) / matchJson['TeamKills']).toFixed(4);
                        matchJson['DamagePct'] = (matchJson['DamageDealt'] / matchJson['TeamDamage']).toFixed(4);
                        matchJson['GoldPct'] = (matchJson['Gold'] / matchJson['TeamGold']).toFixed(4);
                        matchJson['VisionScorePct'] = (matchJson['VisionScore'] / matchJson['TeamVS']).toFixed(4);
                    }
                    cache.set(cacheKey, JSON.stringify(profileGamesJson, null, 2), 'EX', GLOBAL.TTL_DURATION_2HRS);
                    resolve(profileGamesJson);
                })
            }
            else {
                if (sPId == null) { resolve({}); }  // 'GameLog' does not exist while trying to find Latest
                else { resolve(null); return; } // Not Found
            }
        }
        catch (error) { console.error(error); reject(error); }
    });
}

function getProfileStatsByTourney(pPId, tPId=null) {
    return new Promise(async function(resolve, reject) {
        try {
            let statsLogJson = (await dynamoDb.getItem('Profile', 'ProfilePId', pPId))['StatsLog'];
            if (statsLogJson != null) {
                const tourneyId = (tPId) ? tPId : (Math.max(...Object.keys(statsLogJson)));    // if tourney parameter Id is null, find latest
                const cacheKey = keyBank.PROFILE_STATS_PREFIX + pPId + '-' + tourneyId;
                cache.get(cacheKey, async (err, data) => {
                    if (err) { console(err); reject(err); return; }
                    else if (data != null) { resolve(JSON.parse(data)); return; }
                    // Process Data
                    let profileStatsJson = statsLogJson[tourneyId];
                    if (profileStatsJson == null) { resolve(null); return; }    // Not Found
                    profileStatsJson['TournamentName'] = await Tournament.getName(tourneyId);
                    profileStatsJson['TournamentShortName'] = await Tournament.getShortName(tourneyId);
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
                    cache.set(cacheKey, JSON.stringify(profileStatsJson, null, 2), 'EX', GLOBAL.TTL_DURATION_2HRS);
                    resolve(profileStatsJson);
                });
            }
            else {
                if (tPId == null) { resolve({}); }  // If 'StatsLog' does not exist
                else { resolve(null); return; }     // Not Found
            }
        }
        catch (error) { console.error(error); reject(error); }
        
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

// Add new profiles and its summoner accounts. 
// First Summoner listed will automatically be flagged as 'main'
// BODY EXAMPLE:
// {
//     "profileName": "NAME",
//     "summonerName": "SUMM_NAME",
// }
// Add to "Profile", "ProfileNameMap", "SummonerIdMap" Table
function postNewProfile(profileName, summId) {
    return new Promise(async (resolve, reject) => {
        try {
            // Generate a new Profile ID
            let newPId = await GLOBAL.generateNewPId('Profile');
            let newProfileItem = {
                'Information': {
                    'LeagueAccounts': {
                        [summId]: {
                            'MainAccount': true,
                        }
                    },
                    'ProfileName': profileName,
                },
                'ProfileName': profileName,
                'ProfilePId': newPId,
            };
            // Add to 'Profile' Table
            await dynamoDb.putItem('Profile', newProfileItem, newPId);
            // Add to 'ProfileNameMap' Table
            let simpleProfileName = GLOBAL.filterName(newProfileItem['ProfileName']);
            let newProfileMap = {
                'ProfileName': simpleProfileName,
                'ProfileHId': GLOBAL.getProfileHId(newPId),
            }
            await dynamoDb.putItem('ProfileNameMap', newProfileMap, simpleProfileName);
            // Add to 'SummonerIdMap' Table
            let newSummonerMap = {
                'SummonerId': summId,
                'ProfileHId': GLOBAL.getProfileHId(newPId),
            };
            await dynamoDb.putItem('SummonerIdMap', newSummonerMap, summId);
            
            resolve({
                'SummonerId': summId,
                'ProfileName': newProfileItem['ProfileName'],
                'ProfilePId': newPId,
            });
        }
        catch (err) { console.error(err); reject(err); }
    });
}

// Add summoner account to profile. Summoner will not be flagged as 'main'
// BODY EXAMPLE:
// {
//     "profileName": "NAME",
//     "summonerName": "SUMM_NAME",
// }
// Update "Profile" Information
function updateProfileInfo(profilePId, summId, item) {
    return new Promise(async (resolve, reject) => {
        try {
            await dynamoDb.updateItem('Profile', 'ProfilePId', profilePId,
                'SET #key = :data',
                {
                    '#key': 'Information',
                },
                {
                    ':data': item
                }
            );
            // Add to 'SummonerIdMap' Table
            let newSummonerMap = {
                'SummonerId': summId,
                'ProfileHId': GLOBAL.getProfileHId(profilePId),
            };
            await dynamoDb.putItem('SummonerIdMap', newSummonerMap, summId);

            // Cache set Key: PROFILE_INFO_PREFIX
            cache.del(keyBank.PROFILE_INFO_PREFIX + profilePId);

            resolve(item);
        }
        catch (err) { console.error(err); reject(err); }
    });
}

// Update a Profile Name.
// BODY EXAMPLE:
// {
//     "currentName": "OLD_NAME",
//     "newName": "NEW_NAME",
// }
// Change Profile name. Update "Profile", "ProfileNameMap" table
function updateProfileName(profilePId, newName, oldName) {
    return new Promise(async (resolve, reject) => {
        try {
            // Update "Profile" table
            await dynamoDb.updateItem('Profile', 'ProfilePId', profilePId,
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
                'ProfileName': GLOBAL.filterName(newName),
                'ProfileHId': GLOBAL.getProfileHId(profilePId),
            }, GLOBAL.filterName(newName));
            // Delete oldName from "ProfileNameMap" table
            await dynamoDb.deleteItem('ProfileNameMap', 'ProfileName', GLOBAL.filterName(oldName));

            // Del Cache
            cache.del(keyBank.PROFILE_PID_BYNAME_PREFIX + GLOBAL.filterName(oldName));
            cache.del(keyBank.PROFILE_NAME_PREFIX + profilePId);
            cache.del(keyBank.PROFILE_INFO_PREFIX + profilePId)

            resolve({
                'ProfilePId': profilePId,
                'NewProfileName': newName,
                'OldProfileName': oldName,
            });
        }
        catch (err) { console.error(err); reject(err); }
    })
}

// Returns an object indicating Profile GameLog has been updated
function updateProfileGameLog(profilePId, tournamentPId) {
    return new Promise(async (resolve, reject) => {
        try {
            let tourneyDbObject = await dynamoDb.getItem('Tournament', 'TournamentPId', tournamentPId);
            let seasonPId = tourneyDbObject['Information']['SeasonPId'];
            let profileDbObject = await dynamoDb.getItem('Profile', 'ProfilePId', profilePId);
            
            /*  
                -------------------
                Init DynamoDB Items
                -------------------
            */
            // #region Init Items
            const initProfileSeasonGames = {
                'Matches': {}
            }
            const initProfileGameLog = { [seasonPId]: initProfileSeasonGames };
            // Check if 'GameLog' exists in Profile
            if (!('GameLog' in profileDbObject)) {
                await dynamoDb.updateItem('Profile', 'ProfilePId', profilePId,
                    'SET #gLog = :val',
                    { 
                        '#gLog': 'GameLog'
                    },
                    { 
                        ':val': initProfileGameLog
                    }
                );
                profileDbObject['GameLog'] = initProfileGameLog;
            }
            // Check if that season exists in the GameLogs
            else if (!(seasonPId in profileDbObject['GameLog'])) {
                await dynamoDb.updateItem('Profile', 'ProfilePId', profilePId,
                    'SET #gLog.#sId = :val',
                    {
                        '#gLog': 'GameLog',
                        '#sId': seasonPId
                    },
                    {
                        ':val': initProfileSeasonGames
                    }
                );
                profileDbObject['GameLog'][seasonPId] = initProfileSeasonGames;
            }
            // #endregion

            // Shallow copy
            let gameLogProfileItem = profileDbObject['GameLog'][seasonPId]['Matches'];

            /*  
                -------------
                Game Log
                -------------
            */
            // #region Compile Data
            // Load each Stat into Profile in tournamentId
            let matchDataList = await mySql.callSProc('playerMatchesByTournamentPId', profilePId, tournamentPId);
            console.log(`Profile '${profilePId}' played ${matchDataList.length} matches in TournamentPID '${tournamentPId}'.`);
            for (let matchIdx = 0; matchIdx < matchData.length; ++matchIdx) {
                let sqlPlayerStats = matchDataList[matchIdx];
                let matchPId = sqlPlayerStats.riotMatchId;
                let profileGameItem = {
                    'DatePlayed': sqlPlayerStats.datePlayed,
                    'TournamentType': sqlPlayerStats.tournamentType,
                    'GameWeekNumber': 0, // N/A
                    'TeamHId': GLOBAL.getTeamHId(sqlPlayerStats.teamPId),
                    'ChampionPlayed': sqlPlayerStats.champId,
                    'Role': sqlPlayerStats.role,
                    'Win': (sqlPlayerStats.win == 1) ? true : false,
                    'Vacated': false,
                    'EnemyTeamHId': GLOBAL.getTeamHId((sqlPlayerStats.side === 'Blue') ? sqlPlayerStats.redTeamPId : sqlPlayerStats.blueTeamPId),
                    'GameDuration': sqlPlayerStats.duration,
                    'Kills': sqlPlayerStats.kills,
                    'Deaths': sqlPlayerStats.deaths,
                    'Assists': sqlPlayerStats.assists,
                    'DamageDealt': sqlPlayerStats.damageDealt,
                    'Gold': sqlPlayerStats.gold,
                    'VisionScore': sqlPlayerStats.visionScore,
                    'TeamKills': sqlPlayerStats.teamKills,
                    'TeamDamage': sqlPlayerStats.teamDamage,
                    'TeamGold': sqlPlayerStats.teamGold,
                    'TeamVS': sqlPlayerStats.teamVS,
                    'GoldAtEarly': sqlPlayerStats.goldAtEarly,
                    'GoldAtMid': sqlPlayerStats.goldAtMid,
                    'CsAtEarly': sqlPlayerStats.csAtEarly,
                    'CsAtMid': sqlPlayerStats.csAtMid,
                    'XpAtEarly': sqlPlayerStats.xpAtEarly,
                    'XpAtMid': sqlPlayerStats.xpAtMid,
                    'GoldDiffEarly': sqlPlayerStDiffs.goldDiffEarly,
                    'GoldDiffMid': sqlPlayerStDiffs.goldDiffMid,
                    'CsDiffEarly': sqlPlayerStDiffs.csDiffEarly,
                    'CsDiffMid': sqlPlayerStDiffs.csDiffMid,
                    'XpDiffEarly': sqlPlayerStDiffs.xpDiffEarly,
                    'XpDiffMid': sqlPlayerStDiffs.xpDiffMid,
                };
                gameLogProfileItem[matchPId] = profileGameItem;
            }
            //#endregion
            
            /*  
                ----------
                Push into DB
                ----------
            */
            await dynamoDb.updateItem('Profile', 'ProfilePId', profilePId,
                'SET #log.#sId.#mtch = :data',
                {
                    '#log': 'GameLog',
                    '#sId': seasonPId,
                    '#mtch': 'Matches',
                },
                {
                    ':data': gameLogProfileItem
                }
            );
            // Delete Cache
            cache.del(keyBank.PROFILE_GAMES_PREFIX + profilePId + '-' + seasonPId);

            resolve({
                profileId: profilePId,
                tournamentId: tournamentPId,
                tournamentName: tourneyDbObject['TournamentName'],
                numberMatches: matchDataList.length,
                typeUpdated: 'GameLog',
            });
        }
        catch (err) { reject({ error: err }); }
    });
}

// Returns an object indicating Profile StatsLog has been updated
function updateProfileStatsLog(profilePId, tournamentPId) {
    return new Promise(async (resolve, reject) => {
        try {
            let profileDbObject = await dynamoDb.getItem('Profile', 'ProfilePId', profilePId);

            /*  
                -------------------
                Init DynamoDB Items
                -------------------
            */
            // #region Init Items
            const initProfileTourneyStatsGames = {
                'RoleStats': {}
            }
            const initStatsLog = { [tournamentPId]: initProfileTourneyStatsGames };
            if (!('StatsLog' in profileDbObject)) {
                await dynamoDb.updateItem('Profile', 'ProfilePId', profilePId,
                    'SET #sLog = :val',
                    { 
                        '#sLog': 'StatsLog'
                    },
                    { 
                        ':val': initStatsLog
                    }
                );
                profileDbObject['StatsLog'] = initStatsLog;
            }
            // Check if that TournamentPId in StatsLog
            else if (!(tournamentPId in profileDbObject['StatsLog'])) {
                await dynamoDb.updateItem('Profile', 'ProfilePId', profilePId,
                    'SET #sLog.#tId = :val',
                    { 
                        '#sLog': 'StatsLog',
                        '#tId': tournamentPId,
                    },
                    { 
                        ':val': initProfileTourneyStatsGames
                    }
                );
                profileDbObject['StatsLog'][tournamentPId] = initProfileTourneyStatsGames;
            }
            // #endregion

            // shallow copy
            let statsLogProfileItem = profileDbObject['StatsLog'][tournamentPId]['RoleStats'];

            /*  
                ----------
                'StatsLog'
                ----------
            */
            // #region Compile Data
            let playerStatsTotalData = await mySql.callSProc('playerStatsTotalByTournamentId', profilePId, tournamentPId, GLOBAL.MINUTE_AT_EARLY, GLOBAL.MINUTE_AT_MID);
            for (let idx = 0; idx < playerStatsTotalData.length; ++idx) {
                let playerStatsTotalRow = playerStatsTotalData[idx];
                let role = playerStatsTotalRow.playerRole;
                // Initialize StatsLog Role 
                if (!(role in statsLogProfileItem)) {
                    statsLogProfileItem[role] = {};
                }
                // Get from sProc
                let statsRoleItem = statsLogProfileItem[role];
                statsRoleItem['GamesPlayed'] = playerStatsTotalRow.gamesPlayed;
                statsRoleItem['GamesPlayedOverEarly'] = playerStatsTotalRow.gamesPlayedOverEarly;
                statsRoleItem['GamesPlayedOverMid'] = playerStatsTotalRow.gamesPlayedOverMid;
                statsRoleItem['TotalGameDuration'] = playerStatsTotalRow.totalDuration;
                statsRoleItem['GamesWin'] = playerStatsTotalRow.totalWins;
                statsRoleItem['TotalKills'] = playerStatsTotalRow.totalKills;
                statsRoleItem['TotalDeaths'] = playerStatsTotalRow.totalDeaths;
                statsRoleItem['TotalAssists'] = playerStatsTotalRow.totalAssists;
                statsRoleItem['TotalCreepScore'] = playerStatsTotalRow.totalCreepScore;
                statsRoleItem['TotalDamage'] = playerStatsTotalRow.totalDamage;
                statsRoleItem['TotalGold'] = playerStatsTotalRow.totalGold;
                statsRoleItem['TotalVisionScore'] = playerStatsTotalRow.totalVisionScore;
                statsRoleItem['TotalCsAtEarly'] = playerStatsTotalRow.totalCsAtEarly;
                statsRoleItem['TotalGoldAtEarly'] = playerStatsTotalRow.totalGoldAtEarly;
                statsRoleItem['TotalXpAtEarly'] = playerStatsTotalRow.totalXpAtEarly;
                statsRoleItem['TotalCsDiffEarly'] = playerStatsTotalRow.totalCsDiffEarly;
                statsRoleItem['TotalGoldDiffEarly'] = playerStatsTotalRow.totalGoldDiffEarly;
                statsRoleItem['TotalXpDiffEarly'] = playerStatsTotalRow.totalXpDiffEarly;
                statsRoleItem['TotalCsAtMid'] = playerStatsTotalRow.totalCsAtMid;
                statsRoleItem['TotalGoldAtMid'] = playerStatsTotalRow.totalGoldAtMid;
                statsRoleItem['TotalXpAtMid'] = playerStatsTotalRow.totalXpAtMid;
                statsRoleItem['TotalCsDiffMid'] = playerStatsTotalRow.totalCsDiffMid;
                statsRoleItem['TotalGoldDiffMid'] = playerStatsTotalRow.totalGoldDiffMid;
                statsRoleItem['TotalXpDiffMid'] = playerStatsTotalRow.totalXpDiffMid;
                statsRoleItem['TotalFirstBloods'] = playerStatsTotalRow.totalFirstBloods;
                statsRoleItem['TotalTeamKills'] = playerStatsTotalRow.totalTeamKills;
                statsRoleItem['TotalTeamDeaths'] = playerStatsTotalRow.totalTeamDeaths;
                statsRoleItem['TotalTeamDamage'] = playerStatsTotalRow.totalTeamDamage;
                statsRoleItem['TotalTeamGold'] = playerStatsTotalRow.totalTeamGold;
                statsRoleItem['TotalTeamVisionScore'] = playerStatsTotalRow.totalTeamVisionScore;
                statsRoleItem['TotalWardsPlaced'] = playerStatsTotalRow.totalWardsPlaced;
                statsRoleItem['TotalControlWardsBought'] = playerStatsTotalRow.totalControlWardsBought;
                statsRoleItem['TotalWardsCleared'] = playerStatsTotalRow.totalWardsCleared;
                statsRoleItem['TotalSoloKills'] = playerStatsTotalRow.totalSoloKills;
                statsRoleItem['TotalDoubleKills'] = playerStatsTotalRow.totalDoubleKills;
                statsRoleItem['TotalTripleKills'] = playerStatsTotalRow.totalTripleKills;
                statsRoleItem['TotalQuadraKills'] = playerStatsTotalRow.totalQuadraKills;
                statsRoleItem['TotalPentaKills'] = playerStatsTotalRow.totalPentaKills;
            }
            // #endregion
            
            /*  
                ----------
                Push into DB
                ----------
            */
            await dynamoDb.updateItem('Profile', 'ProfilePId', profilePId, 
                'SET #slog.#tId.#rStats = :data',
                {
                    '#slog': 'StatsLog',
                    '#tId': tournamentPId,
                    '#rStats': 'RoleStats',
                },
                {
                    ':data': statsLogProfileItem
                }
            );
            // Delete Cache
            cache.del(keyBank.PROFILE_STATS_PREFIX + profilePId + '-' + seasonPId);

            resolve({
                profileId: profilePId,
                tournamentId: tournamentPId,
                tournamentName: tourneyDbObject['TournamentName'],
                typeUpdated: 'StatsLog',
            })
        }
        catch (err) { reject({ error: err }) }
    });
}