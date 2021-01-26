const router = require('express').Router();

import {
    res200sOK,
    res400sClientError,
    error500sServerError,
} from './dependencies/handlers';
/*  Import helper Data function modules */
import {
    getTeamPId,
    getTeamInfo,
    getTeamScoutingBySeason,
    getTeamGamesBySeason,
    getTeamStatsByTourney,
    postNewTeam,
} from '../../functions/apiV1/teamData';
import { getSeasonId } from '../../functions/apiV1/seasonData';
import { getTournamentId } from '../../functions/apiV1/tournamentData';

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
router.get('/information/name/:teamName', async (req, res) => {
    const { teamName } = req.params;
    console.log(`GET Request Team '${teamName}' Information.`);
    getTeamPId(teamName).then((teamId) => {
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
router.get('/scouting/name/:teamName/:seasonShortName', async (req, res) => {
    const { teamName, seasonShortName } = req.params;
    console.log(`GET Request Team '${teamName}' Scouting from Season '${seasonShortName}'.`);
    getTeamPId(teamName).then((teamId) => {
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
router.get('/games/name/:teamName/:seasonShortName', async (req, res) => {
    const { teamName, seasonShortName } = req.params;
    console.log(`GET Request Team '${teamName}' Game Log from Season '${seasonShortName}'.`);
    getTeamPId(teamName).then((teamId) => {
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
router.get('/stats/name/:teamName/:tournamentName', async (req, res) => {
    const { teamName, tournamentName } = req.params;
    console.log(`GET Request Team '${teamName}' Stats Log from Tournament '${tournamentName}'.`);
    getTeamPId(teamName).then((teamId) => {
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
router.get('/scouting/latest/name/:teamName', async (req, res) => {
    const { teamName } = req.params;
    console.log(`GET Request Team '${teamName}' Scouting from the latest Season.`);
    getTeamPId(req.params.teamName).then((teamId) => {
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
router.get('/games/latest/name/:teamName', async (req, res) => {
    const { teamName } = req.params;
    console.log(`GET Request Team '${teamName}' Game Log from the latest Season.`);
    getTeamPId(teamName).then((teamId) => {
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
router.get('/stats/latest/name/:teamName', async (req, res) => {
    const { teamName } = req.params;
    console.log(`GET Request Team '${teamName}' Stats from the latest Tournament.`);
    getTeamPId(teamName).then((teamId) => {
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
router.post('/add/new', (req, res) => {
    const { teamName, shortName } = req.body;
    // Check if Team Name already exists
    getTeamPId(teamName).then((tPId) => {
        if (tPId != null) {
            // Id found in DB. Team name exists. Reject.
            res400sClientError(res, req, `Team '${teamName}' already exists under Team ID '${tPId}'`);
            return;
        }
        postNewTeam(teamName, shortName).then((data) => {
            return res200sOK(res, req, data);
        }).catch((err) => error500sServerError(err, res, "POST Team Add New Error 1"));
    }).catch((err) => error500sServerError(err, res, "POST Team Add New Error 2"));
})

//#endregion

module.exports = router;