/*  Declaring npm modules */
const redis = require('redis');
import replaceSpecialCharacters from 'replace-special-characters';

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
import { 
  getSummonerDataByRiotTag,
  getRiotSummonerDataBySummId
} from './dependencies/awsLambdaHelper';
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
import {
  DYNAMODB_TABLENAMES,
  SINGLE_QUERY_KEYWORD,
  MULTI_QUERY_KEYWORD
} from '../../services/constants';

const cache = (process.env.NODE_ENV === 'production') ? redis.createClient(process.env.REDIS_URL) : redis.createClient(process.env.REDIS_PORT);

/**
 * Returns ProfilePId 'string' from ProfileName
 * @param {string} name 
 */
export const getProfilePIdByName = (name) => {
  return new Promise(function (resolve, reject) {
    if (!name) { resolve(null); return; }
    const simpleName = filterName(name);
    const cacheKey = CACHE_KEYS.PROFILE_PID_BYNAME_PREFIX + simpleName;
    cache.get(cacheKey, (err, data) => {
      if (err) { reject(err); return; }
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
 * @param {string[]} profileNameList 
 * @returns {Promise<object>}
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
  return new Promise(function (resolve, reject) {
    if (!summId) { resolve(null); return; }
    cache.get(cacheKey, (err, data) => {
      if (err) { reject(err); return; }
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
 * Returns an array of Profile PIds based on summoner Ids.
 * If an index is null, that means no PId is associated
 * @param {array[string]} summDataList 
 */
export const getProfilePIdsFromSummDataList = (summDataList) => {
  return new Promise(async (resolve, reject) => {
    try {
      const profilePIdList = [];
      for (const summData of summDataList) {
        const profilePId = await getProfilePIdBySummonerId(summData.id);
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
 * @return {Promise<string>}
 */
export const getProfileName = (profileId, hash = true) => {
  return new Promise(function (resolve, reject) {
    if (!profileId) { resolve(null); return; }
    const profilePId = (hash) ? getProfilePIdFromHash(profileId) : profileId;
    const cacheKey = CACHE_KEYS.PROFILE_NAME_PREFIX + profilePId;
    cache.get(cacheKey, (err, data) => {
      if (err) { reject(err); return; }
      else if (data) { resolve(data); return; }
      dynamoDbGetItem('Profile', profilePId)
        .then((obj) => {
          if (!obj) { resolve(null); return; } // Not Found
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
  return new Promise(function (resolve, reject) {
    if (!profilePId) { resolve(null); return; }
    cache.get(cacheKey, async (err, data) => {
      if (err) { reject(err); return; }
      else if (data) { resolve(JSON.parse(data)); return; }
      try {
        const profileInfoJson = (await dynamoDbGetItem('Profile', profilePId))['Information'];
        if (profileInfoJson != null) {
          if ('ActiveSeasonPId' in profileInfoJson) {
            profileInfoJson['ActiveSeasonShortName'] = await getSeasonShortName(profileInfoJson['ActiveSeasonPId']);
            profileInfoJson['ActiveSeasonName'] = await getSeasonName(profileInfoJson['ActiveSeasonPId']);
          }
          if ('ActiveTeamHId' in profileInfoJson) {
            profileInfoJson['ActiveTeamName'] = await getTeamName(profileInfoJson['ActiveTeamHId']);
          }
          // Add Season List
          const gameLogJson = (await dynamoDbGetItem('Profile', profilePId))['GameLog'];
          if (gameLogJson != null) {
            profileInfoJson['SeasonList'] = await getSeasonItems(Object.keys(gameLogJson));
          }
          // Add Tournament List
          const statsLogJson = (await dynamoDbGetItem('Profile', profilePId))['StatsLog'];
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
      catch (error) { reject(error); }
    });
  });
}

/**
 * 
 * @param {string} pPId     Profile Id (Assume this is valid)
 * @param {number} sPId     Season Id number
 */
export const getProfileGamesBySeason = (pPId, sPId = null) => {
  return new Promise(function (resolve, reject) {
    if (!pPId) { resolve(null); return; }
    dynamoDbGetItem('Profile', pPId).then((profileObject) => {
      if (profileObject && 'GameLog' in profileObject) {
        const gameLogJson = profileObject['GameLog'];
        const seasonId = (sPId) ? sPId : (Math.max(...Object.keys(gameLogJson)));    // if season parameter Id is null, find latest
        const cacheKey = CACHE_KEYS.PROFILE_GAMES_PREFIX + pPId + '-' + seasonId;

        cache.get(cacheKey, async (err, data) => {
          if (err) { reject(err); return; }
          else if (data) { resolve(JSON.parse(data)); return; }
          const profileGamesJson = gameLogJson[seasonId];
          if (!profileGamesJson) { resolve(null); return; } // Not Found
          // Process Data
          profileGamesJson['SeasonTime'] = await getSeasonTime(seasonId);
          profileGamesJson['SeasonName'] = await getSeasonName(seasonId);
          profileGamesJson['SeasonShortName'] = await getSeasonShortName(seasonId);
          for (const matchJson of Object.values(profileGamesJson['Matches'])) {
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
      reject(err);
    });
  });
}

/**
 * 
 * @param {string} pPId     Profile Id (Assume this is valid)
 * @param {number} tPId     Tournament Id number
 */
export const getProfileStatsByTourney = (pPId, tPId = null) => {
  return new Promise(function (resolve, reject) {
    if (!pPId) { resolve(null); return; }
    dynamoDbGetItem('Profile', pPId).then((profileObject) => {
      if (profileObject && 'StatsLog' in profileObject) {
        const statsLogJson = profileObject['StatsLog'];
        const tourneyId = (tPId) ? tPId : (Math.max(...Object.keys(statsLogJson)));    // if tourney parameter Id is null, find latest
        const cacheKey = CACHE_KEYS.PROFILE_STATS_PREFIX + pPId + '-' + tourneyId;

        cache.get(cacheKey, async (err, data) => {
          if (err) { reject(err); return; }
          else if (data) { resolve(JSON.parse(data)); return; }
          // Process Data
          const profileStatsJson = statsLogJson[tourneyId];
          if (!profileStatsJson) { resolve(null); return; }    // Not Found
          profileStatsJson['TournamentName'] = await getTournamentName(tourneyId);
          profileStatsJson['TournamentShortName'] = await getTournamentShortName(tourneyId);
          for (const role of Object.keys(profileStatsJson['RoleStats'])) {
            const statsJson = profileStatsJson['RoleStats'][role];
            const gameDurationMinute = statsJson['TotalGameDuration'] / 60;
            statsJson['Kda'] = (statsJson['TotalDeaths'] > 0) ? ((statsJson['TotalKills'] + statsJson['TotalAssists']) / statsJson['TotalDeaths']).toFixed(2).toString() : "Perfect";
            statsJson['AverageKills'] = (statsJson['TotalKills'] / statsJson['GamesPlayed']).toFixed(1);
            statsJson['AverageDeaths'] = (statsJson['TotalDeaths'] / statsJson['GamesPlayed']).toFixed(1);
            statsJson['AverageAssists'] = (statsJson['TotalAssists'] / statsJson['GamesPlayed']).toFixed(1);
            statsJson['KillPct'] = (!statsJson['TotalTeamKills']) ? 0 : ((statsJson['TotalKills'] + statsJson['TotalAssists']) / statsJson['TotalTeamKills']).toFixed(4);
            statsJson['DeathPct'] = (!statsJson['TotalTeamDeaths']) ? 0 : (statsJson['TotalDeaths'] / statsJson['TotalTeamDeaths']).toFixed(4);
            statsJson['AverageKillsAssistsAtEarly'] = (!statsJson['GamesPlayedOverEarly']) ? '' : ((statsJson['TotalKillsAtEarly'] + statsJson['TotalAssistsAtEarly']) / statsJson['GamesPlayedOverEarly']).toFixed(2);
            statsJson['AverageKillsAssistsAtMid'] = (!statsJson['GamesPlayedOverMid']) ? '' : ((statsJson['TotalKillsAtMid'] + statsJson['TotalAssistsAtMid']) / statsJson['GamesPlayedOverMid']).toFixed(2);
            statsJson['KillPctAtEarly'] = (!statsJson['GamesPlayedOverEarly']) ? '' :
              (!statsJson['TotalTeamKillsAtEarly']) ? 0 :
                ((statsJson['TotalKillsAtEarly'] + statsJson['TotalAssistsAtEarly']) / statsJson['TotalTeamKillsAtEarly']).toFixed(4);
            statsJson['KillPctAtMid'] = (!statsJson['GamesPlayedOverMid']) ? '' :
              (!statsJson['TotalTeamKillsAtMid']) ? 0 :
                ((statsJson['TotalKillsAtMid'] + statsJson['TotalAssistsAtMid']) / statsJson['TotalTeamKillsAtMid']).toFixed(4);
            statsJson['CreepScorePerMinute'] = (statsJson['TotalCreepScore'] / gameDurationMinute).toFixed(2);
            statsJson['GoldPerMinute'] = (statsJson['TotalGold'] / gameDurationMinute).toFixed(2);
            statsJson['GoldPct'] = (statsJson['TotalGold'] / statsJson['TotalTeamGold']).toFixed(4);
            statsJson['DamagePerMinute'] = (statsJson['TotalDamage'] / gameDurationMinute).toFixed(2);
            statsJson['DamagePct'] = (statsJson['TotalDamage'] / statsJson['TotalTeamDamage']).toFixed(4);
            statsJson['AverageDpmDiff'] = (statsJson['TotalDpmDiff'] / statsJson['GamesPlayed']).toFixed(2);
            statsJson['DamagePerGold'] = (statsJson['TotalDamage'] / statsJson['TotalGold']).toFixed(4);
            statsJson['VisionScorePerMinute'] = (statsJson['TotalVisionScore'] / gameDurationMinute).toFixed(2);
            statsJson['VisionScorePct'] = (statsJson['TotalVisionScore'] / statsJson['TotalTeamVisionScore']).toFixed(4);
            statsJson['WardsPerMinute'] = (statsJson['TotalWardsPlaced'] / gameDurationMinute).toFixed(2);
            statsJson['WardsClearedPerMinute'] = (statsJson['TotalWardsCleared'] / gameDurationMinute).toFixed(2);
            statsJson['ControlWardsPerMinute'] = (statsJson['TotalControlWardsBought'] / gameDurationMinute).toFixed(2);
            statsJson['AverageCsAtEarly'] = (!statsJson['GamesPlayedOverEarly']) ? '' : (statsJson['TotalCsAtEarly'] / statsJson['GamesPlayedOverEarly']).toFixed(1);
            statsJson['AverageCsAtMid'] = (!statsJson['GamesPlayedOverMid']) ? '' : (statsJson['TotalCsAtMid'] / statsJson['GamesPlayedOverMid']).toFixed(1);
            statsJson['AverageGoldAtEarly'] = (!statsJson['GamesPlayedOverEarly']) ? '' : (statsJson['TotalGoldAtEarly'] / statsJson['GamesPlayedOverEarly']).toFixed(1);
            statsJson['AverageGoldAtMid'] = (!statsJson['GamesPlayedOverMid']) ? '' : (statsJson['TotalGoldAtMid'] / statsJson['GamesPlayedOverMid']).toFixed(1);
            statsJson['AverageXpAtEarly'] = (!statsJson['GamesPlayedOverEarly']) ? '' : (statsJson['TotalXpAtEarly'] / statsJson['GamesPlayedOverEarly']).toFixed(1);
            statsJson['AverageXpAtMid'] = (!statsJson['GamesPlayedOverMid']) ? '' : (statsJson['TotalXpAtMid'] / statsJson['GamesPlayedOverMid']).toFixed(1);
            statsJson['AverageCsDiffEarly'] = (!statsJson['GamesPlayedOverEarly']) ? '' : (statsJson['TotalCsDiffEarly'] / statsJson['GamesPlayedOverEarly']).toFixed(1);
            statsJson['AverageCsDiffMid'] = (!statsJson['GamesPlayedOverMid']) ? '' : (statsJson['TotalCsDiffMid'] / statsJson['GamesPlayedOverMid']).toFixed(1);
            const avgGoldDiffEarlyFloat = statsJson['TotalGoldDiffEarly'] / statsJson['GamesPlayedOverEarly'];
            const avgGoldDiffMidFloat = statsJson['TotalGoldDiffMid'] / statsJson['GamesPlayedOverMid'];
            statsJson['AverageGoldDiffEarly'] = (!statsJson['GamesPlayedOverEarly']) ? '' : avgGoldDiffEarlyFloat.toFixed(1);
            statsJson['AverageGoldDiffMid'] = (!statsJson['GamesPlayedOverMid']) ? '' : avgGoldDiffMidFloat.toFixed(1);
            statsJson['AverageGoldDiffEarlyToMid'] = (!statsJson['GamesPlayedOverMid']) ? '' : (avgGoldDiffMidFloat - avgGoldDiffEarlyFloat).toFixed(1);
            statsJson['AverageXpDiffEarly'] = (!statsJson['GamesPlayedOverEarly']) ? '' : (statsJson['TotalXpDiffEarly'] / statsJson['GamesPlayedOverEarly']).toFixed(1);
            statsJson['AverageXpDiffMid'] = (!statsJson['GamesPlayedOverMid']) ? '' : (statsJson['TotalXpDiffMid'] / statsJson['GamesPlayedOverMid']).toFixed(1);
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
      reject(err);
    });
  });
}

/**
 * Returns Riot summoner data from Summoner Name
 * @param {string} riotTag    # i.e. "Doowan#NA1"
 */
export const getRiotSummonerData = (riotTag) => {
  // Won't need to cache this. Just call directly from Riot API
  return new Promise(function (resolve, reject) {
    if (!riotTag.includes('#')) { reject(`Riot Tag ${riotTag} does not have '#' character.`) }
    const gameName = riotTag.split('#')[0];
    const tagLine = riotTag.split('#')[1];
    getSummonerDataByRiotTag(gameName, tagLine).then((data) => {
      resolve(data);
    }).catch((err) => { reject(err); })
  });
}

/**
 * Return an array of summoner Ids in object 'data'. 
 * Returns 'errorList' instead if API calls fail
 * @param {array} riotTagList 
 */
export const getSummonerDataFromRiotTagList = (riotTagList) => {
  return new Promise(async (resolve, reject) => {
    try {
      const errorList = [];
      const summonerDataList = [];
      const summIdList = [];
      for (const riotTag of riotTagList) {
        try {
          const summRiotData = await getRiotSummonerData(riotTag);
          const summId = summRiotData.id;
          if (!summId) {
            errorList.push(`${riotTag} - Summoner name does not exist.`);
          }
          else if (summIdList.includes(summId)) {
            errorList.push(`${riotTag} - Duplicate names.`);
          }
          else {
            summIdList.push(summId);
            summonerDataList.push(summRiotData);
          }
        }
        catch (err) {
          errorList.push(`${riotTag} - Riot API call failed.`);
        };
      }

      if (errorList.length > 0) {
        resolve({ errorList: errorList });
      }
      else {
        resolve({ data: summonerDataList });
      }
    }
    catch (err) { reject(err); }
  });
}

/**
 * 
 * @param {string} profileName
 * @return {*} 
 */
export const getProfileInfoByProfileName = (profileName) => {
  return new Promise(async (resolve, reject) => {
    try {
      const profilePId = await getProfilePIdByName(profileName);
      if (!profilePId) {
        return resolve({ errorMsg: `Profile Name '${profileName}' Not Found` });
      }
      return resolve(await getProfileInfo(profilePId));
    }
    catch (err) { reject(err); }
  });
}

/**
 * 
 * @param {string} riotTag 
 * @return {*} 
 */
export const getProfileNameByRiotTag = (riotTag) => {
  return new Promise(async (resolve, reject) => {
    try {
      const summId = (await getRiotSummonerData(riotTag)).id;
      if (!summId) {
        return resolve({ errorMsg: `Summoner name '${riotTag}' does not exist.` });
      }
      const profilePId = await getProfilePIdBySummonerId(summId);
      if (!profilePId) {
        return resolve({ errorMsg: `Summoner name '${riotTag}' does not have a profile associated.` });
      }
      return resolve(await getProfileName(profilePId, false));
    }
    catch (err) { reject(err); }
  });
}

/**
 * 
 * @param {string} opggUrl
 * @returns {string[]} List of summoner names. Return null if KEYWORD does not exist
 */
const parseOpggUrl = (opggUrl) => {
  opggUrl = decodeURI(opggUrl); // Convert all special characters
  opggUrl = opggUrl.replace(/\+/g, ' ');
  opggUrl = opggUrl.replace(/%2C/g, ',');
  opggUrl = opggUrl.replace(/%23/g, '#');
  opggUrl = opggUrl.replace(/-/g, '#');
  // find "multisearch/na?=" or "summoners/na/"
  const multiQueryIndex = opggUrl.lastIndexOf(MULTI_QUERY_KEYWORD);
  if (multiQueryIndex !== -1) {
    opggUrl = opggUrl.substring(multiQueryIndex + MULTI_QUERY_KEYWORD.length);
    return opggUrl.split(',').map(name => name.trim()).filter((name) => name !== '');
  }
  const singleQueryIndex = opggUrl.lastIndexOf(SINGLE_QUERY_KEYWORD);
  if (singleQueryIndex !== -1) {
    return [opggUrl.substring(singleQueryIndex + SINGLE_QUERY_KEYWORD.length).trim()];
  }
  else {
    return null;
  }
}

/**
 * 
 * @param {string[]} opggUrlList
 * @return {object}
 */
export const opggUrlCheckProfiles = (opggUrlList) => {
  return new Promise(async (resolve, reject) => {
    try {
      const resData = {};
      const riotSummDataErrors = [];
      for (const opggUrl of opggUrlList) {
        const riotTagList = parseOpggUrl(opggUrl);
        if (!riotTagList) {
          return resolve({ errorMsg: 'opggUrl is invalid.' });
        }
        const riotSummDataRes = await getSummonerDataFromRiotTagList(riotTagList);
        if (riotSummDataRes.errorList) {
          riotSummDataErrors.push(riotSummDataRes.errorList);
        }
        else {
          const riotSummDataList = riotSummDataRes.data;
          const profilePIdList = await getProfilePIdsFromSummDataList(riotSummDataList);
          const profileNameList = [];
          for (const pId of profilePIdList) {
            profileNameList.push(await getProfileName(pId, false));
          }
          resData[opggUrl] = {
            newProfile: profilePIdList.every(id => id === null), // boolean
            summNames: riotSummDataList.map((item) => item.name),
            summIds: riotSummDataList.map((item) => item.id),
            profilePIds: profilePIdList,
            profileNames: profileNameList,
          }
        }
      }

      if (riotSummDataErrors.length > 0) { // ERROR
        return resolve({
          errorMsg: 'Error in getting Summoner Ids from the opggUrl',
          errorList: riotSummDataErrors.flat(),
        });
      }
      resolve(resData); // SUCCESS
    }
    catch (err) { reject(err); }
  })
}

/**
 * Checks if the list of summoners and profiles are new to the database.
 * @param {string} summId
 * @return {object} with attribute 'profileName' and 'summIdList'
 */
export const checkNewProfileById = (summId) => {
  return new Promise(async (resolve, reject) => {
    try {
      // profilePId Found in DB. That means profile already exists.
      const profilePId = await getProfilePIdBySummonerId(summId);
      if (profilePId) {
        return resolve({
          errorMsg: `SummId '${summId}' already exists under Profile ID '${profilePId}'`,
        });
      }
      const riotSummDataRes = await getRiotSummonerDataBySummId(summId);
      if (riotSummDataRes.errorList) {
        return resolve({
          errorMsg: `Error in getting Summoner Ids from the opggUrl`,
          errorList: riotSummDataRes.errorList,
        });
      }
      
      return resolve({
        summonerId: summId,
        summonerName: riotSummDataRes.name,
        summIdList: [ riotSummDataRes.id ],
      });
    }
    catch (err) { reject(err); }
  });
}

/**
 * Checks if the list of summoners and profiles are new to the database.
 * @param {string} opggUrl
 * @param {string} newName If null, the first 'name' from opggUrl will be used instead.
 * @return {object} with attribute 'profileName' and 'summIdList'
 */
export const checkNewProfileByUrl = (opggUrl, newName = null) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Filter out empty strings
      const riotTagList = parseOpggUrl(opggUrl);
      if (!riotTagList) {
        return resolve({ errorMsg: 'opggUrl is invalid.' });
      }
      // Check if selected Profile name already exists in Db.
      const profileName = replaceSpecialCharacters((newName) || riotTagList[0]); // Take first name from summData if newName is blank
      // Check Regex for profileName. Only include a-A, 1-9, and spaces
      if (!/^[A-Za-z0-9\s]*$/.test(profileName)) {
        return resolve({ errorMsg: `${profileName} has a character outside of whitespace, a-z, A-Z, and 0-9` });
      }
      // Check if the IGNs exist from the opggNames.
      const riotSummDataRes = await getSummonerDataFromRiotTagList(riotTagList);
      if (riotSummDataRes.errorList) {
        return resolve({
          errorMsg: `Error in getting Summoner Ids from the opggUrl`,
          errorList: riotSummDataRes.errorList,
        });
      }
      const riotSummDataList = riotSummDataRes.data;
      const profilePIdList = await getProfilePIdsFromSummDataList(riotSummDataList);
      const profilePIdErrorList = [];
      for (const [i, summProfilePId] of profilePIdList.entries()) {
        if (summProfilePId) {
          const summProfileName = await getProfileName(summProfilePId, false);
          profilePIdErrorList.push(`Summoner name '${riotTagList[i]}' is under Profile Name '${summProfileName}'`);
        }
      }
      if (profilePIdErrorList.length > 0) {
        return resolve({
          errorMsg: `Summoner Name(s) already assigned to a Profile`,
          errorList: profilePIdErrorList,
        });
      }
      // profilePId Found in DB. That means profileName already exists.
      const profilePId = await getProfilePIdByName(profileName);
      if (profilePId) {
        return resolve({
          errorMsg: `Profile '${profileName}' already exists under Profile ID '${profilePId}'`,
        });
      }
      
      return resolve({
        profileName: profileName,
        summIdList: riotSummDataList.map((dataItem) => dataItem.id),
      });
    }
    catch (err) { reject(err); }
  });
}

/**
 * DynamoDb Tables affected: Add to "Profile", "ProfileNameMap", "SummonerIdMap"
 * Calls a POST request and adds new profiles and its summoner accounts.
 * First Summoner listed will automatically be flagged as 'main'.
 * @param {string} profileName
 * @param {string[]} summIdList
 */
export const postNewProfile = (profileName, summIdList) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Trim
      profileName = profileName.trim();

      // Generate a new Profile ID
      const newPId = await generateNewPId('Profile');

      // Create LeagueAccounts object
      const newLeagueAccountsObject = {};
      for (const [idx, summId] of summIdList.entries()) {
        newLeagueAccountsObject[summId] = {
          MainAccount: (idx === 0) ? true : false, // Designate 1st account listed as the Main
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
    catch (err) { reject(err); }
  });
}

/**
 * 
 * @param {string} profileName 
 * @param {string[]} summIdList 
 * @param {string[]} summNameList 
 * @return {Promise<any>}
 */
export const putProfileAddAccount = (profileName, summIdList, summNameList) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Validity checks
      if (summIdList.length !== summNameList.length) {
        return resolve({ errorMsg: 'summIdList and summNameList sizes are different.' });
      }
      const profilePId = await getProfilePIdByName(profileName);
      if (!profilePId) {
        return resolve({ errorMsg: `Profile '${profileName}' does not exist.` });
      }
      
      // Get Profile Information
      const infoData = await getProfileInfo(profilePId);
      const accountsAdded = [];
      const accountsExisted = [];
      for (const [idx, summId] of summIdList.entries()) {
        if (!(summId in infoData.LeagueAccounts)) {
          infoData.LeagueAccounts[summId] = { MainAccount: false };
          accountsAdded.push(summNameList[idx]);
        }
        else {
          accountsExisted.push(summNameList[idx]);
        }
      }
      await dynamoDbUpdateItem('Profile', profilePId,
        'SET #key = :data',
        {
          '#key': 'Information',
        },
        {
          ':data': infoData
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

      // Cache Key: PROFILE_INFO_PREFIX
      cache.del(CACHE_KEYS.PROFILE_INFO_PREFIX + profilePId);

      return resolve({
        profilePId: profilePId,
        accountsAdded: accountsAdded,
        accountsExisted: accountsExisted,
        leagueAccounts: infoData.LeagueAccounts
      });
    }
    catch (err) { reject(err); }
  });
}

/**
 * Add summoner account to profile. Summoner will not be flagged as 'main'
 * Update "Profile" Information
 * @param {string} profileName 
 * @param {string[]} opggUrl 
 * @return {Promise<any>}
 */
export const updateProfileInfoSummonerList = (profileName, opggUrl) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Primary checks
      const riotTagList = parseOpggUrl(opggUrl);
      if (!riotTagList) {
        return resolve({ errorMsg: 'opggUrl is invalid.' });
      }
      const riotSummDataRes = await getSummonerDataFromRiotTagList(riotTagList);
      if (riotSummDataRes.errorList) {
        return resolve({
          errorMsg: `Error in getting Summoner Ids from the opggUrl`,
          errorList: riotSummDataRes.errorList,
        });
      }
      const riotSummDataList = riotSummDataRes.data;
      // Check if any of the summonerNames is already associated in another profile.
      const profilePIdList = await getProfilePIdsFromSummDataList(riotSummDataList);
      const profilePIdErrorList = [];
      for (const [idx, thisProfilePId] of profilePIdList.entries()) {
        if (thisProfilePId) {
          const thisProfileName = await getProfileName(thisProfilePId, false);
          if (thisProfileName !== profileName) {
            profilePIdErrorList.push(`Summoner name '${riotSummDataList[idx].name}' is under Profile Name '${thisProfileName}'`);
          }
        }
      }
      if (profilePIdErrorList.length > 0) {
        return resolve({
          errorMsg: 'Summoner Name(s) already assigned to a Profile',
          errorList: profilePIdErrorList,
        });
      }

      // Checks done
      const summIdList = riotSummDataList.map((item) => { return item.id; });
      const riotSummNameList = riotSummDataList.map((item) => { return item.name; });
      return resolve(await putProfileAddAccount(profileName, summIdList, riotSummNameList));
    }
    catch (err) { reject(err); }
  });
}


// BODY EXAMPLE:
// {
//     "currentName": "OLD_NAME",
//     "newName": "NEW_NAME",
// }
/**
 * Change Profile name. Update "Profile", "ProfileNameMap" table
 * @param {string} newName 
 * @param {string} currentName 
 */
export const updateProfileName = (newName, currentName) => {
  return new Promise(async (resolve, reject) => {
    try {
      const profileId = await getProfilePIdByName(currentName);
      if (!profileId) {
        return resolve({ error: `Profile '${currentName}' does not exist.` });
      }
      // Check if name is case sensitive of currentName
      const isCaseSens = filterName(newName) == filterName(currentName);
      // Check if name already exists and is NOT a case sensitive of currentName
      const checkProfilePId = await getProfilePIdByName(newName);
      if (checkProfilePId && !isCaseSens) {
        return resolve({ error: `New profile name '${newName}' is already taken!` });
      }
      else {
        // Update "Profile" table
        await dynamoDbUpdateItem('Profile', profileId,
        'SET #name = :new, #info.#name = :new',
          {
              '#name': 'ProfileName',
              '#info': 'Information',
          },
          {
              ':new': newName,
          }
        );
        if (!isCaseSens) {
          // Add newName to "ProfileNameMap" table
          await dynamoDbPutItem('ProfileNameMap', {
            'ProfileName': filterName(newName),
            'ProfileHId': getProfileHashId(profileId),
          }, filterName(newName));
          // Delete oldName from "ProfileNameMap" table
          await dynamoDbDeleteItem('ProfileNameMap', filterName(currentName));
        }
        // Del Cache
        cache.del(`${CACHE_KEYS.PROFILE_PID_BYNAME_PREFIX}${filterName(currentName)}`);
        cache.del(`${CACHE_KEYS.PROFILE_NAME_PREFIX}${profileId}`);
        cache.del(`${CACHE_KEYS.PROFILE_INFO_PREFIX}${profileId}`);

        resolve({
          'ProfilePId': profileId,
          'NewProfileName': newName,
          'OldProfileName': currentName,
        });
      }
    }
    catch (err) { reject(err); }
  });
}

/**
 * Get from dynamoDb and remove from profile PId
 * @param {string} profileName  Assume valid
 * @param {string} riotTag      Assume can be not valid
 */
export const putProfileRemoveAccount = (profileName, riotTag) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Validity checks
      const summId = (await getRiotSummonerData(riotTag)).id;
      if (!summId) {
        return resolve({ errorMsg: `${riotTag} - Summoner name does not exist.` })
      }
      const profilePId = await getProfilePIdByName(profileName);
      if (!profilePId) {
        return resolve({ errorMsg: `Profile Name '${profileName}' Not Found` })
      }

      // Checks confirmed
      const profileObject = await dynamoDbGetItem('Profile', profilePId);
      if (!(profileObject.Information?.LeagueAccounts)) {
        return resolve({ errorMsg: `Profile object does not have property 'LeagueAccounts'` });
      }
      const leagueAccountsObject = profileObject.Information.LeagueAccounts;
      if (Object.keys(profileObject.Information.LeagueAccounts).length < 2) {
        return resolve({ errorMsg: `Profile only has one summoner account linked.` });
      }
      if (leagueAccountsObject[summId]) {
        delete leagueAccountsObject[summId];
      }
      else {
        return resolve({ errorMsg: `Summoner Id ${summId} is not in the Profile.` });
      }

      // Remove from SummonerIdMap dynamodb
      await dynamoDbDeleteItem('SummonerIdMap', summId);
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
      cache.del(`${CACHE_KEYS.PROFILE_INFO_PREFIX}${profilePId}`);
      cache.del(`${CACHE_KEYS.PROFILE_PID_BYSUMM_PREFIX}${summId}`);

      resolve({
        profilePId: profilePId,
        leagueAccounts: leagueAccountsObject,
      });
    }
    catch (err) { reject(err); }
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

      // Shallow copy: Need to include both Regular+Playoff
      const gameLogProfileItem = profileDbObject['GameLog'][seasonPId]['Matches'];

      /*  
          -------------
          Game Log
          -------------
      */
      // #region Compile Data
      // Load each Stat into Profile in tournamentId
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
          'Patch': sqlPlayerStats.patch,
          'Win': (sqlPlayerStats.win == 1) ? true : false,
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
        const playerMostRecentTeamSProcData = await mySqlCallSProc('playerMostRecentMatchByRoleTournamentId', 
          profilePId, tournamentPId, role);
        statsRoleItem['MostRecentTeamHId'] = getTeamHashId(playerMostRecentTeamSProcData[0].teamPId);
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
        return;
      }

      // Delete from 'SummonerIdMap'
      for (const summId of Object.keys(profileObject.Information.LeagueAccounts)) {
        await dynamoDbDeleteItem(DYNAMODB_TABLENAMES.SUMMONERIDMAP, summId)
        cache.del(`${CACHE_KEYS.PROFILE_PID_BYSUMM_PREFIX}${summId}`);
      }
      // Delete from 'ProfileNameMap'
      await dynamoDbDeleteItem(DYNAMODB_TABLENAMES.PROFILENAMEMAP, filterName(profileName));
      // Delete from 'Profile'
      await dynamoDbDeleteItem(DYNAMODB_TABLENAMES.PROFILE, profilePId);

      // Delete cache
      cache.del(`${CACHE_KEYS.PROFILE_NAME_PREFIX}${profilePId}`);
      cache.del(`${CACHE_KEYS.PROFILE_PID_BYNAME_PREFIX}${filterName(profileName)}`);

      resolve({
        'ProfileRemoved': profilePId,
      });
    }).catch((err) => { reject(err); });
  });
}