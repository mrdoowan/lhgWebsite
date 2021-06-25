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
const staticAxiosCall = (apiType) => {
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
 * Get ChampIds object
 * @returns Promise
 */
export const getChampIds = () => {
  return staticAxiosCall(CHAMPS);
}

/**
 * Get SpellIds object
 * @returns Promise
 */
export const getSpellIds = () => {
  return staticAxiosCall(SPELLS);
}

/**
 * Get Versions list
 * @returns Promise
 */
export const getVersionList = () => {
  return staticAxiosCall(VERSIONS);
}