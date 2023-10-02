const matchV1Routes = require('express').Router();

import {
  res200sOK,
  res400sClientError,
  error500sServerError,
} from './dependencies/handlers';
/*  Import helper Data function modules */
import {
  getMatchData,
  getMatchSetup,
  postMatchNewSetup,
  deleteMatchData,
  getMatchSetupMap,
  putMatchSaveSetup,
  invalidateMatch,
  postNewMatchesByPuuid,
} from '../../functions/apiV1/matchData';
import { submitMatchSetup } from '../../functions/apiV1/matchSubmit/matchSubmit';
import { getTournamentId } from '../../functions/apiV1/tournamentData';
import { authenticateJWT } from './dependencies/jwtHelper';
import { getSeasonId, getSeasonInformation } from '../../functions/apiV1/seasonData';
import { getRiotSummonerDataByName } from '../../functions/apiV1/dependencies/awsLambdaHelper';

/*  
    ----------------------
    Match API Requests
    ----------------------
*/
//#region GET Requests - Match

/**
 * @route   GET api/match/v1/data/:matchId
 * @desc    Get Match Data
 * @access  Public
 */
matchV1Routes.get('/data/:matchId', (req, res) => {
  const { matchId } = req.params;

  console.log(`GET Request Match '${matchId}' Data.`);
  getMatchData(matchId).then((data) => {
    if (data == null) { return res400sClientError(res, req, `Match ID '${matchId}' Not Found`); }
    return res200sOK(res, req, data);
  }).catch((err) => error500sServerError(err, res, "GET Match Data Error."));
});

/**
 * @route   GET api/match/v1/setup/data/:matchId
 * @desc    Get Match Setup
 * @access  Public
 */
matchV1Routes.get('/setup/data/:matchId', (req, res) => {
  const { matchId } = req.params;

  console.log(`GET Request Match '${matchId}' Setup.`);
  getMatchSetup(matchId).then((data) => {
    if (data == null) { return res400sClientError(res, req, `Match ID '${matchId}' Setup Not Found`); }
    return res200sOK(res, req, data);
  }).catch((err) => error500sServerError(err, res, "GET Match Setup Error."));
});

//#endregion

//#region POST / PUT / DELETE Requests - Match

/**
 * @route   POST api/match/v1/setup/new/id
 * @desc    Create Match "Setup" Item by the ID of a previous played Match
 * @access  Private (to Admins)
 */
matchV1Routes.post('/setup/new/id', authenticateJWT, (req, res) => {
  const { riotMatchId, tournamentName, week, invalidFlag } = req.body;

  console.log(`POST Request Match '${riotMatchId}' New Setup in ${tournamentName} by manual entry.`);
  getTournamentId(tournamentName).then((tournamentId) => {
    if (!tournamentId) { res400sClientError(res, req, `Tournament shortname '${tournamentName}' Not Found.`); }
    postMatchNewSetup(riotMatchId, tournamentId, week, invalidFlag).then((data) => {
      if ('Error' in data) { return error500sServerError(res, req, `Match ID '${riotMatchId}' POST Request New Setup Failed`, data); }
      return res200sOK(res, req, data);
    }).catch((err) => error500sServerError(err, res, "POST Match New Setup Error."));
  }).catch((err) => error500sServerError(err, res, "GET Tournament Id Error."));
});

/**
 * @route   POST api/match/v1/setup/new/tournament
 * @desc    Create Match "Setup" Item from Riot's Tournament API. This will be used as a callback.
 * @access  Private (to Admins)
 */
matchV1Routes.post('/setup/new/callback', (req, res) => {
  console.log(req);
  const { gameId, metaData } = req.body;
  const metaDataJson = JSON.parse(metaData);
  const seasonShortName = metaDataJson.seasonName;
  const week = metaDataJson.week.toUpperCase();

  console.log(`POST Request Match '${gameId}' New Setup in ${seasonShortName} by Tournament API callback.`);
  getSeasonId(seasonShortName).then((seasonId) => {
    if (!seasonId) { res400sClientError(res, req, `Tournament shortname '${seasonShortName}' Not Found.`); }
    getSeasonInformation(seasonId).then((seasonInfo) => {
      const tournamentId = (["RO16", "RO12", "QF", "SF", "F"].includes(week)) ? 
        seasonInfo?.TournamentPIds?.PostTournamentPId : seasonInfo?.TournamentPIds?.RegTournamentPId;
      postMatchNewSetup(gameId.toString(), tournamentId, week, invalidFlag).then((data) => {
        if ('Error' in data) { return error500sServerError(res, req, `Match ID '${gameId}' POST Request New Setup Failed`, data); }
        return res200sOK(res, req, data);
      }).catch((err) => error500sServerError(err, res, "POST Match New Setup Error."));
    }).catch((err) => error500sServerError(err, res, "GET Season Info Error."));
  }).catch((err) => error500sServerError(err, res, "GET Season Id Error."));
});

/**
 * @route   POST api/match/v1/setup/new/profile
 * @desc    Create multiple Match "Setup" items based on tourney games played in the last 2 days by a Summoner name.
 * @access  Private (to Admins)
 */
matchV1Routes.post('/setup/new/profile', (req, res) => {
  const { summonerName, date, week, tournamentName } = req.body;

  console.log(`POST Request Match New Setups in by summoner name '${summonerName}'`);
  getTournamentId(tournamentName).then((tournamentId) => {
    getRiotSummonerDataByName(summonerName).then((summonerData) => {
      const { puuid } = summonerData;
      postNewMatchesByPuuid(puuid, date, week, tournamentId).then((data) => {
        if (data.errors.length > 0) { return error500sServerError(res, req, `POST Request New Setup Failed by puuid '${summonerName}'`, data.errors); }
        if (data.success.length === 0) { return res400sClientError(res, req, `summonerName '${summonerName}' did not have a Tournament match on ${date}`); }
        return res200sOK(res, req, data.success);
      }).catch((err) => error500sServerError(err, res, "POST Matches New Setup by puuid Error."));
    }).catch((err) => error500sServerError(err, res, "GET Riot Summoner Id Error."));
  }).catch((err) => error500sServerError(err, res, "GET Tournament Id Error."));
});

/**
 * @route   GET api/match/v1/setup/list
 * @desc    Get List of Match Ids that have a "Setup" Item
 * @access  Private (to Admins)
 */
matchV1Routes.get('/setup/list', (req, res) => {
  console.log(`GET Request Match Ids of Setup Key`);
  getMatchSetupMap().then((data) => {
    if (!data) { return res400sClientError(res, req, `Match Setup List GET Request Failed`); }
    return res200sOK(res, req, data);
  }).catch((err) => error500sServerError(err, res, "GET Match Setup List Error"));
});

/**
 * @route   PUT api/match/v1/setup/save
 * @desc    Saves text fields from /matchup/setup page into 'Setup' object
 * @access  Private (to Admins)
 */
matchV1Routes.put('/setup/save', authenticateJWT, (req, res) => {
  const { matchId, week, teams } = req.body;

  console.log(`PUT Request Match '${matchId}' Save Setup`);
  putMatchSaveSetup(matchId, week, teams).then((response) => {
    if (!response) { return res400sClientError(res, req, `Match ID '${riotMatchId}' PUT Request Save Setup Failed`); }
    return res200sOK(res, req, response);
  }).catch((err) => error500sServerError(err, res, "PUT Match Setup Save Error."));
});

/**
 * @route   PUT api/match/v1/setup/submit
 * @desc    Saves the text fields and submits the Match Data into MySQL and DynamoDb
 * @access  Private (to Admins)
 */
matchV1Routes.put('/setup/submit', authenticateJWT, (req, res) => {
  const { matchId, week, teams } = req.body;

  console.log(`PUT Request Match '${matchId}' Setup Submit.`);
  putMatchSaveSetup(matchId, week, teams).then((saveResponse) => {
    if (!saveResponse) { return res400sClientError(res, req, `Match ID '${riotMatchId}' Save Setup Failed`); }
    submitMatchSetup(matchId).then((submitResponse) => {
      if (!submitResponse) { return res400sClientError(res, req, `Match ID '${matchId} PUT Request Submit Setup Failed`); }
      else if ('validateMessages' in submitResponse) {
        return res400sClientError(
          res, req, `Match ID '${matchId}' PUT Request Submit has invalid inputs.`, submitResponse
        );
      }
      return res200sOK(res, req, submitResponse);
    }).catch((err) => error500sServerError(err, res, "PUT Match Setup Submit Error."));
  }).catch((err) => error500sServerError(err, res, "PUT Match Setup Save Error."));
});

/**
 * Uses MySQL
 * @route   DELETE api/match/v1/remove/:matchId
 * @desc    Remove a match from Records
 * @access  Private (to Admins)
 */
matchV1Routes.delete('/remove/:matchId', authenticateJWT, (req, res) => {
  const { matchId } = req.params;

  console.log(`DELETE Request Match '${matchId}'.`);
  deleteMatchData(matchId).then((response) => {
    if (response.error) { return res400sClientError(res, req, response.error); }
    return res200sOK(res, req, response);
  }).catch((err) => error500sServerError(err, res, "DELETE Match Data Error."));
});

/**
 * Uses MySQL
 * @route   PUT api/match/v1/invalidate
 * @desc    Mark a match through DynamoDb and MySQL as invalid
 * @access  Private (to Admins)
 */
matchV1Routes.put('/invalidate', authenticateJWT, (req, res) => {
  const { matchId } = req.body;

  console.log(`PUT Request Match '${matchId} - Invalidate`);
  invalidateMatch(matchId).then((response) => {
    if (response.error) { return res400sClientError(res, req, response.error); }
    return res200sOK(res, req, response);
  }).catch((err) => error500sServerError(err, res, "DELETE Match Data Error."));
});

//#endregion

export default matchV1Routes;