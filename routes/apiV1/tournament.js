const Router = require('express');
const router = Router();
const handler = require('../../functions/apiV1/handlers');

/*  Import helper Data function modules */
const Tournament = require('../../functions/apiV1/tournamentData');
const Profile = require('../../functions/apiV1/profileData');
const Team = require('../../functions/apiV1/teamData');

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
router.get('/information/name/:tournamentShortName', (req, res) => {
    const { tournamentShortName } = req.params;
    console.log(`GET Request Tournament '${tournamentShortName}' Information.`);
    Tournament.getId(tournamentShortName).then((tPId) => {
        if (tPId == null) { return handler.res400s(res, req, `Tournament Name '${tournamentShortName}' Not Found`); }
        Tournament.getInfo(tPId).then((data) => {
            return handler.res200s(res, req, data);
        }).catch((err) => handler.error500s(err, res, "GET Tourney Information Error."));
    }).catch((err) => handler.error500s(err, res, "GET Tourney ID Error."));
});

/**
 * @route   GET api/tournament/v1/stats/name/:tournamentShortName
 * @desc    Get Tournament Stats (Basic)
 * @access  Public
 */
router.get('/stats/name/:tournamentShortName', (req, res) => {
    const { tournamentShortName } = req.params;
    console.log(`GET Request Tournament '${tournamentShortName}' Tournament Stats.`);
    Tournament.getId(tournamentShortName).then((tPId) => {
        if (tPId == null) { return handler.res400s(res, req, `Tournament Name '${tournamentShortName}' Not Found`); }
        Tournament.getTourneyStats(tPId).then((data) => {
            return handler.res200s(res, req, data);
        }).catch((err) => handler.error500s(err, res, "GET Tourney Information Error."));
    }).catch((err) => handler.error500s(err, res, "GET Tourney ID Error."));
});

/**
 * @route   GET api/tournament/v1/leaderboards/name/:tournamentShortName
 * @desc    Get Tournament Leaderboard information
 * @access  Public
 */
router.get('/leaderboards/name/:tournamentShortName', (req, res) => {
    const { tournamentShortName } = req.params;
    console.log(`GET Request Tournament '${tournamentShortName}' Leaderboards.`);
    Tournament.getId(tournamentShortName).then((tPId) => {
        if (tPId == null) { return handler.res400s(res, req, `Tournament Name '${tournamentShortName}' Not Found`); }
        Tournament.getLeaderboards(tPId).then((data) => {
            return handler.res200s(res, req, data);
        }).catch((err) => handler.error500s(err, res, "GET Tourney Leaderboard Error."));
    }).catch((err) => handler.error500s(err, res, "GET Tourney ID Error."));
});

/**
 * @route   GET api/tournament/v1/players/stats/name/:tournamentShortName
 * @desc    Get Tournament Player Stats
 * @access  Public
 */
router.get('/players/stats/name/:tournamentShortName', (req, res) => {
    const { tournamentShortName } = req.params;
    console.log(`GET Request Tournament '${tournamentShortName}' Player Stats.`);
    Tournament.getId(tournamentShortName).then((tPId) => {
        if (tPId == null) { return handler.res400s(res, req, `Tournament Name '${tournamentShortName}' Not Found`); }
        Tournament.getPlayerStats(tPId).then((data) => {
            return handler.res200s(res, req, data);
        }).catch((err) => handler.error500s(err, res, "GET Tourney Players Error."));
    }).catch((err) => handler.error500s(err, res, "GET Tourney ID Error."));
});

/**
 * @route   GET api/tournament/v1/teams/stats/name/:tournamentShortName
 * @desc    Get Tournament Team Stats
 * @access  Public
 */
router.get('/teams/stats/name/:tournamentShortName', (req, res) => {
    const { tournamentShortName } = req.params;
    console.log(`GET Request Tournament '${tournamentShortName}' Team Stats.`);
    Tournament.getId(tournamentShortName).then((tPId) => {
        if (tPId == null) { return handler.res400s(res, req, `Tournament Name '${tournamentShortName}' Not Found`); }
        Tournament.getTeamStats(tPId).then((data) => {
            return handler.res200s(res, req, data);
        }).catch((err) => handler.error500s(err, res, "GET Tourney Teams Error."));
    }).catch((err) => handler.error500s(err, res, "GET Tourney ID Error."));
});

/**
 * @route   GET api/tournament/v1/pickbans/name/:tournamentShortName
 * @desc    Get Tournament Pick Ban Data
 * @access  Public
 */
router.get('/pickbans/name/:tournamentShortName', (req, res) => {
    const { tournamentShortName } = req.params;
    console.log(`GET Request Tournament '${tournamentShortName}' Pick Bans.`);
    Tournament.getId(tournamentShortName).then((tPId) => {
        if (tPId == null) { return handler.res400s(res, req, `Tournament Name '${tournamentShortName}' Not Found`); }
        Tournament.getPBStats(tPId).then((data) => {
            return handler.res200s(res, req, data);
        }).catch((err) => handler.error500s(err, res, "GET Tourney Pick Bans Error."));
    }).catch((err) => handler.error500s(err, res, "GET Tourney ID Error."));
});

/**
 * @route   GET api/tournament/v1/games/name/:tournamentShortName
 * @desc    Get Tournament List of Games Played
 * @access  Public
 */
router.get('/games/name/:tournamentShortName', (req, res) => {
    const { tournamentShortName } = req.params;
    console.log(`GET Request Tournament '${tournamentShortName}' Game Log.`);
    Tournament.getId(tournamentShortName).then((tPId) => {
        if (tPId == null) { return handler.res400s(res, req, `Tournament Name '${tournamentShortName}' Not Found`); }
        Tournament.getGames(tPId).then((data) => {
            return handler.res200s(res, req, data);
        }).catch((err) => handler.error500s(err, res, "GET Tourney Games Error."));
    }).catch((err) => handler.error500s(err, res, "GET Tourney ID Error."));
});

/**
 * @route   GET api/tournament/v1/players/ids/name/:tournamentShortName
 * @desc    Get List of unique Player IDs participating in the Tournament
 * @access  Public
 */
router.get('/players/ids/name/:tournamentShortName', (req, res) => {
    const { tournamentShortName } = req.params;
    console.log(`GET Request Tournament '${tournamentShortName}' Player IDs List.`);
    Tournament.getId(tournamentShortName).then((tourneyPId) => {
        if (tourneyPId == null) { return handler.res400s(res, req, `Tournament Name '${tournamentShortName}' Not Found`); }
        Tournament.getPlayerList(tourneyPId).then((playerList) => {
            return handler.res200s(res, req, playerList);
        });
    });
});

/**
 * @route   GET api/tournament/v1/teams/ids/name/:tournamentShortName
 * @desc    Get List of unique Team IDs participating in the Tournament
 * @access  Public
 */
router.get('/teams/ids/name/:tournamentShortName', (req, res) => {
    const { tournamentShortName } = req.params;
    console.log(`GET Request Tournament '${tournamentShortName}' Team IDs List.`);
    Tournament.getId(tournamentShortName).then((tourneyPId) => {
        if (tourneyPId == null) { return handler.res400s(res, req, `Tournament Name '${tournamentShortName}' Not Found`); }
        Tournament.getTeamList(tourneyPId).then((teamList) => {
            return handler.res200s(res, req, teamList);
        });
    });
});

/**
 * @route   PUT api/tournament/v1/update/overall
 * @desc    Update Tournament overall stats
 * @access  Private (Admins only)
 */
router.put('/update/overall', (req, res) => {
    const { tournamentShortName } = req.body;
    console.log(`PUT Request Tournament ${tournamentShortName} Overall Stats.`);
    Tournament.getId(tournamentShortName).then((tourneyPId) => {
        if (tourneyPId == null) { return handler.res400s(res, req, `Tournament Name '${tournamentShortName}' Not Found`); }
        Tournament.putOverallStats(tourneyPId).then((tourneyResponse) => {
            return handler.res200s(res, req, {
                gamesNum: tourneyResponse.gamesUpdated,
                tournamentShortName: tournamentShortName,
                tournamentId: tourneyPId,
            });
        }).catch((err) => handler.error500s(err, res, "PUT Tourney Overall Stats Error."));
    }).catch((err) => handler.error500s(err, res, "GET Tourney ID Error."));
});

/**
 * @route   PUT api/tournament/v1/update/player
 * @desc    Update a Player's stat for the Tournament
 * @access  Private (Admins only)
 */
router.put('/update/player', (req, res) => {
    const { tournamentShortName, playerPId } = req.body;
    console.log(`PUT Request Tournament ${tournamentShortName} Player Stats of ID '${playerPId}'`);
    Tournament.getId(tournamentShortName).then(async (tourneyPId) => {
        if (tourneyPId == null) { return handler.res400s(res, req, `Tournament Name '${tournamentShortName}' Not Found`); }
        try { await Profile.putGameLog(playerPId, tourneyPId) }
        catch (err) { return handler.error500s(err, res, "PUT Profile Game Log Error."); }
        try { await Profile.putStatsLog(playerPId, tourneyPId) }
        catch (err) { return handler.error500s(err, res, "PUT Profile Stats Log Error."); }
        handler.res200s(res, req, {
            'profilePId': playerPId,
            'tournamentShortName': tournamentShortName,
            'tournamentId': tourneyPId,
        });
    }).catch((err) => handler.error500s(err, res, "GET Tourney ID Error."));
});

/**
 * @route   PUT api/tournament/v1/update/team
 * @desc    Update a Team's stat for the Tournament
 * @access  Private (Admins only)
 */
router.put('/update/team', (req, res) => {
    const { tournamentShortName, teamPId } = req.body;
    console.log(`PUT Request Tournament ${tournamentShortName} Team Stats of ID '${teamPId}'`);
    Tournament.getId(tournamentShortName).then(async (tourneyPId) => {
        if (tourneyPId == null) { return handler.res400s(res, req, `Tournament Name '${tournamentShortName}' Not Found`); }
        try { await Team.putGameLog(teamPId, tourneyPId) }
        catch (err) { return handler.error500s(err, res, "PUT Team Game Log Error."); }
        try { await Team.putStatsLog(teamPId, tourneyPId) }
        catch (err) { return handler.error500s(err, res, "PUT Team Stats Log Error."); }
        handler.res200s(res, req, {
            'profilePId': teamPId,
            'tournamentShortName': tournamentShortName,
            'tournamentId': tourneyPId,
        });
    }).catch((err) => handler.error500s(err, res, "GET Tourney ID Error."));
});

//#endregion

module.exports = router;