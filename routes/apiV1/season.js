const router = require('express').Router();
const handler = require('../../functions/handlers');

/*  Import helper Data function modules */
const Season = require('../../functions/seasonData');

/*  
    ----------------------
    Season API Requests
    ----------------------
*/

//#region GET Requests - Season

/**
 * @route   GET api/season/v1/information/name/:seasonShortName
 * @desc    List all the Leagues in LHG
 * @access  Public
 */
router.get('/information/name/:seasonShortName', (req, res) => {
    const { seasonShortName } = req.params;
    console.log(`GET Request Season '${seasonShortName}' Information.`);
    Season.getId(seasonShortName).then((sPId) => {
        if (sPId == null) { return handler.res400s(res, req, `Season Name '${seasonShortName}' Not Found`); }
        Season.getInfo(sPId).then((data) => {
            return handler.res200s(res, req, data);
        }).catch((err) => handler.error500s(err, res, "GET Season Information Error."));
    }).catch((err) => handler.error500s(err, res, "GET Season ID Error."));
});

/**
 * @route   GET api/season/v1/roster/name/:seasonShortName
 * @desc    Get complete Roster list of the League's season
 * @access  Public
 */
router.get('/roster/name/:seasonShortName', (req, res) => {
    const { seasonShortName } = req.params;
    console.log(`GET Request Season '${seasonShortName}' Roster.`);
    Season.getId(seasonShortName).then((sPId) => {
        if (sPId == null) { return handler.res400s(res, req, `Season Name '${seasonShortName}' Not Found`); }
        Season.getRoster(sPId).then((data) => {
            return handler.res200s(res, req, data);
        }).catch((err) => handler.error500s(err, res, "GET Season Information Error."));
    }).catch((err) => handler.error500s(err, res, "GET Season ID Error."));
});

/**
 * @route   GET api/season/v1/regular/name/:seasonShortName
 * @desc    Get regular season matches and schedule
 * @access  Public
 */
router.get('/regular/name/:seasonShortName', (req, res) => {
    const { seasonShortName } = req.params;
    console.log(`"GET Request Season '${seasonShortName}' Regular."`);
    Season.getId(seasonShortName).then((sPId) => {
        if (sPId == null) { return handler.res400s(res, req, `Season Name '${seasonShortName}' Not Found`); }
        Season.getRegular(sPId).then((data) => {
            return handler.res200s(res, req, data);
        }).catch((err) => handler.error500s(err, res, "GET Season Information Error."));
    }).catch((err) => handler.error500s(err, res, "GET Season ID Error."));
});

/**
 * @route   GET api/season/v1/playoffs/name/:seasonShortName
 * @desc    Get playoff bracket, matches, and schedule
 * @access  Public
 */
router.get('/playoffs/name/:seasonShortName', (req, res) => {
    const { seasonShortName } = req.params;
    console.log(`"GET Request Season '${seasonShortName}' Regular."`);
    Season.getId(seasonShortName).then((sPId) => {
        if (sPId == null) { return handler.res400s(res, req, `Season Name '${seasonShortName}' Not Found`); }
        Season.getPlayoffs(sPId).then((data) => {
            return handler.res200s(res, req, data);
        }).catch((err) => handler.error500s(err, res, "GET Season Information Error."));
    }).catch((err) => handler.error500s(err, res, "GET Season ID Error."));
});

//#endregion

module.exports = router;