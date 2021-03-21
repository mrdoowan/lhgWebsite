/*  Declaring npm modules */
const redis = require('redis');
const cache = (process.env.NODE_ENV === 'production') ? redis.createClient(process.env.REDIS_URL) : redis.createClient(process.env.REDIS_PORT);

/*  Import dependency modules */
import {
    filterName,
    getProfilePIdFromHash,
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

/**
 * Returns ProfilePId 'string' from ProfileName
 * @param {string} name 
 */
export const getProfilePIdByName = (name) => {
    return new Promise(function(resolve, reject) {
        if (!name) { resolve(null); return; }
        const simpleName = filterName(name);
        const cacheKey = CACHE_KEYS.PROFILE_PID_BYNAME_PREFIX + simpleName;
        cache.get(cacheKey, (err, data) => {
            if (err) { console.error(err); reject(err); return; }
            else if (data) { resolve(data); return; }
            dynamoDbGetItem('ProfileNameMap', simpleName)
            .then((obj) => {
                if (!obj) { resolve(null); return; } // Not Found 
                const pPId = getProfilePIdFromHash(obj['ProfileHId']);
                cache.set(cacheKey, pPId, 'EX', GLOBAL_CONSTS.TTL_DURATION);
                resolve(pPId);
            }).catch((error) => { console.error(error); reject(error) });
        });
    });
}

/**
 * 
 * @param {array} profileNameList 
 */
export const getProfilePIdsFromList = (profileNameList) => {
    return new Promise(async (resolve, reject) => {
        try {
            const errorList = [];
            const profilePIdList = [];
            for (const profileName of profileNameList) {
                const profilePId = await getProfilePIdByName(profileName);
                if (!profilePId) {
                    errorList.push(`${profileName} - Profile name does not exist.`);
                }
                else if (profilePIdList.includes(profilePId)) {
                    errorList.push(`${profileName} - Duplicate names.`);
                }
                else {
                    profilePIdList.push(profilePId);
                }
            }

            if (errorList.length > 0) {
                resolve({ errorList: errorList });
            }
            else {
                resolve({ data: profilePIdList });
            }
        }
        catch (err) { reject(err); }
    });
}

/**
 * Get ProfilePId from Riot Summoner Id
 * @param {string} summId
 */
export const getProfilePIdBySummonerId = (summId) => {
    const cacheKey = CACHE_KEYS.PROFILE_PID_BYSUMM_PREFIX + summId;
    return new Promise(function(resolve, reject) {
        if (!summId) { resolve(null); return; }
        cache.get(cacheKey, (err, data) => {
            if (err) { console.error(err); reject(err); return; }
            else if (data) { resolve(data); return; }
            dynamoDbGetItem('SummonerIdMap', summId)
            .then((obj) => {
                if (!obj) { resolve(null); return; } // Not Found
                const profilePId = getProfilePIdFromHash(obj['ProfileHId']);
                cache.set(cacheKey, profilePId);
                resolve(profilePId);
            }).catch((error) => { console.error(error); reject(error) });
        });
    });
}

/**
 * Returns an array of Profile PIds based on summoner Ids
 * If an index is null, that means no PId is associated
 * @param {array} summIdList 
 */
export const getProfilePIdsFromSummIdList = (summIdList) => {
    return new Promise(async (resolve, reject) => {
        try {
            const profilePIdList = [];
            for (const summId of summIdList) {
                const profilePId = await getProfilePIdBySummonerId(summId);
                profilePIdList.push(profilePId);
            }
            resolve(profilePIdList);
        }
        catch (err) { reject(err); }
    });
}

/**
 * Get ProfileName from DynamoDb
 * @param {string} profileId    Profile PId or HId
 * @param {boolean} hash        hash=true if id is HId, hash=false if id is PId. hash is 'true' by default
 */
export const getProfileName = (profileId, hash=true) => {
    return new Promise(function(resolve, reject) {
        if (!profileId) { resolve(null); return; }
        const profilePId = (hash) ? getProfilePIdFromHash(profileId) : profileId;
        const cacheKey = CACHE_KEYS.PROFILE_NAME_PREFIX + profilePId;
        cache.get(cacheKey, (err, data) => {
            if (err) { console.error(err); reject(err); return; }
            else if (data != null) { resolve(data); return; }
            dynamoDbGetItem('Profile', profilePId)
            .then((obj) => {
                if (obj == null) { resolve(null); return; } // Not Found
                cache.set(cacheKey, obj['ProfileName'], 'EX', GLOBAL_CONSTS.TTL_DURATION);
                resolve(obj['ProfileName']);
            }).catch((error) => { console.error(error); reject(error) });
        });
    });
}

/**
 * 
 * @param {string} profilePId   
 */
export const getProfileInfo = (profilePId) => {
    const cacheKey = CACHE_KEYS.PROFILE_INFO_PREFIX + profilePId;
    return new Promise(function(resolve, reject) {
        if (!profilePId) { resolve(null); return; }
        cache.get(cacheKey, async (err, data) => {
            if (err) { console(err); reject(err); return; }
            else if (data != null) { resolve(JSON.parse(data)); return; }
            try {
                let profileInfoJson = (await dynamoDbGetItem('Profile', profilePId))['Information'];
                if (profileInfoJson != null) { 
                    if ('ActiveSeasonPId' in profileInfoJson) {
                        profileInfoJson['ActiveSeasonShortName'] = await getSeasonShortName(profileInfoJson['ActiveSeasonPId']);
                        profileInfoJson['ActiveSeasonName'] = await getSeasonName(profileInfoJson['ActiveSeasonPId']);
                    }
                    if ('ActiveTeamHId' in profileInfoJson) {
                        profileInfoJson['ActiveTeamName'] = await getTeamName(profileInfoJson['ActiveTeamHId']);
                    }
                    // Add Season List
                    let gameLogJson = (await dynamoDbGetItem('Profile', profilePId))['GameLog'];
                    if (gameLogJson != null) {
                        profileInfoJson['SeasonList'] = await getSeasonItems(Object.keys(gameLogJson));
                    }
                    // Add Tournament List
                    let statsLogJson = (await dynamoDbGetItem('Profile', profilePId))['StatsLog'];
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

/**
 * 
 * @param {string} pPId     Profile Id (Assume this is valid)
 * @param {number} sPId     Season Id number
 */
export const getProfileGamesBySeason = (pPId, sPId=null) => {
    return new Promise(function(resolve, reject) {
        if (!pPId) { resolve(null); return; }
        dynamoDbGetItem('Profile', pPId).then((profileObject) => {
            if (profileObject && 'GameLog' in profileObject) {
                const gameLogJson = profileObject['GameLog'];
                const seasonId = (sPId) ? sPId : (Math.max(...Object.keys(gameLogJson)));    // if season parameter Id is null, find latest
                const cacheKey = CACHE_KEYS.PROFILE_GAMES_PREFIX + pPId + '-' + seasonId;

                cache.get(cacheKey, async (err, data) => {
                    if (err) { console(err); reject(err); return; }
                    else if (data) { resolve(JSON.parse(data)); return; }
                    const profileGamesJson = gameLogJson[seasonId];
                    if (!profileGamesJson) { resolve(null); return; } // Not Found
                    // Process Data
                    profileGamesJson['SeasonTime'] = await getSeasonTime(seasonId);
                    profileGamesJson['SeasonName'] = await getSeasonName(seasonId);
                    profileGamesJson['SeasonShortName'] = await getSeasonShortName(seasonId);
                    for (let i = 0; i < Object.values(profileGamesJson['Matches']).length; ++i) {
                        const matchJson = Object.values(profileGamesJson['Matches'])[i];
                        matchJson['TeamName'] = await getTeamName(matchJson['TeamHId']);
                        matchJson['EnemyTeamName'] = await getTeamName(matchJson['EnemyTeamHId']);
                        matchJson['Kda'] = (matchJson['Deaths'] > 0) ? ((matchJson['Kills'] + matchJson['Assists']) / matchJson['Deaths']).toFixed(2) : "Perfect";
                        matchJson['KillPct'] = (matchJson['TeamKills'] == 0) ? 0 : ((matchJson['Kills'] + matchJson['Assists']) / matchJson['TeamKills']).toFixed(4);
                        matchJson['DamagePct'] = (matchJson['DamageDealt'] / matchJson['TeamDamage']).toFixed(4);
                        matchJson['GoldPct'] = (matchJson['Gold'] / matchJson['TeamGold']).toFixed(4);
                        matchJson['VisionScorePct'] = (matchJson['VisionScore'] / matchJson['TeamVS']).toFixed(4);
                        const gameDurationMinute = matchJson['GameDuration'] / 60;
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
                if (!sPId) { resolve({}); }  // 'GameLog' does not exist while trying to find Latest
                else { resolve(null); return; } // Not Found
            }
        }).catch((err) => {
            console.error(err); reject(err); 
        });
    });
}

/**
 * 
 * @param {string} pPId     Profile Id (Assume this is valid)
 * @param {number} tPId     Tournament Id number
 */
export const getProfileStatsByTourney = (pPId, tPId=null) => {
    return new Promise(function(resolve, reject) {
        if (!pPId) { resolve(null); return; }
        dynamoDbGetItem('Profile', pPId).then((profileObject) => {
            if (profileObject && 'StatsLog' in profileObject) {
                const statsLogJson = profileObject['StatsLog'];
                const tourneyId = (tPId) ? tPId : (Math.max(...Object.keys(statsLogJson)));    // if tourney parameter Id is null, find latest
                const cacheKey = CACHE_KEYS.PROFILE_STATS_PREFIX + pPId + '-' + tourneyId;
                
                cache.get(cacheKey, async (err, data) => {
                    if (err) { console(err); reject(err); return; }
                    else if (data) { resolve(JSON.parse(data)); return; }
                    // Process Data
                    const profileStatsJson = statsLogJson[tourneyId];
                    if (!profileStatsJson) { resolve(null); return; }    // Not Found
                    profileStatsJson['TournamentName'] = await getTournamentName(tourneyId);
                    profileStatsJson['TournamentShortName'] = await getTournamentShortName(tourneyId);
                    for (let i = 0; i < Object.keys(profileStatsJson['RoleStats']).length; ++i) {
                        const role = Object.keys(profileStatsJson['RoleStats'])[i];
                        const statsJson = profileStatsJson['RoleStats'][role];
                        const gameDurationMinute = statsJson['TotalGameDuration'] / 60;
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
                if (!tPId) { resolve({}); }  // If 'StatsLog' does not exist
                else { resolve(null); return; }     // Not Found
            }
        }).catch((err) => {
            console.error(err); reject(err);
        });
    });
}

/**
 * Returns Summoner Id from Summoner Name
 * @param {string} summonerName
 */
export const getSummonerIdBySummonerName = (summonerName) => {
    // Won't need to cache this. Just call directly from Riot API
    return new Promise(function(resolve, reject) {
        getRiotSummonerId(summonerName).then((data) => {
            resolve(data['id']);
        }).catch((err) => { reject(err); })
    });
}

/**
 * Return an array of summoner Ids in object 'data'. 
 * Returns 'errorList' instead if API calls fail
 * @param {array} summonerNameList 
 */
export const getSummonerIdsFromList = (summonerNameList) => {
    return new Promise(async (resolve, reject) => {
        try {
            const errorList = [];
            const summonerIdList = [];
            for (const summonerName of summonerNameList) {
                try {
                    const summId = await getSummonerIdBySummonerName(summonerName);
                    if (!summId) {
                        errorList.push(`${summonerName} - Summoner name does not exist.`);
                    }
                    else if (summonerIdList.includes(summId)) {
                        errorList.push(`${summonerName} - Duplicate names.`);
                    }
                    else {
                        summonerIdList.push(summId);
                    }
                }          
                catch (err) { 
                    errorList.push(`${summonerName} - Riot API call failed.`); 
                };
            }

            if (errorList.length > 0) {
                resolve({ errorList: errorList });
            }
            else {
                resolve({ data: summonerIdList });
            }
        }
        catch (err) { reject(err); }
    });
}

// BODY EXAMPLE:
// {
//     "profileName": "NAME",
//     "summonerNames": [
//          "summName1",
//          "summName2",
//     ]
// }
// Add to "Profile", "ProfileNameMap", "SummonerIdMap" Table
/**
 * Add new profiles and its summoner accounts. First Summoner listed will automatically be flagged as 'main'.
 * @param {string} profileName 
 * @param {array} summIdList
 */
export const postNewProfile = (profileName, summIdList) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Generate a new Profile ID
            const newPId = await generateNewPId('Profile');

            // Create LeagueAccounts object
            const newLeagueAccountsObject = {};
            for (const [idx, summId] of summIdList.entries()) {
                newLeagueAccountsObject[summId] = {
                    MainAccount: (idx === 0) ? true : false,
                }
            }

            const newProfileItem = {
                Information: {
                    LeagueAccounts: newLeagueAccountsObject,
                    ProfileName: profileName,
                },
                ProfileName: profileName,
                ProfilePId: newPId,
            };

            // Add to 'Profile' Table
            await dynamoDbPutItem('Profile', newProfileItem, newPId);
            // Add to 'ProfileNameMap' Table
            const simpleProfileName = filterName(newProfileItem['ProfileName']);
            const newProfileMap = {
                'ProfileName': simpleProfileName,
                'ProfileHId': getProfileHashId(newPId),
            }
            await dynamoDbPutItem('ProfileNameMap', newProfileMap, simpleProfileName);
            // Add to 'SummonerIdMap' Table
            for (const summId of summIdList) {
                const newSummonerMap = {
                    'SummonerId': summId,
                    'ProfileHId': getProfileHashId(newPId),
                };
                await dynamoDbPutItem('SummonerIdMap', newSummonerMap, summId);
            }
            
            resolve(newProfileItem);
        }
        catch (err) { console.error(err); reject(err); }
    });
}

// BODY EXAMPLE:
// {
//     "profileName": "NAME",
//     "summonerName": "SUMM_NAME",
// }
/**
 * Add summoner account to profile. Summoner will not be flagged as 'main'
 * Update "Profile" Information
 * @param {string} profilePId 
 * @param {array} summIdList 
 * @param {object} item 
 */
export const updateProfileInfoSummonerList = (profilePId, summIdList, item) => {
    return new Promise(async (resolve, reject) => {
        try {
            await dynamoDbUpdateItem('Profile', profilePId,
                'SET #key = :data',
                {
                    '#key': 'Information',
                },
                {
                    ':data': item
                }
            );
            // Add to 'SummonerIdMap' Table
            for (const summId of summIdList) {
                const newSummonerMap = {
                    'SummonerId': summId,
                    'ProfileHId': getProfileHashId(profilePId),
                };
                await dynamoDbPutItem('SummonerIdMap', newSummonerMap, summId);
            }

            // Cache set Key: PROFILE_INFO_PREFIX
            cache.del(CACHE_KEYS.PROFILE_INFO_PREFIX + profilePId);

            resolve({ 
                profilePId: profilePId,
                leagueAccounts: item.LeagueAccounts
            });
        }
        catch (err) { console.error(err); reject(err); }
    });
}

// BODY EXAMPLE:
// {
//     "currentName": "OLD_NAME",
//     "newName": "NEW_NAME",
// }
/**
 * Change Profile name. Update "Profile", "ProfileNameMap" table
 * @param {string} profilePId 
 * @param {string} newName 
 * @param {string} oldName 
 */
export const updateProfileName = (profilePId, newName, oldName) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Update "Profile" table
            await dynamoDbUpdateItem('Profile', profilePId,
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
            await dynamoDbDeleteItem('ProfileNameMap', filterName(oldName));

            // Del Cache
            cache.del(CACHE_KEYS.PROFILE_PID_BYNAME_PREFIX + filterName(oldName));
            cache.del(CACHE_KEYS.PROFILE_NAME_PREFIX + profilePId);
            cache.del(CACHE_KEYS.PROFILE_INFO_PREFIX + profilePId);

            resolve({
                'ProfilePId': profilePId,
                'NewProfileName': newName,
                'OldProfileName': oldName,
            });
        }
        catch (err) { console.error(err); reject(err); }
    })
}

/**
 * 
 * @param {string} profilePId   Assume valid
 * @param {string} summonerId   Assume not valid
 */
export const putProfileRemoveAccount = (profilePId, summonerId) => {
    return new Promise((resolve, reject) => {
        // Get from dynamoDb and remove from profile PId
        dynamoDbGetItem('Profile', profilePId).then(async (profileObject) => {
            if (!(profileObject.Information?.LeagueAccounts)) {
                resolve({ error: `Profile object does not have property 'LeagueAccounts'` });
                return;
            }
            const leagueAccountsObject = profileObject.Information.LeagueAccounts;
            
            if (Object.keys(profileObject.Information.LeagueAccounts).length < 2) {
                resolve({ error: `Profile only has one summoner account linked.` });
                return;
            }
            if (leagueAccountsObject[summonerId]) {
                delete leagueAccountsObject[summonerId];
            }
            else {
                resolve({ error: `Summoner Id ${summonerId} is not in the Profile.` });
                return;
            }

            // Remove from SummonerIdMap dynamodb
            await dynamoDbDeleteItem('SummonerIdMap', summonerId);
            // Update Profile Info dynamoDb
            await dynamoDbUpdateItem('Profile', profilePId,
                'SET #info = :val', 
                {
                    '#info': 'Information'
                },
                {
                    ':val': profileObject.Information
                }
            );

            // Delete Cache
            cache.del(CACHE_KEYS.PROFILE_INFO_PREFIX + profilePId);

            resolve({
                profilePId: profilePId,
                leagueAccounts: leagueAccountsObject,
            });
        }).catch((err) => { console.error(err); reject(err); });
    });
}

/**
 * Returns an object indicating Profile GameLog has been updated
 * @param {string} profilePId 
 * @param {number} tournamentPId 
 * @returns 
 */
export const updateProfileGameLog = (profilePId, tournamentPId) => {
    return new Promise(async (resolve, reject) => {
        try {
            const tourneyDbObject = await dynamoDbGetItem('Tournament', tournamentPId);
            const seasonPId = tourneyDbObject['Information']['SeasonPId'];
            const profileDbObject = await dynamoDbGetItem('Profile', profilePId);
            
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
                await dynamoDbUpdateItem('Profile', profilePId,
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
                await dynamoDbUpdateItem('Profile', profilePId,
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

            /*  
                -------------
                Game Log
                -------------
            */
            // #region Compile Data
            // Load each Stat into Profile in tournamentId
            const gameLogProfileItem = {};
            const matchDataList = await mySqlCallSProc('playerMatchesByTournamentPId', profilePId, tournamentPId);
            console.log(`Profile '${profilePId}' played ${matchDataList.length} matches in TournamentPID '${tournamentPId}'.`);
            for (const sqlPlayerStats of matchDataList) {
                const matchPId = sqlPlayerStats.riotMatchId;
                const profileGameItem = {
                    'Invalid': sqlPlayerStats.invalid,
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
            profileDbObject['GameLog'][seasonPId]['Matches'] = gameLogProfileItem;
            //#endregion
            
            /*  
                ----------
                Push into DB
                ----------
            */
            await dynamoDbUpdateItem('Profile', profilePId,
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

/**
 * Returns an object indicating Profile StatsLog has been updated
 * @param {string} profilePId 
 * @param {number} tournamentPId 
 * @returns 
 */
export const updateProfileStatsLog = (profilePId, tournamentPId) => {
    return new Promise(async (resolve, reject) => {
        try {
            const profileDbObject = await dynamoDbGetItem('Profile', profilePId);

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
                await dynamoDbUpdateItem('Profile', profilePId,
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
                await dynamoDbUpdateItem('Profile', profilePId,
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

            /*  
                ----------
                'StatsLog'
                ----------
            */
            // #region Compile Data
            const statsLogProfileItem = {};
            const playerStatsTotalData = await mySqlCallSProc('playerStatsTotalByTournamentId', profilePId, tournamentPId, 
                GLOBAL_CONSTS.MINUTE_AT_EARLY, GLOBAL_CONSTS.MINUTE_AT_MID);
            for (const playerStatsTotalRow of playerStatsTotalData) {
                const role = playerStatsTotalRow.playerRole;
                // Initialize StatsLog Role 
                if (!(role in statsLogProfileItem)) {
                    statsLogProfileItem[role] = {};
                }
                // Get from sProc
                const statsRoleItem = statsLogProfileItem[role];
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
                statsRoleItem['TotalKillsAtEarly'] = playerStatsTotalRow.totalKillsAtEarly;
                statsRoleItem['TotalAssistsAtEarly'] = playerStatsTotalRow.totalAssistsAtEarly;
                statsRoleItem['TotalTeamKillsAtEarly'] = playerStatsTotalRow.totalTeamKillsAtEarly;
                statsRoleItem['TotalCsAtEarly'] = playerStatsTotalRow.totalCsAtEarly;
                statsRoleItem['TotalGoldAtEarly'] = playerStatsTotalRow.totalGoldAtEarly;
                statsRoleItem['TotalXpAtEarly'] = playerStatsTotalRow.totalXpAtEarly;
                statsRoleItem['TotalCsDiffEarly'] = playerStatsTotalRow.totalCsDiffEarly;
                statsRoleItem['TotalGoldDiffEarly'] = playerStatsTotalRow.totalGoldDiffEarly;
                statsRoleItem['TotalXpDiffEarly'] = playerStatsTotalRow.totalXpDiffEarly;
                statsRoleItem['TotalKillsAtMid'] = playerStatsTotalRow.totalKillsAtMid;
                statsRoleItem['TotalAssistsAtMid'] = playerStatsTotalRow.totalAssistsAtMid;
                statsRoleItem['TotalTeamKillsAtMid'] = playerStatsTotalRow.totalTeamKillsAtMid;
                statsRoleItem['TotalCsAtMid'] = playerStatsTotalRow.totalCsAtMid;
                statsRoleItem['TotalGoldAtMid'] = playerStatsTotalRow.totalGoldAtMid;
                statsRoleItem['TotalXpAtMid'] = playerStatsTotalRow.totalXpAtMid;
                statsRoleItem['TotalCsDiffMid'] = playerStatsTotalRow.totalCsDiffMid;
                statsRoleItem['TotalGoldDiffMid'] = playerStatsTotalRow.totalGoldDiffMid;
                statsRoleItem['TotalXpDiffMid'] = playerStatsTotalRow.totalXpDiffMid;
                statsRoleItem['TotalDpmDiff'] = playerStatsTotalRow.totalDpmDiff;
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
            profileDbObject['StatsLog'][tournamentPId]['RoleStats'] = statsLogProfileItem;
            // #endregion
            
            /*  
                ----------
                Push into DB
                ----------
            */
            await dynamoDbUpdateItem('Profile', profilePId, 
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

/**
 * Removes Profile from the database
 * @param {string} profilePId   Assume valid
 * @param {string} profileName  Assume valid
 */
export const deleteProfileFromDb = (profilePId, profileName) => {
    return new Promise((resolve, reject) => {
        dynamoDbGetItem('Profile', profilePId).then(async (profileObject) => {
            if (profileObject.GameLog || profileObject.StatsLog) {
                resolve({
                    error: `Profile '${profileName}' object has a GameLog or StatsLog property`
                });
            }
            
            // Delete from 'ProfileNameMap'
            await dynamoDbDeleteItem('ProfileNameMap', filterName(profileName));
            // Delete from 'Profile'
            await dynamoDbDeleteItem('Profile', profilePId);
            resolve({
                'ProfileRemoved': profilePId,
            });
        }).catch((err) => { console.error(err); reject(err); });
    });
}