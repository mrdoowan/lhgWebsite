/*  Declaring npm modules */
const redis = require('redis');

import axios from "axios";
import { CACHE_KEYS } from "../functions/apiV1/dependencies/cacheKeys";

const cache = (process.env.NODE_ENV === 'production') ? redis.createClient(process.env.REDIS_URL) : redis.createClient(process.env.REDIS_PORT);

/**
 * @deprecated Use "createVersionListFromDdragon" function from ddragonService.js now
 * Gets the DDragon version of the LoL patch based on: https://ddragon.leagueoflegends.com/api/versions.json
 * @param {string} patch    Specified League of Legends patch (i.e. "10.23"). 'null' to get latest Patch
 * @returns 
 */
export const createDdragonVersionList = () => {
  const cacheKey = CACHE_KEYS.VERSIONS;
  return new Promise((resolve, reject) => {
    cache.get(cacheKey, async (err, data) => {
      if (err) { reject(err); return; }
      else if (data) { resolve(JSON.parse(data)); return; }
      axios.get(`https://ddragon.leagueoflegends.com/api/versions.json`)
      .then((res) => {
        cache.set(cacheKey, JSON.stringify(res.data, null, 2), 'EX', GLOBAL_CONSTS.TTL_DURATION);
        resolve(res.data);
      }).catch((err) => {
        reject(err);
      });
    });
  });
}