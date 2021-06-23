import axios from "axios"
import { getDDragonVersion } from "./ddragonVersion"

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
 * @param {string} patch        Can be 'null' for latest
 * @returns Promise<object>
 */
export const createChampObject = (patch = null) => {
  return new Promise(async (resolve, reject) => {
    const ddragonVersion = await getDDragonVersion(patch);
    axios.get(`http://ddragon.leagueoflegends.com/cdn/${ddragonVersion}/data/en_US/champion.json`)
      .then((res) => {
        const { data } = res.data;
        let champByKey = {};
        for (const value of Object.values(data)) {
          champByKey[value.key] = {
            id: value.id,
            name: value.name,
          }
        }
        resolve(champByKey);
      }).catch((err) => {
        reject(err);
      });
  });
}