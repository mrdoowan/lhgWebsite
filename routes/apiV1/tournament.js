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
 * @route   GET api/tournament/v1/players/name/:tournamentShortName
 * @desc    Get Tournament Player Stats
 * @access  Public
 */
router.get('/players/name/:tournamentShortName', (req, res) => {
    const { tournamentShortName } = req.params;
    console.log(`GET Request Tournament '${tournamentShortName}' Players.`);
    Tournament.getId(tournamentShortName).then((tPId) => {
        if (tPId == null) { return handler.res400s(res, req, `Tournament Name '${tournamentShortName}' Not Found`); }
        Tournament.getPlayerStats(tPId).then((data) => {
            return handler.res200s(res, req, data);
        }).catch((err) => handler.error500s(err, res, "GET Tourney Players Error."));
    }).catch((err) => handler.error500s(err, res, "GET Tourney ID Error."));
});

/**
 * @route   GET api/tournament/v1/teams/name/:tournamentShortName
 * @desc    Get Tournament Team Stats
 * @access  Public
 */
router.get('/teams/name/:tournamentShortName', (req, res) => {
    const { tournamentShortName } = req.params;
    console.log(`GET Request Tournament '${tournamentShortName}' Teams.`);
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
    console.log(`GET Request Tournament '${tournamentShortName}' Gane Log.`);
    Tournament.getId(tournamentShortName).then((tPId) => {
        if (tPId == null) { return handler.res400s(res, req, `Tournament Name '${tournamentShortName}' Not Found`); }
        Tournament.getGames(tPId).then((data) => {
            return handler.res200s(res, req, data);
        }).catch((err) => handler.error500s(err, res, "GET Tourney Games Error."));
    }).catch((err) => handler.error500s(err, res, "GET Tourney ID Error."));
});

/**
 * @route   PUT api/tournament/v1/update
 * @desc    Update Tournament overall stats
 * @access  Private (Admins only)
 */
router.put('/update', (req, res) => {
    const { tournamentShortName } = req.body;
    console.log(`PUT Request Tournament ${tournamentShortName} Overall Stats.`);
    Tournament.getId(tournamentShortName).then(async (tourneyPId) => {
        if (tourneyPId == null) { return handler.res400s(res, req, `Tournament Name '${tournamentShortName}' Not Found`); }
        const playerList = await Tournament.getPlayerList(tourneyPId);
        for (let pIdx = 0; pIdx < playerList.length; ++pIdx) {
            const profilePId = playerList[pIdx];
            await Profile.putGameLog(profilePId, tourneyPId);
            await Profile.putStatsLog(profilePId, tourneyPId);
        }
        const teamList = await Tournament.getTeamList(tourneyPId);
        for (let tIdx = 0; tIdx < teamList.length; ++tIdx) {
            const teamPId = teamList[tIdx];
            await Team.putGameLog(teamPId, tourneyPId);
            await Team.putStatsLog(teamPId, tourneyPId);
        }
        const gamesRes = await Tournament.putGamesAndStats(tourneyPId);
        const lbRes = await Tournament.putLeaderboards(tourneyPId);
        return handler.res200s(res, req, {
            playersUpdated: playerList.length,
            teamsUpdated: teamList.length,
            gamesUpdated: gamesRes.gamesUpdated,
            tournamentShortName: tournamentShortName,
            tournamentId: tourneyPId,
        });
    }).catch((err) => handler.error500s(err, res, "PUT Tourney Update Error."));
});

//#endregion

module.exports = router;