
const router = require('express').Router();

import {
    res200sOK,
    error500sServerError,
} from './dependencies/handlers';
/*  Import helper Data function modules */
import { getLeagues } from '../../functions/apiV1/seasonData';

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
        return res200sOK(res, req, data);
    }).catch((err) => error500sServerError(err, res, "GET Leagues Information Error."));
});

//#endregion

module.exports = router;