const tournamentV1Routes = require('express').Router();

import {
    res200sOK,
    res400sClientError,
    error500sServerError,
} from './dependencies/handlers';
/*  Import helper Data function modules */
import {
    getTournamentId,
    getTournamentInfo,
    getTournamentStats,
    getTournamentLeaderboards,
    getTournamentPlayerStats,
    getTournamentTeamStats,
    getTournamentPickBans,
    getTournamentGames,
    getTournamentPlayerList,
    getTournamentTeamList,
    updateTournamentOverallStats,
} from '../../functions/apiV1/tournamentData';
import {
    updateProfileGameLog,
    updateProfileStatsLog,
} from '../../functions/apiV1/profileData';
import {
    updateTeamGameLog,
    updateTeamStatsLog,
} from '../../functions/apiV1/teamData';
import { checkRdsStatus } from '../../functions/apiV1/dependencies/awsRdsHelper';
import { AWS_RDS_STATUS } from '../../services/Constants';

/*  
    ----------------------
    Tournament API Requests
    ----------------------
*/

//#region GET Requests - Tournament

/**
 * @route   GET api/tournament/v1/information/name/:tournamentShortName
 * @desc    Get Tournament Information
 * @access  Public
 */
tournamentV1Routes.get('/information/name/:tournamentShortName', (req, res) => {
    const { tournamentShortName } = req.params;
    console.log(`GET Request Tournament '${tournamentShortName}' Information.`);
    getTournamentId(tournamentShortName).then((tPId) => {
        if (tPId == null) { return res400sClientError(res, req, `Tournament Name '${tournamentShortName}' Not Found`); }
        getTournamentInfo(tPId).then((data) => {
            return res200sOK(res, req, data);
        }).catch((err) => error500sServerError(err, res, "GET Tourney Information Error."));
    }).catch((err) => error500sServerError(err, res, "GET Tourney ID Error."));
});

/**
 * @route   GET api/tournament/v1/stats/name/:tournamentShortName
 * @desc    Get Tournament Stats (Basic)
 * @access  Public
 */
tournamentV1Routes.get('/stats/name/:tournamentShortName', (req, res) => {
    const { tournamentShortName } = req.params;
    console.log(`GET Request Tournament '${tournamentShortName}' Tournament Stats.`);
    getTournamentId(tournamentShortName).then((tPId) => {
        if (tPId == null) { return res400sClientError(res, req, `Tournament Name '${tournamentShortName}' Not Found`); }
        getTournamentStats(tPId).then((data) => {
            return res200sOK(res, req, data);
        }).catch((err) => error500sServerError(err, res, "GET Tourney Information Error."));
    }).catch((err) => error500sServerError(err, res, "GET Tourney ID Error."));
});

/**
 * @route   GET api/tournament/v1/leaderboards/name/:tournamentShortName
 * @desc    Get Tournament Leaderboard information
 * @access  Public
 */
tournamentV1Routes.get('/leaderboards/name/:tournamentShortName', (req, res) => {
    const { tournamentShortName } = req.params;
    console.log(`GET Request Tournament '${tournamentShortName}' Leaderboards.`);
    getTournamentId(tournamentShortName).then((tPId) => {
        if (tPId == null) { return res400sClientError(res, req, `Tournament Name '${tournamentShortName}' Not Found`); }
        getTournamentLeaderboards(tPId).then((data) => {
            return res200sOK(res, req, data);
        }).catch((err) => error500sServerError(err, res, "GET Tourney Leaderboard Error."));
    }).catch((err) => error500sServerError(err, res, "GET Tourney ID Error."));
});

/**
 * @route   GET api/tournament/v1/players/stats/name/:tournamentShortName
 * @desc    Get Tournament Player Stats
 * @access  Public
 */
tournamentV1Routes.get('/players/stats/name/:tournamentShortName', (req, res) => {
    const { tournamentShortName } = req.params;
    console.log(`GET Request Tournament '${tournamentShortName}' Player Stats.`);
    getTournamentId(tournamentShortName).then((tPId) => {
        if (tPId == null) { return res400sClientError(res, req, `Tournament Name '${tournamentShortName}' Not Found`); }
        getTournamentPlayerStats(tPId).then((data) => {
            return res200sOK(res, req, data);
        }).catch((err) => error500sServerError(err, res, "GET Tourney Players Error."));
    }).catch((err) => error500sServerError(err, res, "GET Tourney ID Error."));
});

/**
 * @route   GET api/tournament/v1/teams/stats/name/:tournamentShortName
 * @desc    Get Tournament Team Stats
 * @access  Public
 */
tournamentV1Routes.get('/teams/stats/name/:tournamentShortName', (req, res) => {
    const { tournamentShortName } = req.params;
    console.log(`GET Request Tournament '${tournamentShortName}' Team Stats.`);
    getTournamentId(tournamentShortName).then((tPId) => {
        if (tPId == null) { return res400sClientError(res, req, `Tournament Name '${tournamentShortName}' Not Found`); }
        getTournamentTeamStats(tPId).then((data) => {
            return res200sOK(res, req, data);
        }).catch((err) => error500sServerError(err, res, "GET Tourney Teams Error."));
    }).catch((err) => error500sServerError(err, res, "GET Tourney ID Error."));
});

/**
 * @route   GET api/tournament/v1/pickbans/name/:tournamentShortName
 * @desc    Get Tournament Pick Ban Data
 * @access  Public
 */
tournamentV1Routes.get('/pickbans/name/:tournamentShortName', (req, res) => {
    const { tournamentShortName } = req.params;
    console.log(`GET Request Tournament '${tournamentShortName}' Pick Bans.`);
    getTournamentId(tournamentShortName).then((tPId) => {
        if (tPId == null) { return res400sClientError(res, req, `Tournament Name '${tournamentShortName}' Not Found`); }
        getTournamentPickBans(tPId).then((data) => {
            return res200sOK(res, req, data);
        }).catch((err) => error500sServerError(err, res, "GET Tourney Pick Bans Error."));
    }).catch((err) => error500sServerError(err, res, "GET Tourney ID Error."));
});

/**
 * @route   GET api/tournament/v1/games/name/:tournamentShortName
 * @desc    Get Tournament List of Games Played
 * @access  Public
 */
tournamentV1Routes.get('/games/name/:tournamentShortName', (req, res) => {
    const { tournamentShortName } = req.params;
    console.log(`GET Request Tournament '${tournamentShortName}' Game Log.`);
    getTournamentId(tournamentShortName).then((tPId) => {
        if (tPId == null) { return res400sClientError(res, req, `Tournament Name '${tournamentShortName}' Not Found`); }
        getTournamentGames(tPId).then((data) => {
            return res200sOK(res, req, data);
        }).catch((err) => error500sServerError(err, res, "GET Tourney Games Error."));
    }).catch((err) => error500sServerError(err, res, "GET Tourney ID Error."));
});

/**
 * @route   GET api/tournament/v1/players/ids/name/:tournamentShortName
 * @desc    Get List of unique Player IDs participating in the Tournament
 * @access  Public
 */
tournamentV1Routes.get('/players/ids/name/:tournamentShortName', (req, res) => {
    const { tournamentShortName } = req.params;
    console.log(`GET Request Tournament '${tournamentShortName}' Player IDs List.`);
    getTournamentId(tournamentShortName).then((tourneyPId) => {
        if (tourneyPId == null) { return res400sClientError(res, req, `Tournament Name '${tournamentShortName}' Not Found`); }
        getTournamentPlayerList(tourneyPId).then((playerList) => {
            return res200sOK(res, req, playerList);
        });
    });
});

/**
 * @route   GET api/tournament/v1/teams/ids/name/:tournamentShortName
 * @desc    Get List of unique Team IDs participating in the Tournament
 * @access  Public
 */
tournamentV1Routes.get('/teams/ids/name/:tournamentShortName', (req, res) => {
    const { tournamentShortName } = req.params;
    console.log(`GET Request Tournament '${tournamentShortName}' Team IDs List.`);
    getTournamentId(tournamentShortName).then((tourneyPId) => {
        if (tourneyPId == null) { return res400sClientError(res, req, `Tournament Name '${tournamentShortName}' Not Found`); }
        getTournamentTeamList(tourneyPId).then((teamList) => {
            return res200sOK(res, req, teamList);
        });
    });
});

/**
 * Uses MySQL
 * @route   PUT api/tournament/v1/update/overall
 * @desc    Update Tournament overall stats
 * @access  Private (Admins only)
 */
tournamentV1Routes.put('/update/overall', (req, res) => {
    const { tournamentShortName } = req.body;

    console.log(`PUT Request Tournament ${tournamentShortName} Overall Stats.`);
    checkRdsStatus().then((status) => {
        if (status !== AWS_RDS_STATUS.AVAILABLE) {
            return res400sClientError(res, req, `AWS Rds Instance not available.`);
        }
        getTournamentId(tournamentShortName).then((tourneyPId) => {
            if (tourneyPId == null) { return res400sClientError(res, req, `Tournament Name '${tournamentShortName}' Not Found`); }
            updateTournamentOverallStats(tourneyPId).then((tourneyResponse) => {
                return res200sOK(res, req, {
                    gamesNum: tourneyResponse.gamesUpdated,
                    tournamentShortName: tournamentShortName,
                    tournamentId: tourneyPId,
                });
            }).catch((err) => error500sServerError(err, res, "PUT Tourney Overall Stats Error."));
        }).catch((err) => error500sServerError(err, res, "GET Tourney ID Error."));
    }).catch((err) => error500sServerError(err, res, "Check RDS Status Error."));
});

/**
 * Uses MySQL
 * @route   PUT api/tournament/v1/update/player
 * @desc    Update a Player's stat for the Tournament
 * @access  Private (Admins only)
 */
tournamentV1Routes.put('/update/player', (req, res) => {
    const { tournamentShortName, playerPId } = req.body;

    console.log(`PUT Request Tournament ${tournamentShortName} Player Stats of ID '${playerPId}'`);
    checkRdsStatus().then((status) => {
        if (status !== AWS_RDS_STATUS.AVAILABLE) {
            return res400sClientError(res, req, `AWS Rds Instance not available.`);
        }
        getTournamentId(tournamentShortName).then(async (tourneyPId) => {
            if (tourneyPId == null) { return res400sClientError(res, req, `Tournament Name '${tournamentShortName}' Not Found`); }
            try { await updateProfileGameLog(playerPId, tourneyPId) }
            catch (err) { return error500sServerError(err, res, "PUT Profile Game Log Error."); }
            try { await updateProfileStatsLog(playerPId, tourneyPId) }
            catch (err) { return error500sServerError(err, res, "PUT Profile Stats Log Error."); }
            res200sOK(res, req, {
                'profilePId': playerPId,
                'tournamentShortName': tournamentShortName,
                'tournamentId': tourneyPId,
            });
        }).catch((err) => error500sServerError(err, res, "GET Tourney ID Error."));
    }).catch((err) => error500sServerError(err, res, "Check RDS Status Error."));
});

/**
 * Uses MySQL
 * @route   PUT api/tournament/v1/update/team
 * @desc    Update a Team's stat for the Tournament
 * @access  Private (Admins only)
 */
tournamentV1Routes.put('/update/team', (req, res) => {
    const { tournamentShortName, teamPId } = req.body;

    console.log(`PUT Request Tournament ${tournamentShortName} Team Stats of ID '${teamPId}'`);
    checkRdsStatus().then((status) => {
        if (status !== AWS_RDS_STATUS.AVAILABLE) {
            return res400sClientError(res, req, `AWS Rds Instance not available.`);
        }
        getTournamentId(tournamentShortName).then(async (tourneyPId) => {
            if (tourneyPId == null) { return res400sClientError(res, req, `Tournament Name '${tournamentShortName}' Not Found`); }
            try { await updateTeamGameLog(teamPId, tourneyPId) }
            catch (err) { return error500sServerError(err, res, "PUT Team Game Log Error."); }
            try { await updateTeamStatsLog(teamPId, tourneyPId) }
            catch (err) { return error500sServerError(err, res, "PUT Team Stats Log Error."); }
            res200sOK(res, req, {
                'profilePId': teamPId,
                'tournamentShortName': tournamentShortName,
                'tournamentId': tourneyPId,
            });
        }).catch((err) => error500sServerError(err, res, "GET Tourney ID Error."));
    }).catch((err) => error500sServerError(err, res, "Check RDS Status Error."));
});

//#endregion

export default tournamentV1Routes;