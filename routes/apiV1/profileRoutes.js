const router = require('express').Router();
const handler = require('./dependencies/handlers');

/*  Import helper Data function modules */
const Profile = require('../../functions/apiV1/profileData');
const Season = require('../../functions/apiV1/seasonData');
const Tournament = require('../../functions/apiV1/tournamentData');

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
router.get('/information/name/:profileName', (req, res) => {
    const { profileName } = req.params;
    console.log(`GET Request Profile '${profileName}' Information.`);
    Profile.getIdByName(profileName).then((pPId) => {
        if (pPId == null) { return handler.res400s(res, req, `Profile Name '${profileName}' Not Found`); }
        Profile.getInfo(pPId).then((data) => {
            return handler.res200s(res, req, data);
        }).catch((err) => handler.error500s(err, res, "GET Profile Information Error."));
    }).catch((err) => handler.error500s(err, res, "GET Profile ID Error."));
});

/**
 * @route   GET api/profile/v1/games/name/:profileName/:seasonShortName
 * @desc    Get Profile Game Log
 * @access  Public
 */
router.get('/games/name/:profileName/:seasonShortName', (req, res) => {
    const { profileName, seasonShortName } = req.params;
    console.log(`GET Request Profile '${profileName}' Game Log from Season '${seasonShortName}'.`);
    Profile.getIdByName(profileName).then((pPId) => {
        if (pPId == null) { return handler.res400s(res, req, `Profile Name '${profileName}' Not Found`); }
        Season.getId(seasonShortName).then((sPId) => {
            if (sPId == null) { return handler.res400s(res, req, `Season Shortname '${seasonShortName}' Not Found`); }
            Profile.getGames(pPId, sPId).then((data) => {
                if (data == null) { return handler.res400s(res, req, `'${profileName}' does not have the Season '${seasonShortName}' logged.`); }
                return handler.res200s(res, req, data);
            }).catch((err) => handler.error500s(err, res, "GET Profile Games Error."));
        }).catch((err) => handler.error500s(err, res, "GET Season ID Error."));
    }).catch((err) => handler.error500s(err, res, "GET Profile ID Error."));
});

/**
 * @route   GET api/profile/v1/stats/name/:profileName/:tournamentShortName
 * @desc    Get Profile Stats Log
 * @access  Public
 */
router.get('/stats/name/:profileName/:tournamentShortName', async (req, res) => {
    const { profileName, tournamentShortName } = req.params;
    console.log(`GET Request Profile '${profileName}' Stats Log from Tournament '${tournamentShortName}'.`);
    Profile.getIdByName(profileName).then((pPId) => {
        if (pPId == null) { return handler.res400s(res, req, `Profile Name '${profileName}' Not Found`); }
        Tournament.getId(tournamentShortName).then((tPId) => {
            if (tPId == null) { return handler.res400s(res, req, `Tournament Shortname '${tournamentShortName}' Not Found`); }
            Profile.getStats(pPId, tPId).then((data) => {
                if (data == null) { return handler.res400s(res, req, `'${profileName}' does not have the Season '${tournamentShortName}' logged.`); }
                return handler.res200s(res, req, data);
            }).catch((err) => handler.error500s(err, res, "GET Profile Stats Error."));
        }).catch((err) => handler.error500s(err, res, "GET Tournament ID Error."));
    }).catch((err) => handler.error500s(err, res, "GET Profile ID Error."));
});

/**
 * @route   GET api/profile/v1/games/latest/name/:profileName
 * @desc    Get Profile Game Log from the latest season
 * @access  Public
 */
router.get('/games/latest/name/:profileName', (req, res) => {
    const { profileName } = req.params;
    console.log(`"GET Request Profile '${profileName}' Game Log from the latest Season."`);
    Profile.getIdByName(profileName).then((pPId) => {
        if (pPId == null) { return handler.res400s(res, req, `Profile Name '${profileName}' Not Found`); }
        Profile.getGames(pPId).then((data) => {
            return handler.res200s(res, req, data);
        }).catch((err) => handler.error500s(err, res, "GET Profile Games Error."));
    }).catch((err) => handler.error500s(err, res, "GET Profile ID Error."));
});

/**
 * @route   GET api/profile/v1/stats/latest/name/:profileName
 * @desc    Get Profile Stats Log from the latest tournament
 * @access  Public
 */
router.get('/stats/latest/name/:profileName', (req, res) => {
    const { profileName } = req.params;
    console.log(`"GET Request Profile '${profileName}' Game Log from the latest Tournament"`);
    Profile.getIdByName(profileName).then((pPId) => {
        if (pPId == null) { return handler.res400s(res, req, `Profile Name '${profileName}' Not Found`); }
        Profile.getStats(pPId).then((data) => {
            return handler.res200s(res, req, data);
        }).catch((err) => handler.error500s(err, res, "GET Profile Games Error."));
    }).catch((err) => handler.error500s(err, res, "GET Profile ID Error."));
});

//#endregion

//#region POST / PUT REQUESTS - Profile

/**
 * @route   POST api/profile/v1/add/new
 * @desc    Add new Profile with primary summoner account
 * @access  Private (to Admins)
 */
router.post('/add/new', (req, res) => {
    const { profileName, summonerName } = req.body;
    // Check if the IGN exists. 
    Profile.getSummonerId(summonerName).then((summId) => {
        if (summId == null) {
            // Summoner Id does not exist
            return handler.res400s(res, req, `Summoner Name '${summonerName}' does not exist.`);
        }
        // Check if summoner Name has its ID already registered. 
        Profile.getIdBySummonerId(summId).then((pPId) => {
            if (pPId != null) {
                // Profile Id Found in DB. That means Profile name exists with Summoner. Reject.
                Profile.getName(pPId, false).then((pName) => {
                    return handler.res400s(res, req, `Summoner Name '${summonerName}' already registered under Profile Name '${pName}' and ID '${pPId}'`);
                }).catch((err) => handler.error500s(err, res, "GET Profile Name Error."));
                return;
            }
            // New Summoner Id found.
            // Check if Profile name already exists.
            Profile.getIdByName(profileName).then((pPId) => {
                if (pPId != null) {
                    // Id Found in DB. That means Profile name exists. Reject.
                    return handler.res400s(res, req, `Profile '${profileName}' already exists under Profile ID '${pPId}'`);
                }
                // Make new Profile
                Profile.postNew(profileName, summId).then((data) => {
                    return handler.res200s(res, req, data);
                }).catch((err) => handler.error500s(err, res, "POST Profile Add New Error 1."));
            }).catch((err) => handler.error500s(err, res, "POST Profile Add New Error 3."));
        }).catch((err) => handler.error500s(err, res, "POST Profile Add New Error 4."));
    });
});

/**
 * @route   PUT api/profile/v1/add/account
 * @desc    Add a Summoner account to the Profile
 * @access  Private (to Admins)
 */
router.put('/add/account', (req, res) => {
    const { profileName, summonerName } = req.body;
    // Check if the IGN exists (Riot API call)
    Profile.getSummonerId(summonerName).then((summId) => {
        if (summId == null) {
            // Summoner Id does not exist
            return handler.res400s(res, req, `Summoner Name '${summonerName}' does not exist.`);
        }
        Profile.getIdBySummonerId(summId).then((profileIdExist) => {
            if (profileIdExist != null) {
                // Profile Id Found in DB. That means Profile name exists with Summoner. Reject.
                Profile.getName(profileIdExist, false).then((pName) => {
                    return handler.res400s(res, req, `Summoner Name '${summonerName}' already registered under Profile Name '${pName}' and ID '${profileIdExist}'`);
                }).catch((err) => handler.error500s(err, res, "PUT Profile Info Error 1."));
                return;
            }
            // Check if Profile Name exists
            Profile.getIdByName(profileName).then((pPId) => {
                if (pPId == null) {
                    // Profile does not exist
                    return handler.res400s(res, req, `Profile '${profileName}' does not exist.`);
                }
                // Get Profile Information
                Profile.getInfo(pPId).then((infoData) => {
                    infoData['LeagueAccounts'][summId] = { 'MainAccount': false };
                    Profile.putInfo(pPId, summId, infoData).then((data) => {
                        return handler.res200s(res, req, data);
                    }).catch((err) => handler.error500s(err, res, "PUT Profile Info Error 2."));
                }).catch((err) => handler.error500s(err, res, "PUT Profile Info Error 3."));
            }).catch((err) => handler.error500s(err, res, "PUT Profile Info Error 4."));
        }).catch((err) => handler.error500s(err, res, "PUT Profile Info Error 5."));
    }).catch((err) => handler.error500s(err, res, "PUT Profile Info Error 6."));
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
router.put('/remove/account', (req, res) => {

})

/**
 * @route   PUT api/profile/v1/update/name
 * @desc    Change profile Name
 * @access  Private (to Admins)
 */
router.put('/update/name', (req, res) => {
    const { currentName, newName } = req.body;
    // Check if currentName and newName exist
    Profile.getIdByName(currentName).then((profileId) => {
        if (profileId == null) {
            // Profile Name does not exist
            return handler.res400s(res, req, `Profile '${currentName}' does not exist.`);
        }
        Profile.getIdByName(newName).then((checkId) => {
            if (checkId != null) {
                // New name already exists in Db
                return handler.res400s(res, req, `New profile name '${newName}' is already taken!`);
            }
            Profile.putName(profileId, newName, currentName).then((data) => {
                return handler.res200s(res, req, data);
            }).catch((err) => handler.error500s(err, res, "PUT Profile Name Change Error 1."));
        }).catch((err) => handler.error500s(err, res, "PUT Profile Name Change Error 2."));
    }).catch((err) => handler.error500s(err, res, "PUT Profile Name Change Error 3."))
})

//#endregion

module.exports = router;