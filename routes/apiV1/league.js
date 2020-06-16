const router = require('express').Router();
const handler = require('../../functions/handlers');

/*  Import helper Data function modules */
const Season = require('../../functions/seasonData');

/*  
    ----------------------
    League API Requests
    ----------------------
*/

//#region GET Requests - League

/**
 * @route   GET api/leagues/v1
 * @desc    List all the Leagues in LHG
 * @access  Public
 */
router.get('/', (req, res) => {
    console.log("GET Request Leagues.");
    Season.getLeagues().then((data) => {
        return handler.res200s(res, req, data);
    }).catch((err) => handler.error500s(err, res, "GET Leagues Information Error."));
});

//#endregion

module.exports = router;