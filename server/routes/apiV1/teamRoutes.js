const teamV1Routes = require('express').Router();

import {
  res200sOK,
  res400sClientError,
  error500sServerError,
} from './dependencies/handlers';
/*  Import helper Data function modules */
import {
  getTeamPIdByName,
  getTeamInfo,
  getTeamScoutingBySeason,
  getTeamGamesBySeason,
  getTeamStatsByTourney,
  postNewTeam,
  updateTeamName,
} from '../../functions/apiV1/teamData';
import { getSeasonId } from '../../functions/apiV1/seasonData';
import { getTournamentId } from '../../functions/apiV1/tournamentData';
import { authenticateJWT } from './dependencies/jwtHelper';

/*  
    ----------------------
    Team API Requests
    ----------------------
*/

//#region GET Requests - Team

/**
 * @route   GET api/team/v1/information/name/:teamName
 * @desc    Get Team Information
 * @access  Public
 */
teamV1Routes.get('/information/name/:teamName', (req, res) => {
  const { teamName } = req.params;
  console.log(`GET Request Team '${teamName}' Information.`);
  getTeamPIdByName(teamName).then((teamId) => {
    if (teamId == null) { return res400sClientError(res, req, `Team Name '${teamName}' Not Found`); }
    getTeamInfo(teamId).then((data) => {
      return res200sOK(res, req, data);
    }).catch((err) => error500sServerError(err, res, "GET Team Information Error."));
  }).catch((err) => error500sServerError(err, res, "GET Team ID Error."));
});

/**
 * @route   GET api/team/v1/scouting/name/:teamName/:seasonShortName
 * @desc    Get Team Scouting from specified Season
 * @access  Public
 */
teamV1Routes.get('/scouting/name/:teamName/:seasonShortName', (req, res) => {
  const { teamName, seasonShortName } = req.params;
  console.log(`GET Request Team '${teamName}' Scouting from Season '${seasonShortName}'.`);
  getTeamPIdByName(teamName).then((teamId) => {
    if (teamId == null) { return res400sClientError(res, req, `Team Name '${teamName}' Not Found`); }
    getSeasonId(seasonShortName).then((sPId) => {
      if (sPId == null) { return res400sClientError(res, req, `Season Name '${seasonShortName}' Not Found`); }
      getTeamScoutingBySeason(teamId, sPId).then((data) => {
        if (data == null) { return res400sClientError(res, req, `'${teamName}' does not have Season '${seasonShortName}' Scouting logged`) }
        return res200sOK(res, req, data);
      }).catch((err) => error500sServerError(err, res, "GET Team Scouting Error."));
    }).catch((err) => error500sServerError(err, res, "GET Season ID Error."));
  }).catch((err) => error500sServerError(err, res, "GET Team ID Error."));
});

/**
 * @route   GET api/team/v1/games/name/:teamName/:seasonShortName
 * @desc    Get Team Game Log from specified Season
 * @access  Public
 */
teamV1Routes.get('/games/name/:teamName/:seasonShortName', (req, res) => {
  const { teamName, seasonShortName } = req.params;
  console.log(`GET Request Team '${teamName}' Game Log from Season '${seasonShortName}'.`);
  getTeamPIdByName(teamName).then((teamId) => {
    if (teamId == null) { return res400sClientError(res, req, `Team Name '${teamName}' Not Found`); }
    getSeasonId(seasonShortName).then((sPId) => {
      if (sPId == null) { return res400sClientError(res, req, `Season Name '${seasonShortName}' Not Found`); }
      getTeamGamesBySeason(teamId, sPId).then((data) => {
        if (data == null) { return res400sClientError(res, req, `'${teamName}' does not have Season '${seasonShortName}' Games logged`); }
        return res200sOK(res, req, data);
      }).catch((err) => error500sServerError(err, res, "GET Team Games Error."));
    }).catch((err) => error500sServerError(err, res, "GET Season ID Error."));
  }).catch((err) => error500sServerError(err, res, "GET Team ID Error."));
});

/**
 * @route   GET api/team/v1/stats/name/:teamName/:tournamentName
 * @desc    Get Team Stats Log from specified Tournament
 * @access  Public
 */
teamV1Routes.get('/stats/name/:teamName/:tournamentName', (req, res) => {
  const { teamName, tournamentName } = req.params;
  console.log(`GET Request Team '${teamName}' Stats Log from Tournament '${tournamentName}'.`);
  getTeamPIdByName(teamName).then((teamId) => {
    if (teamId == null) { return res400sClientError(res, req, `Team Name '${teamName}' Not Found`); }
    getTournamentId(tournamentName).then((tPId) => {
      if (tPId == null) { return res400sClientError(res, req, `Tournament Name '${tournamentName}' Not Found`); }
      getTeamStatsByTourney(teamId, tPId).then((data) => {
        if (data == null) { return res400sClientError(res, req, `'${teamName}' does not have Tournament '${tournamentName}' Stats logged`); }
        return res200sOK(res, req, data);
      }).catch((err) => error500sServerError(err, res, "GET Team Stats Error."));
    }).catch((err) => error500sServerError(err, res, "GET Tournament ID Error."));
  }).catch((err) => error500sServerError(err, res, "GET Team ID Error."));
});

/**
 * @route   GET api/team/v1/scouting/name/:teamName
 * @desc    Get Team Scouting from the latest Season
 * @access  Public
 */
teamV1Routes.get('/scouting/latest/name/:teamName', (req, res) => {
  const { teamName } = req.params;
  console.log(`GET Request Team '${teamName}' Scouting from the latest Season.`);
  getTeamPIdByName(req.params.teamName).then((teamId) => {
    if (teamId == null) { return res400sClientError(res, req, `Team Name '${teamName}' Not Found`); }
    getTeamScoutingBySeason(teamId).then((data) => {
      return res200sOK(res, req, data);
    }).catch((err) => error500sServerError(err, res, "GET Team Scouting Error."));
  }).catch((err) => error500sServerError(err, res, "GET Team ID Error."));
});

/**
 * @route   GET api/team/v1/games/latest/name/:teamName
 * @desc    Get Team Game Log from the latest Season
 * @access  Public
 */
teamV1Routes.get('/games/latest/name/:teamName', (req, res) => {
  const { teamName } = req.params;
  console.log(`GET Request Team '${teamName}' Game Log from the latest Season.`);
  getTeamPIdByName(teamName).then((teamId) => {
    if (teamId == null) { return res400sClientError(res, req, `Team Name '${teamName}' Not Found`); }
    getTeamGamesBySeason(teamId).then((data) => {
      return res200sOK(res, req, data);
    }).catch((err) => error500sServerError(err, res, "GET Team Games Error."));
  }).catch((err) => error500sServerError(err, res, "GET Team ID Error."));
});

/**
 * @route   GET api/team/v1/stats/latest/name/:teamName
 * @desc    Get Team Stats Log from the latest Tournament
 * @access  Public
 */
teamV1Routes.get('/stats/latest/name/:teamName', (req, res) => {
  const { teamName } = req.params;
  console.log(`GET Request Team '${teamName}' Stats from the latest Tournament.`);
  getTeamPIdByName(teamName).then((teamId) => {
    if (teamId == null) { return res400sClientError(res, req, `Team Name '${teamName}' Not Found`); }
    getTeamStatsByTourney(teamId).then((data) => {
      return res200sOK(res, req, data);
    }).catch((err) => error500sServerError(err, res, "GET Team Stats Error."));
  }).catch((err) => error500sServerError(err, res, "GET Team ID Error."));
});

//#endregion

//#region POST / PUT REQUESTS - Team

/**
 * @route   POST api/team/v1/add/new
 * @desc    Add new Team Name
 * @access  Private (to Admins)
 */
teamV1Routes.post('/add/new', authenticateJWT, (req, res) => {
  const { teamName, shortName } = req.body;
  // Check if Team Name already exists
  getTeamPIdByName(teamName).then((tPId) => {
    if (tPId != null) {
      // Id found in DB. Team name exists. Reject.
      res400sClientError(res, req, `Team '${teamName}' already exists under Team ID '${tPId}'`);
      return;
    }
    postNewTeam(teamName, shortName).then((data) => {
      return res200sOK(res, req, data);
    }).catch((err) => error500sServerError(err, res, "POST Team Add New Error 1"));
  }).catch((err) => error500sServerError(err, res, "POST Team Add New Error 2"));
});

/**
 * @route   PUT api/team/v1/update/name
 * @desc    Change Team Name
 * @access  Private (to Admins)
 */
teamV1Routes.put('/update/name', authenticateJWT, (req, res) => {
  const { currentName, newName } = req.body;
  console.log(`PUT Request Team '${currentName} - Changing Name to '${newName}'`);

  // Check if currentName and newName exist
  getTeamPIdByName(currentName).then((teamPId) => {
    if (!teamPId) {
      // Team Name does not exist
      return res400sClientError(res, req, `Team '${currentName}' does not exist.`);
    }
    getTeamPIdByName(newName).then((checkTeamPId) => {
      if (checkTeamPId) {
        // New name already exists in Db
        return res400sClientError(res, req, `New Team name '${newName}' is already taken!`);
      }
      updateTeamName(teamPId, newName, currentName).then((data) => {
        return res200sOK(res, req, data);
      }).catch((err) => error500sServerError(err, res, "PUT Team Name Change - Update Function Error."));
    }).catch((err) => error500sServerError(err, res, "PUT Team Name Change - Get Team PId NewName Error."));
  }).catch((err) => error500sServerError(err, res, "PUT Team Name Change - Get Team PId OldName Error."));
});

//#endregion

export default teamV1Routes;