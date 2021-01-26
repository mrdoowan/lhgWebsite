const router = require('express').Router();
//import {  } from './dependencies/handlers';

/*  
    ----------------------
    User Auth API Requests
    ----------------------
*/

//#region POST Requests - User Auth

/**
 * @route   GET api/login/v1
 * @desc    Login for Staff/Mods only
 * @access  Public
 */
router.post('/login', (req, res) => {

});

/**
 * @route   GET api/login/v1
 * @desc    Login for Staff/Mods only
 * @access  Private - Only Staff/Mods who have authenticated
 */
router.post('/logout', (req, res) => {

});

//#endregion

module.exports = router;