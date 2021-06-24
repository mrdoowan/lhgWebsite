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
        const dynamoJson = await dynamoDbGetItem(DYNAMODB_TABLENAMES.MISCELLANEOUS, dynamoDbKey);
        cache.set(getCacheKey[dynamoDbKey], JSON.stringify(dynamoJson, null, 2), 'EX', GLOBAL_CONSTS.TTL_DURATION)
        return dynamoJson;
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
export const getChampIds = () => {
  return callMiscDynamoDb(MISC_KEYS.CHAMP_IDS);
}

/**
 * Calls the DynamoDb stored static data SummonerSpellIds
 * @returns object
 */
export const getSummonerSpellIds = () => {
  return callMiscDynamoDb(MISC_KEYS.SPELL_IDS);
}

/**
 * Calls the DynamoDb stored static data Versions.json
 * @returns object
 */
export const getVersions = () => {
  return callMiscDynamoDb(MISC_KEYS.VERSIONS);
}