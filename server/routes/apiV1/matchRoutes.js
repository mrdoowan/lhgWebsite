const matchV1Routes = require('express').Router();

import {
    res200sOK,
    res400sClientError,
    error500sServerError,
} from './dependencies/handlers';
/*  Import helper Data function modules */
import {
    getMatchData,
    getMatchSetup,
    postMatchNewSetup,
    putMatchPlayerFix,
    deleteMatchData,
    getMatchSetupList,
    putMatchSaveSetup,
} from '../../functions/apiV1/matchData';
import { submitMatchSetup } from '../../functions/apiV1/matchSubmit/matchSubmit';
import { checkRdsStatus } from '../../functions/apiV1/dependencies/awsRdsHelper';
import { AWS_RDS_STATUS } from '../../services/constants';
import { getTournamentId } from '../../functions/apiV1/tournamentData';
import { authenticateJWT } from './dependencies/jwtHelper';

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
matchV1Routes.get('/data/:matchId', (req, res) => {
    const { matchId } = req.params;

    console.log(`GET Request Match '${matchId}' Data.`);
    getMatchData(matchId).then((data) => {
        if (data == null) { return res400sClientError(res, req, `Match ID '${matchId}' Not Found`); }
        return res200sOK(res, req, data);
    }).catch((err) => error500sServerError(err, res, "GET Match Data Error."));
});

/**
 * @route   GET api/match/v1/setup/data/:matchId
 * @desc    Get Match Setup
 * @access  Public
 */
matchV1Routes.get('/setup/data/:matchId', (req, res) => {
    const { matchId } = req.params;

    console.log(`GET Request Match '${matchId}' Setup.`);
    getMatchSetup(matchId).then((data) => {
        if (data == null) { return res400sClientError(res, req, `Match ID '${matchId}' Setup Not Found`); }
        return res200sOK(res, req, data);
    }).catch((err) => error500sServerError(err, res, "GET Match Setup Error."));
});

//#endregion

//#region POST / PUT / DELETE Requests - Match

/**
 * Uses MySQL
 * @route   PUT api/match/v1/players/update
 * @desc    Fix Player assignment to champions
 * @access  Private (to Admins)
 */
matchV1Routes.put('/players/update', authenticateJWT, (req, res) => {
    const { playersToFix, matchId } = req.body;

    console.log(`PUT Request Match '${matchId}' Players`);
    checkRdsStatus().then((status) => {
        if (status !== AWS_RDS_STATUS.AVAILABLE) {
            return res400sClientError(res, req, `AWS Rds Instance not available.`);
        }
        putMatchPlayerFix(playersToFix, matchId).then((data) => {
            if (data == null) { return res400sClientError(res, req, `Match ID '${matchId}' PUT Request Fix Players' Champions Failed`); }
            return res200sOK(res, req, data);
        }).catch((err) => error500sServerError(err, res, "PUT Match Update Error."));
    }).catch((err) => error500sServerError(err, res, "Check RDS Status Error."));
});

/**
 * @route   POST api/match/v1/setup/new/id
 * @desc    Create Match "Setup" Item by the ID of a previous played Match
 * @access  Private (to Admins)
 */
matchV1Routes.post('/setup/new/id', authenticateJWT, (req, res) => {
    const { riotMatchId, tournamentName } = req.body;

    console.log(`POST Request Match '${riotMatchId}' New Setup in ${tournamentName}`);
    getTournamentId(tournamentName).then((tournamentId) => {
        if (!tournamentId) { res400sClientError(res, req, `Tournament shortname '${tournamentName}' Not Found.`); }
        postMatchNewSetup(riotMatchId, tournamentId).then((data) => {
            if ('Error' in data) { return res400sClientError(res, req, `Match ID '${riotMatchId}' POST Request New Setup Failed`, data); }
            return res200sOK(res, req, data);
        }).catch((err) => error500sServerError(err, res, "POST Match New Setup Error."));
    }).catch((err) => error500sServerError(err, res, "GET Tournament Id Error."));
});

/**
 * @route   POST api/match/v1/setup/new/spectate
 * @desc    Create Match "Setup" Item by the ID of a CURRENT (through Spectate) match
 * @access  Private (to Admins)
 */


/**
 * @route   GET api/match/v1/setup/list
 * @desc    Get List of Match Ids that have a "Setup" Item
 * @access  Private (to Admins)
 */
matchV1Routes.get('/setup/list', (req, res) => {
    console.log(`GET Request Match Ids of Setup Key`);
    getMatchSetupList().then((data) => {
        if (data == null) { return res400sClientError(res, req, `Match Setup List GET Request Failed`); }
        return res200sOK(res, req, data);
    }).catch((err) => error500sServerError(err, res, "GET Match Setup List Error"));
});

/**
 * @route   PUT api/match/v1/setup/save
 * @desc    Saves text fields from /matchup/setup page into 'Setup' object
 * @access  Private (to Admins)
 */
matchV1Routes.put('/setup/save', authenticateJWT, (req, res) => {
    const { matchId, teams } = req.body;
    
    console.log(`PUT Request Match '${matchId}' Save Setup`);
    putMatchSaveSetup(matchId, teams).then((response) => {
        if (!response) { return res400sClientError(res, req, `Match ID '${riotMatchId}' PUT Request Save Setup Failed`); }
        return res200sOK(res, req, response);
    }).catch((err) => error500sServerError(err, res, "PUT Match Setup Save Error."));
});

/**
 * @route   PUT api/match/v1/setup/submit
 * @desc    Saves the text fields and submits the Match Data into MySQL and DynamoDb
 * @access  Private (to Admins)
 */
matchV1Routes.put('/setup/submit', authenticateJWT, (req, res) => {
    const { matchId, teams } = req.body;

    console.log(`PUT Request Match '${matchId}' Setup Submit.`);
    putMatchSaveSetup(matchId, teams).then((saveResponse) => {
        if (!saveResponse) { return res400sClientError(res, req, `Match ID '${riotMatchId}' Save Setup Failed`); }
        submitMatchSetup(matchId).then((submitResponse) => {
            if (!submitResponse) { return res400sClientError(res, req, `Match ID '${matchId} PUT Request Submit Setup Failed`); }
            else if ('validateMessages' in submitResponse) { 
                return res400sClientError(
                    res, req, `Match ID '${matchId}' PUT Request Submit has invalid inputs.`, submitResponse
                );
            }
            return res200sOK(res, req, submitResponse);
        }).catch((err) => error500sServerError(err, res, "PUT Match Setup Submit Error."));
    }).catch((err) => error500sServerError(err, res, "PUT Match Setup Save Error."));
})

/**
 * Uses MySQL
 * @route   DELETE api/match/v1/remove/:matchId
 * @desc    Remove a match from Records
 * @access  Private (to Admins)
 */
matchV1Routes.delete('/remove/:matchId', (req, res) => {
    const { matchId } = req.params;

    console.log(`DELETE Request Match '${matchId}'.`);
    checkRdsStatus().then((status) => {
        if (status !== AWS_RDS_STATUS.AVAILABLE) {
            return res400sClientError(res, req, `AWS Rds Instance not available.`);
        }
        deleteMatchData(matchId).then((message) => {
            if (message == null) { return res400sClientError(res, req, `Match ID '${matchId}' Not Found`); }
            return res200sOK(res, req, message);
        }).catch((err) => error500sServerError(err, res, "DELETE Match Data Error."));
    }).catch((err) => error500sServerError(err, res, "Check RDS Status Error."));
});

//#endregion

export default matchV1Routes;