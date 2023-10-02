const profileV1Routes = require('express').Router();

import {
  res200sOK,
  res400sClientError,
  error500sServerError,
} from './dependencies/handlers';
/*  Import helper Data function modules */
import {
  getProfilePIdByName,
  getProfileGamesBySeason,
  getProfileStatsByTourney,
  postNewProfile,
  updateProfileInfoSummonerList,
  updateProfileName,
  checkNewProfileByUrl,
  putProfileRemoveAccount,
  deleteProfileFromDb,
  opggUrlCheckProfiles,
  getProfileInfoByProfileName,
  getProfileNameBySummName,
  checkNewProfileById,
} from '../../functions/apiV1/profileData';
import { getSeasonId } from '../../functions/apiV1/seasonData';
import { getTournamentId } from '../../functions/apiV1/tournamentData';
import { authenticateJWT } from './dependencies/jwtHelper';

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
  console.log(`GET Request Profile of profile name '${profileName}' Information.`);

  getProfileInfoByProfileName(profileName).then((data) => {
    if (data.errorMsg) { return res400sClientError(res, req, data.errorMsg); }
    return res200sOK(res, req, data);
  }).catch((err) => error500sServerError(err, res, "GET Profile ID error by profile name."));
});

/**
 * @route   GET api/profile/v1/name/summ/:summname
 * @desc    Get Profile Information
 * @access  Public
 */
profileV1Routes.get('/name/summ/:summName', (req, res) => {
  const { summName } = req.params;
  console.log(`GET Request Profile of summoner account '${summName}' Information.`);

  getProfileNameBySummName(summName).then((data) => {
    if (data.errorMsg) { return res400sClientError(res, req, data.errorMsg); }
    return res200sOK(res, req, data);
  }).catch((err) => error500sServerError(err, res, "GET Profile ID error by summoner name."));
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
profileV1Routes.get('/stats/name/:profileName/:tournamentShortName', (req, res) => {
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
  console.log(`GET Request Profile '${profileName}' Game Log from the latest Season.`);

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
  console.log(`GET Request Profile '${profileName}' Game Log from the latest Tournament`);

  getProfilePIdByName(profileName).then((pPId) => {
    if (pPId == null) { return res400sClientError(res, req, `Profile Name '${profileName}' Not Found`); }
    getProfileStatsByTourney(pPId).then((data) => {
      return res200sOK(res, req, data);
    }).catch((err) => error500sServerError(err, res, "GET Profile Games Error."));
  }).catch((err) => error500sServerError(err, res, "GET Profile ID Error."));
});

/**
 * @route   GET api/profile/v1/check/opggurls
 * @desc    Get Profile Ids/Name from a list of Opgg Url links
 * @access  Public
 */
profileV1Routes.get('/check/opggurls', (req, res) => {
  const { opggUrlList } = req.body;
  console.log(`GET Request Profile on Opggs checks`);

  opggUrlCheckProfiles(opggUrlList).then((data) => {
    if (data.errorMsg) { return res400sClientError(res, req, data.errorMsg, data.errorList); }
    return res200sOK(res, req, data);
  }).catch((err) => error500sServerError(err, res, "GET Profile Opgg Checks Error."))
});

//#endregion

//#region POST / PUT REQUESTS - Profile

/**
 * @route   POST api/profile/v1/add/new/by-summid
 * @desc    Add new Profile with the given summoner Id.
 * @access  Private (to Admins)
 */
profileV1Routes.post('/add/new/by-summid', authenticateJWT, (req, res) => {
  const { newName, summId } = req.body;
  console.log(`POST Request Profile by summId '${newName}' / '${summId}' - Add New Profile`);

  checkNewProfileById(summId).then((profileData) => {
    if (profileData.errorMsg) {
      return res400sClientError(res, req, profileData.errorMsg, profileData.errorList);
    }
    postNewProfile(newName, profileData.summIdList).then((data) => {
      return res200sOK(res, req, data);
    }).catch((err) => error500sServerError(err, res, "POST Profile Add New Error - postNewProfile function."));
  }).catch((err) => error500sServerError(err, res, "POST Profile Add New Error - checkNewProfile function."));
});

/**
 * @route   POST api/profile/v1/add/new/by-url
 * @desc    Add new Profile with a list of summoners. Main account is the first index
 * @access  Private (to Admins)
 */
profileV1Routes.post('/add/new/by-url', authenticateJWT, (req, res) => {
  const { newName, opggUrl } = req.body;
  console.log(`POST Request Profile by Url '${newName}' / '${opggUrl}' - Add New Profile`);

  checkNewProfileByUrl(opggUrl, newName).then((profileData) => {
    if (profileData.errorMsg) {
      return res400sClientError(res, req, profileData.errorMsg, profileData.errorList);
    }
    postNewProfile(profileData.profileName, profileData.summIdList).then((data) => {
      return res200sOK(res, req, data);
    }).catch((err) => error500sServerError(err, res, "POST Profile Add New Error - postNewProfile function."));
  }).catch((err) => error500sServerError(err, res, "POST Profile Add New Error - checkNewProfile function."));
});

/**
 * @route   PUT api/profile/v1/add/account
 * @desc    Add Summoner accounts to the Profile
 * @access  Private (to Admins)
 */
profileV1Routes.put('/add/account', authenticateJWT, (req, res) => {
  const { profileName, opggUrl } = req.body;
  console.log(`PUT Request Profile '${profileName}' - Add Summoners`);

  updateProfileInfoSummonerList(profileName, opggUrl).then((data) => {
    if (data.errorMsg) { return res400sClientError(res, req, data.errorMsg, data.errorList); }
    return res200sOK(res, req, data);
  }).catch((err) => error500sServerError(err, res, "PUT Profile Add Summoner Accounts - PUT Profile Info Error."));
});

// Remove summoner account from Profile.
// BODY EXAMPLE:
// {
//     "profileName": "NAME",
//     "summonerId": "SUMM_ID",
// }
/**
 * @route   PUT api/profile/v1/remove/account
 * @desc    Remove a Summoner account from the profile
 * @access  Private (to Admins)
 */
profileV1Routes.put('/remove/account', authenticateJWT, (req, res) => {
  const { profileName, summName } = req.body;
  console.log(`PUT Request Profile '${profileName}' - Removing summoner name ${summName}`);

  putProfileRemoveAccount(profileName, summName).then((data) => {
    if (data.errorMsg) { return res400sClientError(res, req, data.errorMsg); }
    return res200sOK(res, req, data);
  }).catch((err) => error500sServerError(err, res, "PUT Profile Remove Summoner Account."));
});

/**
 * @route   PUT api/profile/v1/update/name
 * @desc    Change profile Name
 * @access  Private (to Admins)
 */
profileV1Routes.put('/update/name', authenticateJWT, (req, res) => {
  const { currentName, newName } = req.body;
  console.log(`PUT Request Profile '${currentName} - Changing Name to '${newName}'`);
  
  updateProfileName(newName, currentName).then((data) => {
    if (data.error) {
      return res400sClientError(res, req, data.error);
    }
    else {
      return res200sOK(res, req, data);
    }
  }).catch((err) => error500sServerError(err, res, "PUT Profile Name Change - Update Function Error."));
});

/**
 * @route   DELETE api/profile/v1/remove/name
 * @desc    Remove a Profile that does not have a GameLog or StatsLog property
 * @access  Private (to Admins)
 */
profileV1Routes.delete('/remove/name', authenticateJWT, (req, res) => {
  const { profileName } = req.body;
  console.log(`DELETE Request Profile '${profileName}'`);

  getProfilePIdByName(profileName).then((profilePId) => {
    if (!profilePId) {
      return res400sClientError(res, req, `Profile '${profileName}' does not exist.`);
    }
    deleteProfileFromDb(profilePId, profileName).then((data) => {
      return res200sOK(res, req, data);
    }).catch((err) => error500sServerError(err, res, "DELETE Profile - Function Error."));
  }).catch((err) => error500sServerError(err, res, "DELETE Profile - Get Profile PId Error."));
});

//#endregion

export default profileV1Routes;