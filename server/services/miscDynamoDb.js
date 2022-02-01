import { CACHE_KEYS } from "../functions/apiV1/dependencies/cacheKeys";
import { 
  dynamoDbGetItem,
  dynamoDbPutItem,
  dynamoDbUpdateItem,
} from "../functions/apiV1/dependencies/dynamoDbHelper";
import { GLOBAL_CONSTS } from "../functions/apiV1/dependencies/global";
import {
  DYNAMODB_TABLENAMES,
  MISC_KEYS
} from "./constants";
import {
  createChampObjectFromDdragon,
  createVersionListFromDdragon
} from "./ddragonService";

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
 * @returns Promise<object>
 */
export const getChampIdObject = () => {
  return callMiscDynamoDb(MISC_KEYS.CHAMP_IDS);
}

/**
 * Calls the DynamoDb stored static data SummonerSpellIds
 * @returns Promise<object>
 */
 export const getSpellIdObject = () => {
  return callMiscDynamoDb(MISC_KEYS.SPELL_IDS);
}

/**
 * Calls the DynamoDb stored static data Versions.json
 * @returns Promise<list>
 */
export const getVersionList = () => {
  return callMiscDynamoDb(MISC_KEYS.VERSIONS);
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
 * Gets DDragon version based on patch
 * @param {string} patch 
 * @returns {Promise<string>}  Ddragon version (i.e. "12.1.1")
 */
export const getDdragonVersion = (patch = null) => {
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

/**
 * Updates the miscellaneous DynamoDb ChampById by looking at Ddragon
 * This one will involve an update query instead of a Put
 */
export const updateChampByIds = () => {
  console.log("Updating ChampByIds from Ddragon.");
  createChampObjectFromDdragon().then((ddragonObject) => {
    getChampIdObject().then((dynamoDbObject) => {
      const missingKey = {};
      // Compare the two objects and store the missing key for update
      for (const key in ddragonObject) {
        if (!(key in dynamoDbObject)) {
          missingKey[key] = ddragonObject[key];
        }
      }
      // Update DynamoDbObject of all missing keys
      if (Object.keys(missingKey).length > 0) {
        for (const [champKey, value] of Object.entries(missingKey)) {
          dynamoDbUpdateItem('Miscellaneous', MISC_KEYS.CHAMP_IDS,
            'SET #key = :val',
            {
              '#key': champKey
            },
            {
              ':val': value,
            }
          ).then(() => {
            console.log(`DynamoDb champ ${value.name} (${champKey}) updated into DynamoDb.`);
          }).catch((err) => {
            console.log("ERROR: DynamoDb ChampById failed to update.");
            throw err 
          });
        }
      }
      else {
        console.log("No updates made to ChampByIds.");
      }      
    }).catch((err) => { throw err });
  }).catch((err) => console.error(err));
}

/**
 * Updates the miscellaneous DynamoDb ChampById by looking at Ddragon
 */
export const updateVersionList = () => {
  console.log("Updating VersionList from Ddragon.");
  createVersionListFromDdragon().then((versionList) => {
    const data = {
      Key: MISC_KEYS.VERSIONS,
      VersionList: versionList
    }
    dynamoDbPutItem(DYNAMODB_TABLENAMES.MISCELLANEOUS, data, MISC_KEYS.VERSIONS)
    .then(() => {
      console.log("DynamoDb version list updated from Ddragon.");
    }).catch((err) => {
      console.log("ERROR: DynamoDb version failed to update.");
      throw err;
    });
  }).catch((err) => {
    console.error(err);
  });
}