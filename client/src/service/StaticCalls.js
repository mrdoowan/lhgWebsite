import axios from "axios";

// API url calls
const CHAMPS = 'champs';
const SPELLS = 'spells';
const VERSIONS = 'versions';

/**
 * Helper function to call GET request of static data
 * @param {string} apiType  API URL call in string
 * @returns Promise
 */
const getStaticData = (apiType) => {
  const sessionKey = {
    [CHAMPS]: 'doowanstats_champIds',
    [SPELLS]: 'doowanstats_spellIds',
    [VERSIONS]: 'doowanstats_versions',
  }

  return new Promise((resolve, reject) => {
    const data = JSON.parse(window.sessionStorage.getItem(sessionKey[apiType]));

    if (!data) {
      axios.get(`/api/service/v1/${apiType}`).then((res) => {
        window.sessionStorage.setItem(sessionKey[apiType], JSON.stringify(res.data));
        resolve(res.data);
      }).catch((err) => {
        console.error(err.response);
        reject(err.response);
      });
    }
    else {
      resolve(data);
    }
  });
}

/**
 * 
 * @param {number} id
 * @returns Promise
 */
export const getChampUrlId = async (id) => {
  const champByIds = await getStaticData(CHAMPS);

  if (!champByIds) return null;
  if (!(id in champByIds)) {
    return id;
  }
  return champByIds[id]['id'];
}

/**
 * 
 * @param {number} id
 * @returns Promise
 */
export const getChampName = async (id) => {
  const champByIds = await getStaticData(CHAMPS);

  if (!champByIds) return null;
  if (!(id in champByIds)) {
    return id;
  }
  return champByIds[id]['name'];
}

/**
 * 
 * @param {number} id 
 * @returns Promise
 */
export const getSpellUrlId = async (id) => {
  const spellByIds = await getStaticData(SPELLS);

  if (!spellByIds) { return null; }
  if (!(id in spellByIds)) {
    return id;
  }
  return spellByIds[id]['id'];
}

/**
 * 
 * @returns Promise
 */
export const getCurrentVersion = async () => {
  const versionList = await getStaticData(VERSIONS);

  return (versionList) ? versionList[0] : null;
}

/**
 * 
 * @param {string} patch 
 * @returns Promise
 */
export const getVersionByPatch = async (patch) => {
  const versionList = await getStaticData(VERSIONS);

  if (!versionList) return null;
  if (patch) {
    for (const DDragonVersion of versionList) {
      if (DDragonVersion.includes(patch)) {
        return DDragonVersion;
      }
    }
  }
  return versionList[0]; // Default latest patch
}