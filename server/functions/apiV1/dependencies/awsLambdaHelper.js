import { GLOBAL_CONSTS } from '../dependencies/global';

/*  Declaring npm modules */
const AWS = require('aws-sdk'); // Interfacing with our AWS Lambda functions
const twisted = require("twisted");
/*  Configurations of npm modules */
const { Constants } = twisted;
AWS.config.update({ region: 'us-east-2' });
const lambda = new AWS.Lambda({ apiVersion: '2015-03-31' });

/**
 * (AWS Lambda function)
 * Calls Riot API and gets the Summoner ID of the summoner account
 * Returns the request object from Riot API
 * @param {string} name     Summoner IGN
 */
export const getRiotSummonerId = (name) => new Promise((resolve, reject) => {
  console.log(`AWS Lambda: Getting Summoner Id of '${name}'`);
  const params = {
    FunctionName: GLOBAL_CONSTS.AWS_LAMBDA_NAME,
    Payload: JSON.stringify({
      type: 'SUMMONER_DATA',
      summonerName: name,
      region: Constants.Regions.AMERICA_NORTH
    }),
  };
  lambda.invoke(params, (err, data) => {
    if (err) { console.error(err); reject(err); return; }
    resolve(JSON.parse(data.Payload));
  });
});

/**
 * (AWS Lambda function)
 * Calls Riot API and gets MatchV4 Data of the input Match ID
 * Returns the request object of Match with items "Data" and "Timeline"
 * @param {string} matchId
 */
export const getRiotMatchData = (matchId) => new Promise((resolve, reject) => {
  console.log(`AWS Lambda: Getting Match Data and Timeline of Id '${matchId}'`);
  const params = {
    FunctionName: GLOBAL_CONSTS.AWS_LAMBDA_NAME,
    Payload: JSON.stringify({
      type: 'MATCH_DATA',
      matchId: `${Constants.Regions.AMERICA_NORTH}_${matchId}`,
      regionGroup: Constants.RegionGroups.AMERICAS,
    }),
  };
  lambda.invoke(params, (err, data) => {
    if (err) { console.error(err); reject(err); return; }
    resolve(JSON.parse(data.Payload));
  });
});

/**
 * (AWS Lambda function)
 * Calls Riot API and gets the Spectate Data of the input Summoner ID
 * Returns the request object of Spectate Request
 * @param {string} summonerId     Summoner ID
 */
export const getRiotSpectateData = (summonerId) => new Promise((resolve, reject) => {
  console.log(`AWS Lambda: Getting Spectate Data from Summoner Id '${summonerId}'`);
  const params = {
    FunctionName: GLOBAL_CONSTS.AWS_LAMBDA_NAME,
    Payload: JSON.stringify({
      type: 'SPECTATE_DATA',
      summonerId: summonerId,
      region: Constants.Regions.AMERICA_NORTH,
    }),
  };
  lambda.invoke(params, (err, data) => {
    if (err) { console.error(err); reject(err); return; }
    resolve(JSON.parse(data.Payload));
  });
});

/**
 * (AWS Lambda function)
 * Calls a POST Riot API request and creates a new tournament ID
 * @param {string} seasonShortName  seasonShortName (i.e. "w2021agl")
 * @returns {Promise<number>}       Tournament ID (number)
 */
export const createTournamentId = (seasonShortName) => {
  return new Promise((resolve, reject) => {
    console.log(`AWS Lambda: Create new Tournament Id for season '${seasonShortName}'`);
    const params = {
      FunctionName: GLOBAL_CONSTS.AWS_LAMBDA_TOURNAMENT,
      Payload: JSON.stringify({
        type: 'CREATE_TOURNAMENT',
        test: false,
        seasonName: seasonShortName
      }),
    }
    lambda.invoke(params, (err, data) => {
      if (err) { console.error(err); reject(err); return; }
      const res = JSON.parse(data.Payload);
      if (typeof(res) !== 'number') { reject({ error: res }); return; }
      console.log(`AWS Lambda: New Tournament ID '${res}' has been created in the Tournament API.`);
      resolve(res);
    });
  });
}

/**
 * Calls a POST Riot API request and generates Tournament Codes with a given tournament ID
 * @param {string} week             i.e. "W1", "W2", etc., "PI1", "PI2", etc. "RO16", "QF", "SF", "F"
 * @param {number} tournamentId     Tournament ID provided from createTournamentId
 * @param {string} seasonShortName  i.e. "w2022agl"
 * @param {string} team1            Team Name i.e. "Team Ambition"
 * @param {string} team2            Team Name i.e. "Omega Gaming"
 * @param {string} numCodes         Number of codes to generate
 * @returns {Promise<string[]>}     List of Tournament Codes
 */
export const generateTournamentCodes = (week, tournamentId, seasonShortName, team1 = null, team2 = null, numCodes = null) => {
  return new Promise((resolve, reject) => {
    console.log(`AWS Lambda: Generate new codes for season '${seasonShortName}'`);
    const params = {
      FunctionName: GLOBAL_CONSTS.AWS_LAMBDA_TOURNAMENT,
      Payload: JSON.stringify({
        type: 'GENERATE_CODES',
        test: process.env.TEST_DB.toLowerCase() == 'true',
        week: week,
        tournamentId: tournamentId,
        seasonName: seasonShortName,
        numCodes: numCodes,
        team1: team1,
        team2: team2,
      }),
    }
    lambda.invoke(params, (err, data) => {
      if (err) { console.error(err); reject(err); return; }
      resolve(JSON.parse(data.Payload));
    });
  });
}