/**
 * Ultimate Helper file for calling Riot endpoints
 */

import axios from "axios";

/*
TODO: Complete in the future

// CONSTANTS
const AMERICAS = 'AMERICAS';
const NA1 = 'NA1';
const MATCH = 'match';

const RIOT_ENDPOINTS = {
  MatchV5: {
    prefix: MATCH,
    version: 5,
    path: 'matches/$(subRegion)_$(matchId)',
  },
  MatchTimelineV5: {
    prefix: MATCH,
    version: 5,
    path: '',
  },
};

const makeApiPath = (endpointObject, params) => {
  const apiKey = process.env.RIOT_API_KEY;
  const { region, prefix, version, path } = endpointObject;
  const parsedPath = parsePath(path, params);

  return `https://${region.toLowerCase()}.api.riotgames.com/lol/${prefix}/v${version}/${parsedPath}?api_key=${apiKey}`;
}

const axiosRequestCall = (endpointObject, params) => {
  const apiUrl = makeApiPath(endpointObject, params);

  return new Promise((resolve, reject) => {
    axios.get(apiUrl).then((res) => {
      resolve(res.data);
    }).catch((err) => {
      reject(err);
    });
  });
}

*/

// Export functions

/**
 * 
 * @param {number} matchId 
 * @returns {Promise} RiotMatchV5DTO
 */
export const getRiotMatchV5Dto = (matchId) => {
  console.log(`Riot MatchV5: Getting Match Dto '${matchId}'`);
  const apiKey = process.env.RIOT_API_KEY;
  const apiUrl = `https://americas.api.riotgames.com/lol/match/v5/matches/NA1_${matchId}?api_key=${apiKey}`; 

  return new Promise((resolve, reject) => {
    axios.get(apiUrl).then((res) => {
      resolve(res.data);
    }).catch((err) => {
      reject(err);
    });
  });
}

/**
 * 
 * @param {number} matchId 
 * @returns {Promise} RiotMatchTimelineV5DTO
 */
export const getRiotMatchV5TimelineDto = (matchId) => {
  console.log(`Riot MatchV5: Getting Match Timeline Dto '${matchId}'`);
  const apiKey = process.env.RIOT_API_KEY;
  const apiUrl = `https://americas.api.riotgames.com/lol/match/v5/matches/NA1_${matchId}/timeline?api_key=${apiKey}`; 

  return new Promise((resolve, reject) => {
    axios.get(apiUrl).then((res) => {
      resolve(res.data);
    }).catch((err) => {
      reject(err);
    });
  });
}