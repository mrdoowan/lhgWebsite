
const leagueV1Routes = require('express').Router();

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
 * @desc    List all the Leagues
 * @access  Public
 */
leagueV1Routes.get('/', (req, res) => {
    console.log("GET Request Leagues.");
    getLeagues().then((data) => {
        return res200sOK(res, req, data);
    }).catch((err) => error500sServerError(err, res, "GET Leagues Information Error."));
});

//#endregion

export default leagueV1Routes;