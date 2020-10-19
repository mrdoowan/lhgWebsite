const router = require('express').Router();
const handler = require('./dependencies/handlers');

/*  Import helper Data function modules */
const Match = require('../../functions/apiV1/matchData');

/*  
    ----------------------
    Match API Requests
    ----------------------
*/
//#region GET Requests - Match

/**
 * @route   GET api/match/v1/data/:matchId
 * @desc    Get Match Data
 * @access  Public
 */
router.get('/data/:matchId', (req, res) => {
    const { matchId } = req.params;
    console.log(`GET Request Match '${matchId}' Data.`);
    Match.getData(matchId).then((data) => {
        if (data == null) { return handler.res400s(res, req, `Match ID '${matchId}' Not Found`); }
        return handler.res200s(res, req, data);
    }).catch((err) => handler.error500s(err, res, "GET Match Data Error."));
});

/**
 * @route   GET api/match/v1/setup/:matchId
 * @desc    Get Match Setup
 * @access  Public
 */
router.get('/setup/:matchId', (req, res) => {
    const { matchId } = req.params;
    console.log(`GET Request Match '${matchId}' Setup.`);
    Match.getSetup(matchId).then((data) => {
        if (data == null) { return handler.res400s(res, req, `Match ID '${matchId}' Setup Not Found`); }
        return handler.res200s(res, req, data);
    }).catch((err) => handler.error500s(err, res, "GET Match Setup Error."));
});

//#endregion

//#region POST / PUT / DELETE Requests - Match

/**
 * @route   PUT api/match/v1/players/update
 * @desc    Fix Player assignment to champions
 * @access  Private (to Admins)
 */
router.put('/players/update', (req, res) => {
    const { playersToFix, matchId } = req.body;
    console.log(`PUT Request Match '${matchId}' Players`);
    Match.putPlayersFix(playersToFix, matchId).then((data) => {
        if (data == null) { return handler.res400s(res, req, `Match ID '${matchId}' PUT Request Fix Players' Champions Failed`); }
        return handler.res200s(res, req, data);
    }).catch((err) => handler.error500s(err, res, "PUT Match Update Error."));
});

/**
 * @route   POST api/match/v1/setup/new
 * @desc    Create Match "Setup" Item by the ID of a previous played Match
 * @access  Private (to Admins)
 */
router.post('/setup/new', (req, res) => {
    const { riotMatchId, seasonId, tournamentId } = req.body;
    console.log(`POST Request Match '${riotMatchId}' New Setup`);
    Match.putNewSetup(riotMatchId, seasonId, tournamentId).then((data) => {
        if (data == null) { return handler.res400s(res, req, `Match ID '${riotMatchId}' POST Request New Setup Failed`); }
        return handler.res200s(res, req, data);
    }).catch((err) => handler.error500s(err, res, "POST Match New Setup Error."));
});

/**
 * @route   POST api/match/v1/setup/spectate
 * @desc    Create Match "Setup" Item by the ID of a CURRENT (through Spectate) match
 * @access  Private (to Admins)
 */


/**
 * @route   PUT api/match/v1/setup/save
 * @desc    Saves text fields from /matchup/setup page into 'Setup' object
 * @access  Private (to Admins)
 */


/**
 * @route   PUT api/match/v1/setup/submit
 * @desc    Submits the text fields and processes the Match Data into MySQL and DynamoDb
 * @access  Private (to Admins)
 */

/**
 * @route   DELETE api/match/v1/remove/:matchId
 * @desc    Remove a match from Records
 * @access  Private (to Admins)
 */
router.delete('/remove/:matchId', (req, res) => {
    const { matchId } = req.params;
    console.log(`DELETE Request Match '${matchId}'.`);
    Match.deleteData(matchId).then((message) => {
        if (message == null) { return handler.res400s(res, req, `Match ID '${matchId}' Not Found`); }
        return handler.res200s(res, req, message);
    }).catch((err) => handler.error500s(err, res, "DELETE Match Data Error."));
});

//#endregion

module.exports = router;