import axios from "axios";

// API url calls
const CHAMPS = 'champs';
const SPELLS = 'spells';
const VERSIONS = 'versions';

const sessionKey = {
  [CHAMPS]: 'doowanstats_champIds',
  [SPELLS]: 'doowanstats_spellIds',
  [VERSIONS]: 'doowanstats_versions',
}

/**
 * Helper function to call GET request of static data
 * @param {string} apiType  API URL call in string
 * @returns Promise
 */
const setSessionData = (apiType) => {
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
 * @param {string} apiType 
 * @returns Object
 */
const getSessionData = (apiType) => {
  return JSON.parse(window.sessionStorage.getItem(sessionKey[apiType]));
}

/**
 * 
 * @returns boolean
 */
export const isSessionDataLoaded = () => {
  return (
    JSON.parse(window.sessionStorage.getItem(CHAMPS)) &&
    JSON.parse(window.sessionStorage.getItem(SPELLS)) &&
    JSON.parse(window.sessionStorage.getItem(VERSIONS))
  );
}

/**
 * Sets session data for the map object of Champs
 * @returns void
 */
export const setSessionDataChamps = () => {
  setSessionData(CHAMPS);
}

/**
 * Sets session data for the map object of Spells
 * @returns void
 */
export const setSessionDataSpells = () => {
  setSessionData(SPELLS);
}

/**
 * Sets session data for list of Versions
 * @returns void
 */
export const setSessionDataVersions = () => {
  setSessionData(VERSIONS);
}

/**
 * 
 * @param {number} id
 * @returns Promise
 */
export const getChampUrlId = (id) => {
  const champByIds = getSessionData(CHAMPS);

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
export const getChampName = (id) => {
  const champByIds = getSessionData(CHAMPS);

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
export const getSpellUrlId = (id) => {
  const spellByIds = getSessionData(SPELLS);

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
export const getCurrentVersion = () => {
  const versionList = getSessionData(VERSIONS);

  return (versionList) ? versionList[0] : null;
}

/**
 * 
 * @param {string} patch 
 * @returns Promise
 */
export const getVersionByPatch = (patch) => {
  const versionList = getSessionData(VERSIONS);

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