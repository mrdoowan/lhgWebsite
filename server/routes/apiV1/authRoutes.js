import { getProfileInfo, getProfilePIdByName } from '../../functions/apiV1/profileData';
import {
  error500sServerError,
  res200sOK,
  res400sClientError,
  res403ClientError
} from './dependencies/handlers';

const authV1Routes = require('express').Router();
const jsonwebtoken = require('jsonwebtoken');
const bcrypt = require('bcrypt');

/*  
    ----------------------
    User Auth API Requests
    ----------------------
*/

//#region POST Requests - User Auth

/**
 * @route   GET api/auth/v1
 * @desc    Login for Staff/Mods only
 * @access  Public
 */
authV1Routes.post('/login', (req, res) => {
  const { username, password } = req.body;

  console.log(`POST Request - Logging in ${username}.`);
  if (req.cookies.token) {
    return res400sClientError(res, req, `Already logged in`);
  }

  getProfilePIdByName(username).then((profilePId) => {
    if (!profilePId) { return res400sClientError(res, req, `Username '${username}' doesn't exist.`); }
    getProfileInfo(profilePId).then((userObject) => {
      if (!userObject) { return res400sClientError(res, req, `Username '${username}' does not have an Info object.`); }
      if (!userObject.Admin) {
        return res403ClientError(res, `Username '${username}' is not an Admin.`);
      }

      bcrypt.compare(password, userObject.Password).then(function (result) {
        if (!result) {
          return res400sClientError(res, req, `Username '${username}' entered the wrong password.`);
        }

        // Username and password correct. Generate access token
        const accessToken = jsonwebtoken.sign({
          username: username,
          role: 'Admin'
        }, process.env.ACCESS_TOKEN_SECRET);

        // Add cookie
        res.cookie('league_token', accessToken, { httpOnly: true });

        return res200sOK(res, req, { accessToken });
      }).catch((err) => { return error500sServerError(err, res, `POST Login Error - Bcrypt Hash`); });
    }).catch((err) => { return error500sServerError(err, res, `POST Login Error - Get Profile Info`); });
  }).catch((err) => { return error500sServerError(err, res, `POST Login Error - Get Profile PId`); });
});

/**
 * @route   GET api/auth/v1
 * @desc    Login for Staff/Mods only
 * @access  Private - Only Staff/Mods who have authenticated
 */
authV1Routes.post('/logout', (req, res) => {
  try {
    console.log(`POST Request - Logging Out.`);
    if (req.cookies.league_token) {
      const token = req.cookies.league_token;
      res.clearCookie('league_token');

      return res200sOK(res, req, {
        response: `Logout successful.`,
        token: token
      });
    }
    else {
      return res400sClientError(res, req, `No cookie token available to logout.`);
    }
  }
  catch (err) {
    return error500sServerError(err, res, `POST Logout Error`);
  }
});

//#endregion

export default authV1Routes;