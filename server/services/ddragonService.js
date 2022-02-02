import axios from "axios"
import { getDdragonVersion } from "./miscDynamoDb";

/**
 * Creates an object of Champions from DDragon with the following property as an example
 * {
 *   '1': {
 *     "id": "Annie",
 *     "name": "Annie"
 *   }
 * }
 * Unlike the misc DB, this creates a list of champions based on the Patch
 * @param {string} patch        Can be 'null' for latest
 * @returns Promise<object>
 */
export const createChampObjectFromDdragon = (patch = null) => {
  return new Promise(async (resolve, reject) => {
    const ddragonVersion = await getDdragonVersion(patch);
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
      resolve(champByKey);
    }).catch((err) => {
      reject(err);
    });
  });
}

/**
 * Creates a Version List from DDragon
 * @returns Promise<List>
 */
export const createVersionListFromDdragon = () => {
  return new Promise((resolve, reject) => {
    axios.get(`https://ddragon.leagueoflegends.com/api/versions.json`)
    .then((res) => {
      const versionList = res.data;
      resolve(versionList);
    }).catch((err) => {
      reject(err);
    })
  });
}