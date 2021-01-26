const seasonV1Routes = require('express').Router();

import {
    res200sOK,
    res400sClientError,
    error500sServerError,
} from './dependencies/handlers';
/*  Import helper Data function modules */
import {
    getSeasonId,
    getSeasonInformation,
    getSeasonRoster,
    getRegularSeason,
    getSeasonPlayoffs,
} from '../../functions/apiV1/seasonData';

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
seasonV1Routes.get('/information/name/:seasonShortName', (req, res) => {
    const { seasonShortName } = req.params;
    console.log(`GET Request Season '${seasonShortName}' Information.`);
    getSeasonId(seasonShortName).then((sPId) => {
        if (sPId == null) { return res400sClientError(res, req, `Season Name '${seasonShortName}' Not Found`); }
        getSeasonInformation(sPId).then((data) => {
            return res200sOK(res, req, data);
        }).catch((err) => error500sServerError(err, res, "GET Season Information Error."));
    }).catch((err) => error500sServerError(err, res, "GET Season ID Error."));
});

/**
 * @route   GET api/season/v1/roster/name/:seasonShortName
 * @desc    Get complete Roster list of the League's season
 * @access  Public
 */
seasonV1Routes.get('/roster/name/:seasonShortName', (req, res) => {
    const { seasonShortName } = req.params;
    console.log(`GET Request Season '${seasonShortName}' Roster.`);
    getSeasonId(seasonShortName).then((sPId) => {
        if (sPId == null) { return res400sClientError(res, req, `Season Name '${seasonShortName}' Not Found`); }
        getSeasonRoster(sPId).then((data) => {
            return res200sOK(res, req, data);
        }).catch((err) => error500sServerError(err, res, "GET Season Information Error."));
    }).catch((err) => error500sServerError(err, res, "GET Season ID Error."));
});

/**
 * @route   GET api/season/v1/regular/name/:seasonShortName
 * @desc    Get regular season matches and schedule
 * @access  Public
 */
seasonV1Routes.get('/regular/name/:seasonShortName', (req, res) => {
    const { seasonShortName } = req.params;
    console.log(`"GET Request Season '${seasonShortName}' Regular."`);
    getSeasonId(seasonShortName).then((sPId) => {
        if (sPId == null) { return res400sClientError(res, req, `Season Name '${seasonShortName}' Not Found`); }
        getRegularSeason(sPId).then((data) => {
            return res200sOK(res, req, data);
        }).catch((err) => error500sServerError(err, res, "GET Season Information Error."));
    }).catch((err) => error500sServerError(err, res, "GET Season ID Error."));
});

/**
 * @route   GET api/season/v1/playoffs/name/:seasonShortName
 * @desc    Get playoff bracket, matches, and schedule
 * @access  Public
 */
seasonV1Routes.get('/playoffs/name/:seasonShortName', (req, res) => {
    const { seasonShortName } = req.params;
    console.log(`"GET Request Season '${seasonShortName}' Regular."`);
    getSeasonId(seasonShortName).then((sPId) => {
        if (sPId == null) { return res400sClientError(res, req, `Season Name '${seasonShortName}' Not Found`); }
        getSeasonPlayoffs(sPId).then((data) => {
            return res200sOK(res, req, data);
        }).catch((err) => error500sServerError(err, res, "GET Season Information Error."));
    }).catch((err) => error500sServerError(err, res, "GET Season ID Error."));
});

//#endregion

export const seasonV1Routes;