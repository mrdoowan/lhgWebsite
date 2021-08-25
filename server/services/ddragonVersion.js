/*  Declaring npm modules */
const redis = require('redis');

import axios from "axios";
import { CACHE_KEYS } from "../functions/apiV1/dependencies/cacheKeys";

const cache = (process.env.NODE_ENV === 'production') ? redis.createClient(process.env.REDIS_URL) : redis.createClient(process.env.REDIS_PORT);

/**
 * 
 * @param {array} versionList
 * @param {string} patch 
 * @returns string
 */
const getVersion = (versionList, patch) => {
  if (patch) {
    for (const DDragonVersion of versionList) {
      if (DDragonVersion.includes(patch)) {
        return DDragonVersion;
      }
    }
  }
  else {
    return versionList[0];    // Return latest as default
  }
}

/**
 * Gets the DDragon version of the LoL patch based on: https://ddragon.leagueoflegends.com/api/versions.json
 * @param {string} patch    Specified League of Legends patch (i.e. "10.23"). 'null' to get latest Patch
 */
export const getDDragonVersion = (patch = null) => {
  const cacheKey = CACHE_KEYS.VERSIONS;
  return new Promise((resolve, reject) => {
    cache.get(cacheKey, async (err, data) => {
      if (err) { console(err); reject(err); return; }
      else if (data) {
        resolve(getVersion(JSON.parse(data)), patch);
      }
      else {
        axios.get(`https://ddragon.leagueoflegends.com/api/versions.json`)
        .then((res) => {
          resolve(getVersion(res.data), patch);
        }).catch((err) => {
          reject(err);
        });
      }
    });
  });
}