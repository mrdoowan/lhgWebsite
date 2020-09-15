const router = require('express').Router();
const handler = require('./dependencies/handlers');

/*  Import helper Data function modules */
const Team = require('../../functions/apiV1/teamData');
const Season = require('../../functions/apiV1/seasonData');
const Tournament = require('../../functions/apiV1/tournamentData');

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
    Team.getId(teamName).then((teamId) => {
        if (teamId == null) { return handler.res400s(res, req, `Team Name '${teamName}' Not Found`); }
        Team.getInfo(teamId).then((data) => {
            return handler.res200s(res, req, data);
        }).catch((err) => handler.error500s(err, res, "GET Team Information Error."));
    }).catch((err) => handler.error500s(err, res, "GET Team ID Error."));
});

/**
 * @route   GET api/team/v1/scouting/name/:teamName/:seasonShortName
 * @desc    Get Team Scouting from specified Season
 * @access  Public
 */
router.get('/scouting/name/:teamName/:seasonShortName', async (req, res) => {
    const { teamName, seasonShortName } = req.params;
    console.log(`GET Request Team '${teamName}' Scouting from Season '${seasonShortName}'.`);
    Team.getId(teamName).then((teamId) => {
        if (teamId == null) { return handler.res400s(res, req, `Team Name '${teamName}' Not Found`); }
        Season.getId(seasonShortName).then((sPId) => {
            if (sPId == null) { return handler.res400s(res, req, `Season Name '${seasonShortName}' Not Found`); }
            Team.getScouting(teamId, sPId).then((data) => {
                if (data == null) { return handler.res400s(res, req, `'${teamName}' does not have Season '${seasonShortName}' Scouting logged`) }
                return handler.res200s(res, req, data);
            }).catch((err) => handler.error500s(err, res, "GET Team Scouting Error."));
        }).catch((err) => handler.error500s(err, res, "GET Season ID Error."));
    }).catch((err) => handler.error500s(err, res, "GET Team ID Error."));
});

/**
 * @route   GET api/team/v1/games/name/:teamName/:seasonShortName
 * @desc    Get Team Game Log from specified Season
 * @access  Public
 */
router.get('/games/name/:teamName/:seasonShortName', async (req, res) => {
    const { teamName, seasonShortName } = req.params;
    console.log(`GET Request Team '${teamName}' Game Log from Season '${seasonShortName}'.`);
    Team.getId(teamName).then((teamId) => {
        if (teamId == null) { return handler.res400s(res, req, `Team Name '${teamName}' Not Found`); }
        Season.getId(seasonShortName).then((sPId) => {
            if (sPId == null) { return handler.res400s(res, req, `Season Name '${seasonShortName}' Not Found`); }
            Team.getGames(teamId, sPId).then((data) => {
                if (data == null) { return handler.res400s(res, req, `'${teamName}' does not have Season '${seasonShortName}' Games logged`); }
                return handler.res200s(res, req, data);
            }).catch((err) => handler.error500s(err, res, "GET Team Games Error."));
        }).catch((err) => handler.error500s(err, res, "GET Season ID Error."));
    }).catch((err) => handler.error500s(err, res, "GET Team ID Error."));
});

/**
 * @route   GET api/team/v1/stats/name/:teamName/:tournamentName
 * @desc    Get Team Stats Log from specified Tournament
 * @access  Public
 */
router.get('/stats/name/:teamName/:tournamentName', async (req, res) => {
    const { teamName, tournamentName } = req.params;
    console.log(`GET Request Team '${teamName}' Stats Log from Tournament '${tournamentName}'.`);
    Team.getId(teamName).then((teamId) => {
        if (teamId == null) { return handler.res400s(res, req, `Team Name '${teamName}' Not Found`); }
        Tournament.getId(tournamentName).then((tPId) => {
            if (tPId == null) { return handler.res400s(res, req, `Tournament Name '${tournamentName}' Not Found`); }
            Team.getStats(teamId, tPId).then((data) => {
                if (data == null) { return handler.res400s(res, req, `'${teamName}' does not have Tournament '${tournamentName}' Stats logged`); }
                return handler.res200s(res, req, data);
            }).catch((err) => handler.error500s(err, res, "GET Team Stats Error."));
        }).catch((err) => handler.error500s(err, res, "GET Tournament ID Error."));
    }).catch((err) => handler.error500s(err, res, "GET Team ID Error."));
});

/**
 * @route   GET api/team/v1/scouting/name/:teamName
 * @desc    Get Team Scouting from the latest Season
 * @access  Public
 */
router.get('/scouting/latest/name/:teamName', async (req, res) => {
    const { teamName } = req.params;
    console.log(`GET Request Team '${teamName}' Scouting from the latest Season.`);
    Team.getId(req.params.teamName).then((teamId) => {
        if (teamId == null) { return handler.res400s(res, req, `Team Name '${teamName}' Not Found`); }
        Team.getScouting(teamId).then((data) => {
            return handler.res200s(res, req, data);
        }).catch((err) => handler.error500s(err, res, "GET Team Scouting Error."));
    }).catch((err) => handler.error500s(err, res, "GET Team ID Error."));
});

/**
 * @route   GET api/team/v1/games/latest/name/:teamName
 * @desc    Get Team Game Log from the latest Season
 * @access  Public
 */
router.get('/games/latest/name/:teamName', async (req, res) => {
    const { teamName } = req.params;
    console.log(`GET Request Team '${teamName}' Game Log from the latest Season.`);
    Team.getId(teamName).then((teamId) => {
        if (teamId == null) { return handler.res400s(res, req, `Team Name '${teamName}' Not Found`); }
        Team.getGames(teamId).then((data) => {
            return handler.res200s(res, req, data);
        }).catch((err) => handler.error500s(err, res, "GET Team Games Error."));
    }).catch((err) => handler.error500s(err, res, "GET Team ID Error."));
});

/**
 * @route   GET api/team/v1/stats/latest/name/:teamName
 * @desc    Get Team Stats Log from the latest Tournament
 * @access  Public
 */
router.get('/stats/latest/name/:teamName', async (req, res) => {
    const { teamName } = req.params;
    console.log(`GET Request Team '${teamName}' Stats from the latest Tournament.`);
    Team.getId(teamName).then((teamId) => {
        if (teamId == null) { return handler.res400s(res, req, `Team Name '${teamName}' Not Found`); }
        Team.getStats(teamId).then((data) => {
            return handler.res200s(res, req, data);
        }).catch((err) => handler.error500s(err, res, "GET Team Stats Error."));
    }).catch((err) => handler.error500s(err, res, "GET Team ID Error."));
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
    Team.getId(teamName).then((tPId) => {
        if (tPId != null) {
            // Id found in DB. Team name exists. Reject.
            handler.res400s(res, req, `Team '${teamName}' already exists under Team ID '${tPId}'`);
            return;
        }
        Team.postNew(teamName, shortName).then((data) => {
            return handler.res200s(res, req, data);
        }).catch((err) => handler.error500s(err, res, "POST Team Add New Error 1"));
    }).catch((err) => handler.error500s(err, res, "POST Team Add New Error 2"));
})

//#endregion

module.exports = router;