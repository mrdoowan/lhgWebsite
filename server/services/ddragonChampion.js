import axios from "axios"
import { CACHE_KEYS } from "../functions/apiV1/dependencies/cacheKeys"
import { getDDragonVersion } from "./ddragonVersion"

const redis = require('redis');
const cache = (process.env.NODE_ENV === 'production') ? redis.createClient(process.env.REDIS_URL) : redis.createClient(process.env.REDIS_PORT);

/**
 * @param {string} key      The id of each Champion (i.e. '1' is Annie)
 */
export const getChampUrlId = (key) => {
    return new Promise((resolve, reject) => {
        createChampObject.then((champObject) => {
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
        createChampObject.then((champObject) => {
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
 */
export const createChampObject = () => {
    return new Promise((resolve, reject) => {
        const cacheKey = CACHE_KEYS.CHAMP_OBJECT;
        cache.get(cacheKey, async (err, data) => {
            if (err) { console.error(err); reject(err); return; }
            else if (data) { resolve(data); return; }

            const latestDdragonPatch = await getDDragonVersion();
            axios.get(`http://ddragon.leagueoflegends.com/cdn/${latestDdragonPatch}/data/en_US/champion.json`)
            .then((res) => {
                const { data } = res.data;
                let champByKey = {};
                for (const value of Object.values(data)) {
                    champByKey[value.key] = {
                        id: value.id,
                        name: value.name,
                    }
                }
                cache.set(cacheKey, champByKey, 'EX', GLOBAL_CONSTS.TTL_DURATION);
                resolve(champByKey);
            }).catch((err) => {
                reject(err);
            });
        });
    });
}