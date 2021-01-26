/*  Declaring npm modules */
require('dotenv').config({ path: '../../.env' });
const redis = require('redis');
const cache = (process.env.NODE_ENV === 'production') ? redis.createClient(process.env.REDIS_URL) : redis.createClient(process.env.REDIS_PORT);

/*  Import dependency modules */
import {
    filterName,
    getProfilePId,
    getProfileHashId,
    getTeamHashId,
    getSeasonItems,
    getTourneyItems,
    generateNewPId,
    GLOBAL_CONSTS,
} from './dependencies/global';
import {
    dynamoDbGetItem,
    dynamoDbUpdateItem,
    dynamoDbPutItem,
    dynamoDbDeleteItem,
} from './dependencies/dynamoDbHelper';
import { mySqlCallSProc } from './dependencies/mySqlHelper';
import { getRiotSummonerId } from './dependencies/awsLambdaHelper';
import { CACHE_KEYS } from './dependencies/cacheKeys'
/*  Import data functions */
import {
    getSeasonName,
    getSeasonShortName,
    getSeasonTime,
} from './seasonData';
import {
    getTournamentName,
    getTournamentShortName,
} from './tournamentData';
import { getTeamName } from './teamData';

// Get ProfilePId from ProfileName
export const getProfilePIdByName = (name) => {
    let simpleName = filterName(name);
    const cacheKey = CACHE_KEYS.PROFILE_PID_BYNAME_PREFIX + simpleName;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, (err, data) => {
            if (err) { console.error(err); reject(err); return; }
            else if (data != null) { resolve(data); return; }
            dynamoDbGetItem('ProfileNameMap', 'ProfileName', simpleName)
            .then((obj) => {
                if (obj == null) { resolve(null); return; } // Not Found 
                let pPId = getProfilePId(obj['ProfileHId']);
                cache.set(cacheKey, pPId);
                resolve(pPId);
            }).catch((error) => { console.error(error); reject(error) });
        });
    });
}

// Get ProfilePId from Riot Summoner Id
export const getProfilePIdBySummonerId = (summId) => {
    const cacheKey = CACHE_KEYS.PROFILE_PID_BYSUMM_PREFIX + summId;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, (err, data) => {
            if (err) { console.error(err); reject(err); return; }
            else if (data != null) { resolve(data); return; }
            dynamoDbGetItem('SummonerIdMap', 'SummonerId', summId)
            .then((obj) => {
                if (obj == null) { resolve(null); return; } // Not Found
                let pPId = getProfilePId(obj['ProfileHId']);
                cache.set(cacheKey, pPId);
                resolve(pPId);
            }).catch((error) => { console.error(error); reject(error) });
        });
    });
}

// Get ProfileName from DynamoDb
// hash=true if id is HId, hash=false if id id PId
export const getProfileName = (id, hash=true) => {
    let pPId = (hash) ? getProfilePId(id) : id;
    const cacheKey = CACHE_KEYS.PROFILE_NAME_PREFIX + pPId;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, (err, data) => {
            if (err) { console.error(err); reject(err); return; }
            else if (data != null) { resolve(data); return; }
            dynamoDbGetItem('Profile', 'ProfilePId', pPId)
            .then((obj) => {
                if (obj == null) { resolve(null); return; } // Not Found
                cache.set(cacheKey, obj['ProfileName']);
                resolve(obj['ProfileName']);
            }).catch((error) => { console.error(error); reject(error) });
        });
    });
}

export const getProfileInfo = (pPId) => {
    const cacheKey = CACHE_KEYS.PROFILE_INFO_PREFIX + pPId;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, async (err, data) => {
            if (err) { console(err); reject(err); return; }
            else if (data != null) { resolve(JSON.parse(data)); return; }
            try {
                let profileInfoJson = (await dynamoDbGetItem('Profile', 'ProfilePId', pPId))['Information'];
                if (profileInfoJson != null) { 
                    if ('ActiveSeasonPId' in profileInfoJson) {
                        profileInfoJson['ActiveSeasonShortName'] = await getSeasonShortName(profileInfoJson['ActiveSeasonPId']);
                        profileInfoJson['ActiveSeasonName'] = await getSeasonName(profileInfoJson['ActiveSeasonPId']);
                    }
                    if ('ActiveTeamHId' in profileInfoJson) {
                        profileInfoJson['ActiveTeamName'] = await getTeamName(profileInfoJson['ActiveTeamHId']);
                    }
                    // Add Season List
                    let gameLogJson = (await dynamoDbGetItem('Profile', 'ProfilePId', pPId))['GameLog'];
                    if (gameLogJson != null) {
                        profileInfoJson['SeasonList'] = await getSeasonItems(Object.keys(gameLogJson));
                    }
                    // Add Tournament List
                    let statsLogJson = (await dynamoDbGetItem('Profile', 'ProfilePId', pPId))['StatsLog'];
                    if (statsLogJson != null) {
                        profileInfoJson['TournamentList'] = await getTourneyItems(Object.keys(statsLogJson));
                    }
                    cache.set(cacheKey, JSON.stringify(profileInfoJson, null, 2), 'EX', GLOBAL_CONSTS.TTL_DURATION);
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

export const getProfileGamesBySeason = (pPId, sPId=null) => {
    return new Promise(async function(resolve, reject) {
        try {
            let profileObject = await dynamoDbGetItem('Profile', 'ProfilePId', pPId);
            if (profileObject != null) {
                let gameLogJson = profileObject['GameLog'];
                const seasonId = (sPId) ? sPId : (Math.max(...Object.keys(gameLogJson)));    // if season parameter Id is null, find latest
                const cacheKey = CACHE_KEYS.PROFILE_GAMES_PREFIX + pPId + '-' + seasonId;
                cache.get(cacheKey, async (err, data) => {
                    if (err) { console(err); reject(err); return; }
                    else if (data != null) { resolve(JSON.parse(data)); return; }
                    let profileGamesJson = gameLogJson[seasonId];
                    if (profileGamesJson == null) { resolve(null); return; } // Not Found
                    // Process Data
                    profileGamesJson['SeasonTime'] = await getSeasonTime(seasonId);
                    profileGamesJson['SeasonName'] = await getSeasonName(seasonId);
                    profileGamesJson['SeasonShortName'] = await getSeasonShortName(seasonId);
                    for (let i = 0; i < Object.values(profileGamesJson['Matches']).length; ++i) {
                        let matchJson = Object.values(profileGamesJson['Matches'])[i];
                        matchJson['TeamName'] = await getTeamName(matchJson['TeamHId']);
                        matchJson['EnemyTeamName'] = await getTeamName(matchJson['EnemyTeamHId']);
                        matchJson['Kda'] = (matchJson['Deaths'] > 0) ? ((matchJson['Kills'] + matchJson['Assists']) / matchJson['Deaths']).toFixed(2) : "Perfect";
                        matchJson['KillPct'] = (matchJson['TeamKills'] == 0) ? 0 : ((matchJson['Kills'] + matchJson['Assists']) / matchJson['TeamKills']).toFixed(4);
                        matchJson['DamagePct'] = (matchJson['DamageDealt'] / matchJson['TeamDamage']).toFixed(4);
                        matchJson['GoldPct'] = (matchJson['Gold'] / matchJson['TeamGold']).toFixed(4);
                        matchJson['VisionScorePct'] = (matchJson['VisionScore'] / matchJson['TeamVS']).toFixed(4);
                        let gameDurationMinute = matchJson['GameDuration'] / 60;
                        matchJson['CreepScorePerMinute'] = (matchJson['CreepScore'] / gameDurationMinute).toFixed(2);
                        matchJson['DamagePerMinute'] = (matchJson['DamageDealt'] / gameDurationMinute).toFixed(2);
                        matchJson['GoldPerMinute'] = (matchJson['Gold'] / gameDurationMinute).toFixed(2);
                        matchJson['VisionScorePerMinute'] = (matchJson['VisionScore'] / gameDurationMinute).toFixed(2);
                    }
                    cache.set(cacheKey, JSON.stringify(profileGamesJson, null, 2), 'EX', GLOBAL_CONSTS.TTL_DURATION);
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

export const getProfileStatsByTourney = (pPId, tPId=null) => {
    return new Promise(async function(resolve, reject) {
        try {
            let profileObject = await dynamoDbGetItem('Profile', 'ProfilePId', pPId);
            if (profileObject != null) {
                let statsLogJson = profileObject['StatsLog'];
                const tourneyId = (tPId) ? tPId : (Math.max(...Object.keys(statsLogJson)));    // if tourney parameter Id is null, find latest
                const cacheKey = CACHE_KEYS.PROFILE_STATS_PREFIX + pPId + '-' + tourneyId;
                cache.get(cacheKey, async (err, data) => {
                    if (err) { console(err); reject(err); return; }
                    else if (data != null) { resolve(JSON.parse(data)); return; }
                    // Process Data
                    let profileStatsJson = statsLogJson[tourneyId];
                    if (profileStatsJson == null) { resolve(null); return; }    // Not Found
                    profileStatsJson['TournamentName'] = await getTournamentName(tourneyId);
                    profileStatsJson['TournamentShortName'] = await getTournamentShortName(tourneyId);
                    for (let i = 0; i < Object.keys(profileStatsJson['RoleStats']).length; ++i) {
                        let role = Object.keys(profileStatsJson['RoleStats'])[i];
                        let statsJson = profileStatsJson['RoleStats'][role];
                        let gameDurationMinute = statsJson['TotalGameDuration'] / 60;
                        statsJson['Kda'] = (statsJson['TotalDeaths'] > 0) ? ((statsJson['TotalKills'] + statsJson['TotalAssists']) / statsJson['TotalDeaths']).toFixed(2).toString() : "Perfect";
                        statsJson['AverageKills'] = (statsJson['TotalKills'] / statsJson['GamesPlayed']).toFixed(1);
                        statsJson['AverageDeaths'] = (statsJson['TotalDeaths'] / statsJson['GamesPlayed']).toFixed(1);
                        statsJson['AverageAssists'] = (statsJson['TotalAssists'] / statsJson['GamesPlayed']).toFixed(1);
                        statsJson['KillPct'] = (statsJson['TotalTeamKills'] == 0) ? 0 : ((statsJson['TotalKills'] + statsJson['TotalAssists']) / statsJson['TotalTeamKills']).toFixed(4);
                        statsJson['DeathPct'] = (statsJson['TotalTeamDeaths'] == 0) ? 0 : (statsJson['TotalDeaths'] / statsJson['TotalTeamDeaths']).toFixed(4);
                        statsJson['CreepScorePerMinute'] = (statsJson['TotalCreepScore'] / gameDurationMinute).toFixed(2);
                        statsJson['GoldPerMinute'] = (statsJson['TotalGold'] / gameDurationMinute).toFixed(2);
                        statsJson['GoldPct'] = (statsJson['TotalGold'] / statsJson['TotalTeamGold']).toFixed(4);
                        statsJson['DamagePerMinute'] = (statsJson['TotalDamage'] / gameDurationMinute).toFixed(2);
                        statsJson['DamagePct'] = (statsJson['TotalDamage'] / statsJson['TotalTeamDamage']).toFixed(4);
                        statsJson['DamagePerGold'] = (statsJson['TotalDamage'] / statsJson['TotalGold']).toFixed(4);
                        statsJson['VisionScorePerMinute'] = (statsJson['TotalVisionScore'] / gameDurationMinute).toFixed(2);
                        statsJson['VisionScorePct'] = (statsJson['TotalVisionScore'] / statsJson['TotalTeamVisionScore']).toFixed(4);
                        statsJson['WardsPerMinute'] = (statsJson['TotalWardsPlaced'] / gameDurationMinute).toFixed(2);
                        statsJson['WardsClearedPerMinute'] = (statsJson['TotalWardsCleared'] / gameDurationMinute).toFixed(2);
                        statsJson['ControlWardsPerMinute'] = (statsJson['TotalControlWardsBought'] / gameDurationMinute).toFixed(2);
                        statsJson['AverageCsAtEarly'] = (statsJson['TotalCsAtEarly'] / statsJson['GamesPlayedOverEarly']).toFixed(1);
                        statsJson['AverageGoldAtEarly'] = (statsJson['TotalGoldAtEarly'] / statsJson['GamesPlayedOverEarly']).toFixed(1);
                        statsJson['AverageXpAtEarly'] = (statsJson['TotalXpAtEarly'] / statsJson['GamesPlayedOverEarly']).toFixed(1);
                        statsJson['AverageCsAtMid'] = (statsJson['TotalCsAtMid'] / statsJson['GamesPlayedOverMid']).toFixed(1);
                        statsJson['AverageGoldAtMid'] = (statsJson['TotalGoldAtMid'] / statsJson['GamesPlayedOverMid']).toFixed(1);
                        statsJson['AverageXpAtMid'] = (statsJson['TotalXpAtMid'] / statsJson['GamesPlayedOverMid']).toFixed(1);
                        statsJson['AverageCsDiffEarly'] = (statsJson['TotalCsDiffEarly'] / statsJson['GamesPlayedOverEarly']).toFixed(1);
                        statsJson['AverageGoldDiffEarly'] = (statsJson['TotalGoldDiffEarly'] / statsJson['GamesPlayedOverEarly']).toFixed(1);
                        statsJson['AverageXpDiffEarly'] = (statsJson['TotalXpDiffEarly'] / statsJson['GamesPlayedOverEarly']).toFixed(1);
                        statsJson['AverageCsDiffMid'] = (statsJson['TotalCsDiffMid'] / statsJson['GamesPlayedOverMid']).toFixed(1);
                        statsJson['AverageGoldDiffMid'] = (statsJson['TotalGoldDiffMid'] / statsJson['GamesPlayedOverMid']).toFixed(1);
                        statsJson['AverageXpDiffMid'] = (statsJson['TotalXpDiffMid'] / statsJson['GamesPlayedOverMid']).toFixed(1);
                        statsJson['FirstBloodPct'] = (statsJson['TotalFirstBloods'] / statsJson['GamesPlayed']).toFixed(4);
                    }
                    cache.set(cacheKey, JSON.stringify(profileStatsJson, null, 2), 'EX', GLOBAL_CONSTS.TTL_DURATION);
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
export const getSummonerIdBySummonerName = (summName) => {
    return new Promise(function(resolve, reject) {
        getRiotSummonerId(summName).then((data) => {
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
export const postNewProfile = (profileName, summId) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Generate a new Profile ID
            let newPId = await generateNewPId('Profile');
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
            await dynamoDbPutItem('Profile', newProfileItem, newPId);
            // Add to 'ProfileNameMap' Table
            let simpleProfileName = filterName(newProfileItem['ProfileName']);
            let newProfileMap = {
                'ProfileName': simpleProfileName,
                'ProfileHId': getProfileHashId(newPId),
            }
            await dynamoDbPutItem('ProfileNameMap', newProfileMap, simpleProfileName);
            // Add to 'SummonerIdMap' Table
            let newSummonerMap = {
                'SummonerId': summId,
                'ProfileHId': getProfileHashId(newPId),
            };
            await dynamoDbPutItem('SummonerIdMap', newSummonerMap, summId);
            
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
export const updateProfileInfo = (profilePId, summId, item) => {
    return new Promise(async (resolve, reject) => {
        try {
            await dynamoDbUpdateItem('Profile', 'ProfilePId', profilePId,
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
                'ProfileHId': getProfileHashId(profilePId),
            };
            await dynamoDbPutItem('SummonerIdMap', newSummonerMap, summId);

            // Cache set Key: PROFILE_INFO_PREFIX
            cache.del(CACHE_KEYS.PROFILE_INFO_PREFIX + profilePId);

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
export const updateProfileName = (profilePId, newName, oldName) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Update "Profile" table
            await dynamoDbUpdateItem('Profile', 'ProfilePId', profilePId,
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
            await dynamoDbPutItem('ProfileNameMap', {
                'ProfileName': filterName(newName),
                'ProfileHId': getProfileHashId(profilePId),
            }, filterName(newName));
            // Delete oldName from "ProfileNameMap" table
            await dynamoDbDeleteItem('ProfileNameMap', 'ProfileName', filterName(oldName));

            // Del Cache
            cache.del(CACHE_KEYS.PROFILE_PID_BYNAME_PREFIX + filterName(oldName));
            cache.del(CACHE_KEYS.PROFILE_NAME_PREFIX + profilePId);
            cache.del(CACHE_KEYS.PROFILE_INFO_PREFIX + profilePId)

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
export const updateProfileGameLog = (profilePId, tournamentPId) => {
    return new Promise(async (resolve, reject) => {
        try {
            let tourneyDbObject = await dynamoDbGetItem('Tournament', 'TournamentPId', tournamentPId);
            let seasonPId = tourneyDbObject['Information']['SeasonPId'];
            let profileDbObject = await dynamoDbGetItem('Profile', 'ProfilePId', profilePId);
            
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
                await dynamoDbUpdateItem('Profile', 'ProfilePId', profilePId,
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
                await dynamoDbUpdateItem('Profile', 'ProfilePId', profilePId,
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
            const matchDataList = await mySqlCallSProc('playerMatchesByTournamentPId', profilePId, tournamentPId);
            console.log(`Profile '${profilePId}' played ${matchDataList.length} matches in TournamentPID '${tournamentPId}'.`);
            for (let matchIdx = 0; matchIdx < matchDataList.length; ++matchIdx) {
                const sqlPlayerStats = matchDataList[matchIdx];
                const matchPId = sqlPlayerStats.riotMatchId;
                let profileGameItem = {
                    'DatePlayed': sqlPlayerStats.datePlayed,
                    'TournamentType': sqlPlayerStats.tournamentType,
                    'GameWeekNumber': 0, // N/A
                    'TeamHId': getTeamHashId(sqlPlayerStats.teamPId),
                    'ChampionPlayed': sqlPlayerStats.champId,
                    'Role': sqlPlayerStats.role,
                    'Side': sqlPlayerStats.side,
                    'Win': (sqlPlayerStats.win == 1) ? true : false,
                    'Vacated': false,
                    'EnemyTeamHId': getTeamHashId((sqlPlayerStats.side === 'Blue') ? sqlPlayerStats.redTeamPId : sqlPlayerStats.blueTeamPId),
                    'GameDuration': sqlPlayerStats.duration,
                    'Kills': sqlPlayerStats.kills,
                    'Deaths': sqlPlayerStats.deaths,
                    'Assists': sqlPlayerStats.assists,
                    'CreepScore': sqlPlayerStats.creepScore,
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
                    'GoldDiffEarly': sqlPlayerStats.goldDiffEarly,
                    'GoldDiffMid': sqlPlayerStats.goldDiffMid,
                    'CsDiffEarly': sqlPlayerStats.csDiffEarly,
                    'CsDiffMid': sqlPlayerStats.csDiffMid,
                    'XpDiffEarly': sqlPlayerStats.xpDiffEarly,
                    'XpDiffMid': sqlPlayerStats.xpDiffMid,
                };
                gameLogProfileItem[matchPId] = profileGameItem;
            }
            //#endregion
            
            /*  
                ----------
                Push into DB
                ----------
            */
            await dynamoDbUpdateItem('Profile', 'ProfilePId', profilePId,
                'SET #glog.#sId.#mtch = :data',
                {
                    '#glog': 'GameLog',
                    '#sId': seasonPId,
                    '#mtch': 'Matches',
                },
                {
                    ':data': gameLogProfileItem
                }
            );
            // Delete Cache
            cache.del(CACHE_KEYS.PROFILE_GAMES_PREFIX + profilePId + '-' + seasonPId);

            resolve({
                profileId: profilePId,
                tournamentId: tournamentPId,
                numberMatches: matchDataList.length,
                typeUpdated: 'GameLog',
            });
        }
        catch (err) { reject(err); }
    });
}

// Returns an object indicating Profile StatsLog has been updated
export const updateProfileStatsLog = (profilePId, tournamentPId) => {
    return new Promise(async (resolve, reject) => {
        try {
            let profileDbObject = await dynamoDbGetItem('Profile', 'ProfilePId', profilePId);

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
                await dynamoDbUpdateItem('Profile', 'ProfilePId', profilePId,
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
                await dynamoDbUpdateItem('Profile', 'ProfilePId', profilePId,
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
            let playerStatsTotalData = await mySqlCallSProc('playerStatsTotalByTournamentId', profilePId, tournamentPId, 
                GLOBAL_CONSTS.MINUTE_AT_EARLY, GLOBAL_CONSTS.MINUTE_AT_MID);
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
                statsRoleItem['DamagePerMinuteStdDev'] = playerStatsTotalRow.stdDamage;
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
            await dynamoDbUpdateItem('Profile', 'ProfilePId', profilePId, 
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
            cache.del(`${CACHE_KEYS.PROFILE_STATS_PREFIX}${profilePId}-${tournamentPId}`);
            
            resolve({
                profileId: profilePId,
                tournamentId: tournamentPId,
                typeUpdated: 'StatsLog',
            });
        }
        catch (err) { reject(err) }
    });
}