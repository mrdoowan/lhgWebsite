const profileV1Routes = require('express').Router();

import {
    res200sOK,
    res400sClientError,
    error500sServerError,
} from './dependencies/handlers';
/*  Import helper Data function modules */
import {
    getProfilePIdByName,
    getProfilePIdBySummonerId,
    getProfileName,
    getProfileInfo,
    getProfileGamesBySeason,
    getProfileStatsByTourney,
    getSummonerIdBySummonerName,
    postNewProfile,
    updateProfileInfo,
    updateProfileName,
} from './profileData';
import { getSeasonId } from '../../functions/apiV1/seasonData';
import { getTournamentId } from '../../functions/apiV1/tournamentData';

/*  
    ----------------------
    Profile API Requests
    ----------------------
*/

//#region GET REQUESTS - Profile

/**
 * @route   GET api/profile/v1/information/name/:profileName
 * @desc    Get Profile Information
 * @access  Public
 */
profileV1Routes.get('/information/name/:profileName', (req, res) => {
    const { profileName } = req.params;
    console.log(`GET Request Profile '${profileName}' Information.`);
    getProfilePIdByName(profileName).then((pPId) => {
        if (pPId == null) { return res400sClientError(res, req, `Profile Name '${profileName}' Not Found`); }
        getProfileInfo(pPId).then((data) => {
            return res200sOK(res, req, data);
        }).catch((err) => error500sServerError(err, res, "GET Profile Information Error."));
    }).catch((err) => error500sServerError(err, res, "GET Profile ID Error."));
});

/**
 * @route   GET api/profile/v1/games/name/:profileName/:seasonShortName
 * @desc    Get Profile Game Log
 * @access  Public
 */
profileV1Routes.get('/games/name/:profileName/:seasonShortName', (req, res) => {
    const { profileName, seasonShortName } = req.params;
    console.log(`GET Request Profile '${profileName}' Game Log from Season '${seasonShortName}'.`);
    getProfilePIdByName(profileName).then((pPId) => {
        if (pPId == null) { return res400sClientError(res, req, `Profile Name '${profileName}' Not Found`); }
        getSeasonId(seasonShortName).then((sPId) => {
            if (sPId == null) { return res400sClientError(res, req, `Season Shortname '${seasonShortName}' Not Found`); }
            getProfileGamesBySeason(pPId, sPId).then((data) => {
                if (data == null) { return res400sClientError(res, req, `'${profileName}' does not have the Season '${seasonShortName}' logged.`); }
                return res200sOK(res, req, data);
            }).catch((err) => error500sServerError(err, res, "GET Profile Games Error."));
        }).catch((err) => error500sServerError(err, res, "GET Season ID Error."));
    }).catch((err) => error500sServerError(err, res, "GET Profile ID Error."));
});

/**
 * @route   GET api/profile/v1/stats/name/:profileName/:tournamentShortName
 * @desc    Get Profile Stats Log
 * @access  Public
 */
profileV1Routes.get('/stats/name/:profileName/:tournamentShortName', async (req, res) => {
    const { profileName, tournamentShortName } = req.params;
    console.log(`GET Request Profile '${profileName}' Stats Log from Tournament '${tournamentShortName}'.`);
    getProfilePIdByName(profileName).then((pPId) => {
        if (pPId == null) { return res400sClientError(res, req, `Profile Name '${profileName}' Not Found`); }
        getTournamentId(tournamentShortName).then((tPId) => {
            if (tPId == null) { return res400sClientError(res, req, `Tournament Shortname '${tournamentShortName}' Not Found`); }
            getProfileStatsByTourney(pPId, tPId).then((data) => {
                if (data == null) { return res400sClientError(res, req, `'${profileName}' does not have the Season '${tournamentShortName}' logged.`); }
                return res200sOK(res, req, data);
            }).catch((err) => error500sServerError(err, res, "GET Profile Stats Error."));
        }).catch((err) => error500sServerError(err, res, "GET Tournament ID Error."));
    }).catch((err) => error500sServerError(err, res, "GET Profile ID Error."));
});

/**
 * @route   GET api/profile/v1/games/latest/name/:profileName
 * @desc    Get Profile Game Log from the latest season
 * @access  Public
 */
profileV1Routes.get('/games/latest/name/:profileName', (req, res) => {
    const { profileName } = req.params;
    console.log(`"GET Request Profile '${profileName}' Game Log from the latest Season."`);
    getProfilePIdByName(profileName).then((pPId) => {
        if (pPId == null) { return res400sClientError(res, req, `Profile Name '${profileName}' Not Found`); }
        getProfileGamesBySeason(pPId).then((data) => {
            return res200sOK(res, req, data);
        }).catch((err) => error500sServerError(err, res, "GET Profile Games Error."));
    }).catch((err) => error500sServerError(err, res, "GET Profile ID Error."));
});

/**
 * @route   GET api/profile/v1/stats/latest/name/:profileName
 * @desc    Get Profile Stats Log from the latest tournament
 * @access  Public
 */
profileV1Routes.get('/stats/latest/name/:profileName', (req, res) => {
    const { profileName } = req.params;
    console.log(`"GET Request Profile '${profileName}' Game Log from the latest Tournament"`);
    getProfilePIdByName(profileName).then((pPId) => {
        if (pPId == null) { return res400sClientError(res, req, `Profile Name '${profileName}' Not Found`); }
        getProfileStatsByTourney(pPId).then((data) => {
            return res200sOK(res, req, data);
        }).catch((err) => error500sServerError(err, res, "GET Profile Games Error."));
    }).catch((err) => error500sServerError(err, res, "GET Profile ID Error."));
});

//#endregion

//#region POST / PUT REQUESTS - Profile

/**
 * @route   POST api/profile/v1/add/new
 * @desc    Add new Profile with primary summoner account
 * @access  Private (to Admins)
 */
profileV1Routes.post('/add/new', (req, res) => {
    const { profileName, summonerName } = req.body;
    // Check if the IGN exists. 
    getSummonerIdBySummonerName(summonerName).then((summId) => {
        if (summId == null) {
            // Summoner Id does not exist
            return res400sClientError(res, req, `Summoner Name '${summonerName}' does not exist.`);
        }
        // Check if summoner Name has its ID already registered. 
        getProfilePIdBySummonerId(summId).then((pPId) => {
            if (pPId != null) {
                // Profile Id Found in DB. That means Profile name exists with Summoner. Reject.
                getProfileName(pPId, false).then((pName) => {
                    return res400sClientError(res, req, `Summoner Name '${summonerName}' already registered under Profile Name '${pName}' and ID '${pPId}'`);
                }).catch((err) => error500sServerError(err, res, "GET Profile Name Error."));
                return;
            }
            // New Summoner Id found.
            // Check if Profile name already exists.
            getProfilePIdByName(profileName).then((pPId) => {
                if (pPId != null) {
                    // Id Found in DB. That means Profile name exists. Reject.
                    return res400sClientError(res, req, `Profile '${profileName}' already exists under Profile ID '${pPId}'`);
                }
                // Make new Profile
                postNewProfile(profileName, summId).then((data) => {
                    return res200sOK(res, req, data);
                }).catch((err) => error500sServerError(err, res, "POST Profile Add New Error 1."));
            }).catch((err) => error500sServerError(err, res, "POST Profile Add New Error 3."));
        }).catch((err) => error500sServerError(err, res, "POST Profile Add New Error 4."));
    });
});

/**
 * @route   PUT api/profile/v1/add/account
 * @desc    Add a Summoner account to the Profile
 * @access  Private (to Admins)
 */
profileV1Routes.put('/add/account', (req, res) => {
    const { profileName, summonerName } = req.body;
    // Check if the IGN exists (Riot API call)
    getSummonerIdBySummonerName(summonerName).then((summId) => {
        if (summId == null) {
            // Summoner Id does not exist
            return res400sClientError(res, req, `Summoner Name '${summonerName}' does not exist.`);
        }
        getProfilePIdBySummonerId(summId).then((profileIdExist) => {
            if (profileIdExist != null) {
                // Profile Id Found in DB. That means Profile name exists with Summoner. Reject.
                getProfileName(profileIdExist, false).then((pName) => {
                    return res400sClientError(res, req, `Summoner Name '${summonerName}' already registered under Profile Name '${pName}' and ID '${profileIdExist}'`);
                }).catch((err) => error500sServerError(err, res, "PUT Profile Info Error 1."));
                return;
            }
            // Check if Profile Name exists
            getProfilePIdByName(profileName).then((pPId) => {
                if (pPId == null) {
                    // Profile does not exist
                    return res400sClientError(res, req, `Profile '${profileName}' does not exist.`);
                }
                // Get Profile Information
                getProfileInfo(pPId).then((infoData) => {
                    infoData['LeagueAccounts'][summId] = { 'MainAccount': false };
                    updateProfileInfo(pPId, summId, infoData).then((data) => {
                        return res200sOK(res, req, data);
                    }).catch((err) => error500sServerError(err, res, "PUT Profile Info Error 2."));
                }).catch((err) => error500sServerError(err, res, "PUT Profile Info Error 3."));
            }).catch((err) => error500sServerError(err, res, "PUT Profile Info Error 4."));
        }).catch((err) => error500sServerError(err, res, "PUT Profile Info Error 5."));
    }).catch((err) => error500sServerError(err, res, "PUT Profile Info Error 6."));
})

/**
 * @route   PUT api/profile/v1/remove/account
 * @desc    Remove a Summoner account from the profile
 * @access  Private (to Admins)
 */
// Remove summoner account from Profile.
// BODY EXAMPLE:
// {
//     "profileName": "NAME",
//     "summonerId": "SUMM_ID",
// }
profileV1Routes.put('/remove/account', (req, res) => {

})

/**
 * @route   PUT api/profile/v1/update/name
 * @desc    Change profile Name
 * @access  Private (to Admins)
 */
profileV1Routes.put('/update/name', (req, res) => {
    const { currentName, newName } = req.body;
    // Check if currentName and newName exist
    getProfilePIdByName(currentName).then((profileId) => {
        if (profileId == null) {
            // Profile Name does not exist
            return res400sClientError(res, req, `Profile '${currentName}' does not exist.`);
        }
        getProfilePIdByName(newName).then((checkId) => {
            if (checkId != null) {
                // New name already exists in Db
                return res400sClientError(res, req, `New profile name '${newName}' is already taken!`);
            }
            updateProfileName(profileId, newName, currentName).then((data) => {
                return res200sOK(res, req, data);
            }).catch((err) => error500sServerError(err, res, "PUT Profile Name Change Error 1."));
        }).catch((err) => error500sServerError(err, res, "PUT Profile Name Change Error 2."));
    }).catch((err) => error500sServerError(err, res, "PUT Profile Name Change Error 3."))
})

//#endregion

export const profileV1Routes;