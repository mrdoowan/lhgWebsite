const router = require('express').Router();
const handler = require('./dependencies/handlers');

/*  Import helper Data function modules */
import { getLeagues } from './seasonData';

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
    getLeagues().then((data) => {
        return handler.res200s(res, req, data);
    }).catch((err) => handler.error500s(err, res, "GET Leagues Information Error."));
});

//#endregion

module.exports = router;