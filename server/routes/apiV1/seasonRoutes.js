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
    getSeasonRosterById,
    getSeasonRegular,
    getSeasonPlayoffs,
    putSeasonRosterTeams,
    putSeasonRosterProfiles,
    getSeasonRosterByName,
    removeProfileFromRoster,
} from '../../functions/apiV1/seasonData';
import { 
    getTeamPIdByName, 
    getTeamPIdListFromNames
} from '../../functions/apiV1/teamData';
import { getProfilePIdByName, getProfilePIdsFromList } from '../../functions/apiV1/profileData';
import { authenticateJWT } from './dependencies/jwtHelper';

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
    getSeasonId(seasonShortName).then((seasonId) => {
        if (!seasonId) { return res400sClientError(res, req, `Season Name '${seasonShortName}' Not Found`); }
        getSeasonInformation(seasonId).then((data) => {
            return res200sOK(res, req, data);
        }).catch((err) => error500sServerError(err, res, "GET Season Information Error."));
    }).catch((err) => error500sServerError(err, res, "GET Season ID Error."));
});

/**
 * @route   GET api/season/v1/roster/id/:seasonShortName
 * @desc    Get complete Roster list of the League's season
 * @access  Public
 */
seasonV1Routes.get('/roster/id/:seasonShortName', (req, res) => {
    const { seasonShortName } = req.params;

    console.log(`GET Request Season '${seasonShortName}' Roster by IDs.`);
    getSeasonId(seasonShortName).then((seasonId) => {
        if (!seasonId) { return res400sClientError(res, req, `Season Name '${seasonShortName}' Not Found`); }
        getSeasonRosterById(seasonId).then((data) => {
            if (!data) { return res400sClientError(res, req, `Season '${seasonShortName}' Roster does not exist.`); }
            return res200sOK(res, req, data);
        }).catch((err) => error500sServerError(err, res, "GET Season Rosters by IDs Error."));
    }).catch((err) => error500sServerError(err, res, "GET Season ID Error."));
});

/**
 * @route   GET api/season/v1/roster/name/:seasonShortName
 * @desc    Get complete Roster list of the League's season
 * @access  Public
 */
seasonV1Routes.get('/roster/name/:seasonShortName', (req, res) => {
    const { seasonShortName } = req.params;

    console.log(`GET Request Season '${seasonShortName}' Roster by Names.`);
    getSeasonId(seasonShortName).then((seasonId) => {
        if (!seasonId) { return res400sClientError(res, req, `Season Name '${seasonShortName}' Not Found`); }
        getSeasonRosterByName(seasonId).then((data) => {
            if (!data) { return res400sClientError(res, req, `Season '${seasonShortName}' Roster does not exist.`); }
            return res200sOK(res, req, data);
        }).catch((err) => error500sServerError(err, res, "GET Season Rosters by Names Error."));
    }).catch((err) => error500sServerError(err, res, "GET Season ID Error."));
});

/**
 * @route   GET api/season/v1/regular/name/:seasonShortName
 * @desc    Get regular season matches and schedule
 * @access  Public
 */
seasonV1Routes.get('/regular/name/:seasonShortName', (req, res) => {
    const { seasonShortName } = req.params;

    console.log(`GET Request Season '${seasonShortName}' Regular.`);
    getSeasonId(seasonShortName).then((seasonId) => {
        if (!seasonId) { return res400sClientError(res, req, `Season Name '${seasonShortName}' Not Found`); }
        getSeasonRegular(seasonId).then((data) => {
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
    console.log(`GET Request Season '${seasonShortName}' Playoffs.`);

    getSeasonId(seasonShortName).then((seasonId) => {
        if (!seasonId) { return res400sClientError(res, req, `Season Name '${seasonShortName}' Not Found`); }
        getSeasonPlayoffs(seasonId).then((data) => {
            return res200sOK(res, req, data);
        }).catch((err) => error500sServerError(err, res, "GET Season Information Error."));
    }).catch((err) => error500sServerError(err, res, "GET Season ID Error."));
});

//#endregion

//#region PUT Requests - Season

/**
 * @route   PUT api/season/v1/roster/team/add
 * @desc    Adds a Team into the Season's roster
 * @access  Private
 */
seasonV1Routes.put('/roster/team/add', authenticateJWT, (req, res) => {
    const { teamNameList, seasonShortName } = req.body;

    console.log(`PUT Request Adding Teams in Season '${seasonShortName}'.`);
    // Filter out empty strings
    const filteredTeamNameList = teamNameList.filter(name => name !== '');
    getSeasonId(seasonShortName).then((seasonId) => {
        if (!seasonId) { return res400sClientError(res, req, `Season '${seasonShortName}' Not Found`); }
        getTeamPIdListFromNames(filteredTeamNameList).then((teamPIdListResponse) => {
            if (teamPIdListResponse.errorList) {
                return res400sClientError(res, req, `Error in getting TeamPIds from list`, teamPIdListResponse.errorList);
            }
            const teamPIdList = teamPIdListResponse.data;
            putSeasonRosterTeams(seasonId, teamPIdList).then((data) => {
                if (data.errorList) { 
                    return res400sClientError(res, req, `Error in adding Teams into the database`, data.errorList);
                }
                return res200sOK(res, req, data);
            }).catch((err) => error500sServerError(err, res, "PUT Teams in Season Roster Error."));
        }).catch((err) => error500sServerError(err, res, "GET Team PId from List Error."));
    }).catch((err) => error500sServerError(err, res, "GET Season ID Error."));
});

/**
 * @route   PUT api/season/v1/roster/profile/add
 * @desc    Adds a Profile into a specified Team in the Season
 * @access  Private
 */
seasonV1Routes.put('/roster/profile/add', authenticateJWT, (req, res) => {
    const { profileNameList, teamName, seasonShortName } = req.body;

    console.log(`PUT Request Adding Profiles to Team '${teamName}' in Season '${seasonShortName}'.`);
    // Filter out empty strings
    const filteredProfileNameList = profileNameList.filter(name => name !== '');
    getSeasonId(seasonShortName).then((seasonId) => {
        if (!seasonId) { return res400sClientError(res, req, `Season Name '${seasonShortName}' Not Found`); }
        getTeamPIdByName(teamName).then((teamPId) => {
            if (!teamPId) { return res400sClientError(res, req, `Team Name '${teamName}' Not Found`); }
            getProfilePIdsFromList(filteredProfileNameList).then((profilePIdsResponse) => {
                if (profilePIdsResponse.errorList) {
                    return res400sClientError(res, req, `Error in getting ProfilePIds from list`, profilePIdsResponse.errorList);
                }
                const profilePIdList = profilePIdsResponse.data;
                putSeasonRosterProfiles(seasonId, teamPId, profilePIdList).then((data) => {
                    if (data.errorList) {
                        return res400sClientError(res, req, `Error in adding Profiles into the database`, data.errorList);
                    }
                    return res200sOK(res, req, data);
                }).catch((err) => error500sServerError(err, res, "PUT Profile in Season Roster Error."));
            }).catch((err) => error500sServerError(err, res, "GET Profile PId Error."));
        }).catch((err) => error500sServerError(err, res, "GET Team PId Error."));
    }).catch((err) => error500sServerError(err, res, "GET Season ID Error."));
});

/**
 * @route   PUT api/season/v1/roster/profile/remove
 * @desc    Remove a Profile in the Season
 * @access  Private
 */
seasonV1Routes.put('/roster/profile/remove', authenticateJWT, (req, res) => {
    const { profileNameList, teamName, seasonShortName } = req.body;

    console.log(`PUT Request Removing Profiles from Team '${teamName}' in Season '${seasonShortName}'.`);
    const filteredProfileNameList = profileNameList.filter(name => name !== '');
    getSeasonId(seasonShortName).then((seasonId) => {
        if (!seasonId) { return res400sClientError(res, req, `Season Name '${seasonShortName}' Not Found`); }
        getTeamPIdByName(teamName).then((teamPId) => {
            if (!teamPId) { return res400sClientError(res, req, `Team Name '${teamName}' Not Found`); }
            getProfilePIdsFromList(filteredProfileNameList).then((profilePIdsResponse) => {
                if (profilePIdsResponse.errorList) {
                    return res400sClientError(res, req, `Error in getting ProfilePIds from list`, profilePIdsResponse.errorList);
                }
                const profilePIdList = profilePIdsResponse.data;
                removeProfileFromRoster(seasonId, teamPId, profilePIdList).then((data) => {
                    if (data.error) {
                        return res400sClientError(res, req, `Error in removing Profiles from the database`, data.error);
                    }
                    return res200sOK(res, req, data);
                }).catch((err) => error500sServerError(err, res, "PUT Remove Profile from Season Roster Error."));
            });
        });
    })
});

//#endregion

export default seasonV1Routes;