/*  Declaring npm modules */
const redis = require('redis');

import axios from "axios"
import { CACHE_KEYS } from "../functions/apiV1/dependencies/cacheKeys";
import { GLOBAL_CONSTS } from "../functions/apiV1/dependencies/global";
import { getDDragonVersion } from "./ddragonVersion"

const cache = (process.env.NODE_ENV === 'production') ? redis.createClient(process.env.REDIS_URL) : redis.createClient(process.env.REDIS_PORT);

/**
 * @param {string} key      The id of each Champion (i.e. '1' is Annie)
 */
export const getChampUrlId = (key) => {
  return new Promise((resolve, reject) => {
    createChampObject().then((champObject) => {
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
export const getChampName = (key) => {
  return new Promise((resolve, reject) => {
    createChampObject().then((champObject) => {
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
 * Creates an object of Champions with the following property as an example
 * {
 *   '1': {
 *     "id": "Annie",
 *     "name": "Annie"
 *   }
 * }
 * @param {string} patch        Can be 'null' for latest
 * @returns Promise<object>
 */
export const createChampObject = (patch = null) => {
  const cacheKey = `${CACHE_KEYS.CHAMP_OBJECT}${patch}`;
  return new Promise((resolve, reject) => {
    cache.get(cacheKey, async (err, data) => {
      if (err) { console(err); reject(err); return; }
      else if (data) { resolve(JSON.parse(data)); return; }
      const ddragonVersion = await getDDragonVersion(patch);
      axios.get(`http://ddragon.leagueoflegends.com/cdn/${ddragonVersion}/data/en_US/champion.json`)
      .then((res) => {
        const { data } = res.data;
        const champByKey = {};
        for (const value of Object.values(data)) {
          champByKey[value.key] = {
            id: value.id,
            name: value.name,
          }
        }
        cache.set(cacheKey, JSON.stringify(champByKey, null, 2), 'EX', GLOBAL_CONSTS.TTL_DURATION);
        resolve(champByKey);
      }).catch((err) => {
        reject(err);
      });
    });
  });
}