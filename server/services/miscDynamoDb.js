import { CACHE_KEYS } from "../functions/apiV1/dependencies/cacheKeys";
import { dynamoDbGetItem } from "../functions/apiV1/dependencies/dynamoDbHelper";
import { GLOBAL_CONSTS } from "../functions/apiV1/dependencies/global";
import {
  DYNAMODB_TABLENAMES,
  MISC_KEYS
} from "./constants";

/*  Declaring npm modules */
const redis = require('redis');
const cache = (process.env.NODE_ENV === 'production') ? redis.createClient(process.env.REDIS_URL) : redis.createClient(process.env.REDIS_PORT);

/**
 * Calls the DynamoDb Miscellaneous table
 * @param {string} dynamoDbKey  The name of the key in DynamoDb
 * @returns object
 */
const callMiscDynamoDb = (dynamoDbKey) => {
  const getCacheKey = {
    [MISC_KEYS.CHAMP_IDS]: CACHE_KEYS.CHAMP_IDS,
    [MISC_KEYS.SPELL_IDS]: CACHE_KEYS.SPELL_IDS,
    [MISC_KEYS.VERSIONS]: CACHE_KEYS.VERSIONS,
  }

  return new Promise((resolve, reject) => {
    cache.get(getCacheKey[dynamoDbKey], async (err, data) => {
      if (err) { console.error(err); reject(err); }
      else if (data) { resolve(JSON.parse(data)); return; }
      try {
        let dynamoJson = await dynamoDbGetItem(DYNAMODB_TABLENAMES.MISCELLANEOUS, dynamoDbKey);
        if (dynamoDbKey === MISC_KEYS.VERSIONS) { dynamoJson = dynamoJson['VersionList'] }
        cache.set(getCacheKey[dynamoDbKey], JSON.stringify(dynamoJson, null, 2), 'EX', GLOBAL_CONSTS.TTL_DURATION)
        resolve(dynamoJson);
      }
      catch (err) {
        console.error(error); 
        reject(error);
      }
    });
  });
}

/**
 * Calls the DynamoDb stored static data ChampIds
 * @returns object
 */
export const getChampIdObject = () => {
  return callMiscDynamoDb(MISC_KEYS.CHAMP_IDS);
}

/**
 * @param {string} key      The id of each Champion (i.e. '1' is Annie)
 */
 export const getServerChampUrlId = (key) => {
  return new Promise((resolve, reject) => {
    getChampIdObject().then((champObject) => {
      if (!(key in champObject)) {
        resolve(key);
      }
      else {
        resolve(champObject[key]['id']);
      }
    }).catch((err) => {
      reject(err);
    });
  });
}

/**
 * @param {string} key      The id of each Champion (i.e. '1' is Annie)
 */
export const getServerChampName = (key) => {
  return new Promise((resolve, reject) => {
    getChampIdObject().then((champObject) => {
      if (!(key in champObject)) {
        resolve(key);
      }
      else {
        resolve(champObject[key]['name']);
      }
    }).catch((err) => {
      reject(err);
    });
  });
}

/**
 * Calls the DynamoDb stored static data SummonerSpellIds
 * @returns object
 */
export const getSpellIdObject = () => {
  return callMiscDynamoDb(MISC_KEYS.SPELL_IDS);
}

/**
 * Calls the DynamoDb stored static data Versions.json
 * @returns array
 */
export const getVersionList = () => {
  return callMiscDynamoDb(MISC_KEYS.VERSIONS);
}

/**
 * 
 * @param {string} patch 
 * @returns string
 */
 export const getDdragonVersion = (patch) => {
  return new Promise((resolve, reject) => {
    getVersionList().then((versionList) => {
      if (patch) {
        for (const DDragonVersion of versionList) {
          if (DDragonVersion.includes(patch)) {
            resolve(DDragonVersion);
            return;
          }
        }
      }
      resolve(versionList[0]);    // Return latest as default
    }).catch((err) => {
      reject(err);
    });
  });
}