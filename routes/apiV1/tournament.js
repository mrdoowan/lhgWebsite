const Router = require('express');
const router = Router();
const handler = require('../../functions/handlers');

/*  Import helper Data function modules */
const Tournament = require('../../functions/tournamentData');

/*  
    ----------------------
    Tournament API Requests
    ----------------------
*/

//#region GET Requests - Tournament

/**
 * @route   GET api/tournament/v1/information/name/:tournamentShortName
 * @desc    Get Tournament Information
 * @access  Public
 */
router.get('/information/name/:tournamentShortName', async (req, res) => {
    const { tournamentShortName } = req.params;
    console.log("GET Request Tournament '" + tournamentShortName + "' Information.");
    Tournament.getId(tournamentShortName).then((tPId) => {
        if (tPId == null) { return handler.res400s(res, req, `Tournament Name '${tournamentShortName}' Not Found`); }
        Tournament.getInfo(tPId).then((data) => {
            return handler.res200s(res, req, data);
        }).catch((err) => handler.error500s(err, res, "GET Tourney Information Error."));
    }).catch((err) => handler.error500s(err, res, "GET Tourney ID Error."));
});

/**
 * @route   GET api/tournament/v1/information/name/:tournamentShortName
 * @desc    Get Tournament Stats (Basic)
 * @access  Public
 */
router.get('/stats/name/:tournamentShortName', async (req, res) => {
    const { tournamentShortName } = req.params;
    console.log("GET Request Tournament '" + tournamentShortName + "' Tourney Stats.");
    Tournament.getId(tournamentShortName).then((tPId) => {
        if (tPId == null) { return handler.res400s(res, req, `Tournament Name '${tournamentShortName}' Not Found`); }
        Tournament.getTourneyStats(tPId).then((data) => {
            return handler.res200s(res, req, data);
        }).catch((err) => handler.error500s(err, res, "GET Tourney Information Error."));
    }).catch((err) => handler.error500s(err, res, "GET Tourney ID Error."));
});

/**
 * @route   GET api/tournament/v1/information/name/:tournamentShortName
 * @desc    Get Tournament Leaderboard information
 * @access  Public
 */
router.get('/leaderboards/name/:tournamentShortName', async (req, res) => {
    const { tournamentShortName } = req.params;
    console.log("GET Request Tournament '" + tournamentShortName + "' Leaderboards.");
    Tournament.getId(tournamentShortName).then((tPId) => {
        if (tPId == null) { return handler.res400s(res, req, `Tournament Name '${tournamentShortName}' Not Found`); }
        Tournament.getLeaderboards(tPId).then((data) => {
            return handler.res200s(res, req, data);
        }).catch((err) => handler.error500s(err, res, "GET Tourney Leaderboard Error."));
    }).catch((err) => handler.error500s(err, res, "GET Tourney ID Error."));
});

/**
 * @route   GET api/tournament/v1/information/name/:tournamentShortName
 * @desc    Get Tournament Player Stats
 * @access  Public
 */
router.get('/players/name/:tournamentShortName', async (req, res) => {
    const { tournamentShortName } = req.params;
    console.log("GET Request Tournament '" + tournamentShortName + "' Players.");
    Tournament.getId(tournamentShortName).then((tPId) => {
        if (tPId == null) { return handler.res400s(res, req, `Tournament Name '${tournamentShortName}' Not Found`); }
        Tournament.getPlayerStats(tPId).then((data) => {
            return handler.res200s(res, req, data);
        }).catch((err) => handler.error500s(err, res, "GET Tourney Players Error."));
    }).catch((err) => handler.error500s(err, res, "GET Tourney ID Error."));
});

/**
 * @route   GET api/tournament/v1/information/name/:tournamentShortName
 * @desc    Get Tournament Team Stats
 * @access  Public
 */
router.get('/teams/name/:tournamentShortName', async (req, res) => {
    const { tournamentShortName } = req.params;
    console.log("GET Request Tournament '" + tournamentShortName + "' Teams.");
    Tournament.getId(tournamentShortName).then((tPId) => {
        if (tPId == null) { return handler.res400s(res, req, `Tournament Name '${tournamentShortName}' Not Found`); }
        Tournament.getTeamStats(tPId).then((data) => {
            return handler.res200s(res, req, data);
        }).catch((err) => handler.error500s(err, res, "GET Tourney Teams Error."));
    }).catch((err) => handler.error500s(err, res, "GET Tourney ID Error."));
});

/**
 * @route   GET api/tournament/v1/information/name/:tournamentShortName
 * @desc    Get Tournament Pick Ban Data
 * @access  Public
 */
router.get('/pickbans/name/:tournamentShortName', async (req, res) => {
    const { tournamentShortName } = req.params;
    console.log("GET Request Tournament '" + tournamentShortName + "' Pick Bans.");
    Tournament.getId(tournamentShortName).then((tPId) => {
        if (tPId == null) { return handler.res400s(res, req, `Tournament Name '${tournamentShortName}' Not Found`); }
        Tournament.getPBStats(tPId).then((data) => {
            return handler.res200s(res, req, data);
        }).catch((err) => handler.error500s(err, res, "GET Tourney Pick Bans Error."));
    }).catch((err) => handler.error500s(err, res, "GET Tourney ID Error."));
});

/**
 * @route   GET api/tournament/v1/information/name/:tournamentShortName
 * @desc    Get Tournament List of Games Played
 * @access  Public
 */
router.get('/games/name/:tournamentShortName', async (req, res) => {
    const { tournamentShortName } = req.params;
    console.log("GET Request Tournament '" + tournamentShortName + "' Game Log.");
    Tournament.getId(tournamentShortName).then((tPId) => {
        if (tPId == null) { return handler.res400s(res, req, `Tournament Name '${tournamentShortName}' Not Found`); }
        Tournament.getGames(tPId).then((data) => {
            return handler.res200s(res, req, data);
        }).catch((err) => handler.error500s(err, res, "GET Tourney Games Error."));
    }).catch((err) => handler.error500s(err, res, "GET Tourney ID Error."));
});

//#endregion

module.exports = router;