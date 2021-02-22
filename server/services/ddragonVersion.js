import axios from "axios";
import { CACHE_KEYS } from "../functions/apiV1/dependencies/cacheKeys";
import { GLOBAL_CONSTS } from "../functions/apiV1/dependencies/global";

const redis = require('redis');
const cache = (process.env.NODE_ENV === 'production') ? redis.createClient(process.env.REDIS_URL) : redis.createClient(process.env.REDIS_PORT);

/**
 * Gets the DDragon version of the LoL patch based on: https://ddragon.leagueoflegends.com/api/versions.json
 * @param {string} patch    Specified League of Legends patch (i.e. "10.23"). 'null' to get latest Patch
 */
export const getDDragonVersion = (patch=null) => {
    return new Promise((resolve, reject) => {
        axios.get(`https://ddragon.leagueoflegends.com/api/versions.json`)
        .then((res) => {
            const versionList = res.data;
            if (patch) {
                for (let i = 0; i < versionList.length; ++i) {
                    const DDragonVersion = versionList[i];
                    if (DDragonVersion.includes(patch)) {
                        resolve(DDragonVersion);
                    }
                }
            }
            const cacheKey = CACHE_KEYS.LATEST_PATCH;
            cache.get(cacheKey, (err, data) => {
                if (err) { console.error(err); reject(err); return; }
                else if (data) { resolve(JSON.parse(data)); return; }
                cache.set(cacheKey, JSON.stringify(versionList[0]), 'EX', GLOBAL_CONSTS.TTL_DURATION);
                resolve(versionList[0]);    // Return latest as default
            });
        }).catch((err) => {
            reject(err);
        });
    });
}