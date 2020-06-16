const router = require('express').Router();
const handler = require('../../functions/handlers');

/*  Import helper Data function modules */
const Match = require('../../functions/matchData');

/*  
    ----------------------
    Match API Requests
    ----------------------
*/
//#region GET Requests - Match

/**
 * @route   GET api/match/v1/:matchId
 * @desc    Get Match Data
 * @access  Public
 */
router.get('/:matchId', (req, res) => {
    const { matchId } = req.params;
    console.log(`GET Request Match '${matchId}'.`);
    Match.getData(matchId).then((data) => {
        if (data == null) { return handler.res400s(res, req, `Match ID '${matchId}' Not Found`); }
        return handler.res200s(res, req, data);
    }).catch((err) => handler.error500s(err, res, "GET Match Data Error."));
});

//#endregion

//#region POST / PUT Requests - Match

/**
 * @route   PUT api/match/v1/players/update
 * @desc    Fix Player assignment to champions
 * @access  Private (to Admins)
 */
router.put('/players/update', (req, res) => {
    const { playersToFix, matchId } = req.body;
    console.log(`PUT Request Match '${matchId}' Players`);
    Match.putPlayersFix(bluePlayers, redPlayers, matchId).then((data) => {
        if (data == null) { return handler.res400s(res, req, `Match ID '${matchId}' Not Found`); }
        return handler.res200s(res, req, data);
    }).catch((err) => handler.error500s(err, res, "PUT Match Data Error."));
});

//#endregion

module.exports = router;