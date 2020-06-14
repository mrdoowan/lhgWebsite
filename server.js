// This will be used from the back-end and interface with both APIs
// This calls on LHG's DynamnDB from fast reads

/*  Declaring npm modules */
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
require('dotenv').config();

/*  Import helper Data function modules */
const Season = require('./functions/seasonData');
const Tournament = require('./functions/tournamentData');
const Profile = require('./functions/profileData');
const Team = require('./functions/teamData');
const Match = require('./functions/matchData');
const Staff = require('./functions/staffData');

/*  
    ----------------------
    Response Handlers
    ----------------------
*/

function errorHandler(err, res, errorMessage) {
    return res.status(500).json({
        error: errorMessage,
        reason: err,
    });
}

function res400s(res, req, errorMessage) {
    const code = (req.method === 'POST' || req.method === 'PUT') ? 422 : 404;
    return res.status(code).json({
        error: errorMessage,
    });
}

function res200s(res, req, data) {
    const code = (req.method === 'POST') ? 201 : 200;
    return res.status(code).json(data);
}

/*  
    ----------------------
    User Auth API Requests
    ----------------------
*/
//#region POST Requests - User Auth

// Login
app.post('/api/login/v1', (req, res) => {

});

// Logout
app.post('/api/logout/v1', (req, res) => {

});

//#endregion

/*  
    ----------------------
    League API Requests
    ----------------------
*/
//#region GET Requests - League

app.get('/api/leagues/v1', (req, res) => {
    console.log("GET Request Leagues.");
    Season.getLeagues().then((data) => {
        return res200s(res, req, data);
    }).catch((err) => errorHandler(err, res, "GET Leagues Information Error."));
});

//#endregion

/*  
    ----------------------
    Season API Requests
    ----------------------
*/
//#region GET Requests - Season

app.get('/api/season/v1/information/name/:seasonShortName', (req, res) => {
    const { seasonShortName } = req.params;
    console.log(`GET Request Season '${seasonShortName}' Information.`);
    Season.getId(seasonShortName).then((sPId) => {
        if (sPId == null) { return res400s(res, req, `Season Name '${seasonShortName}' Not Found`); }
        Season.getInfo(sPId).then((data) => {
            return res200s(res, req, data);
        }).catch((err) => errorHandler(err, res, "GET Season Information Error."));
    }).catch((err) => errorHandler(err, res, "GET Season ID Error."));
});

app.get('/api/season/v1/roster/name/:seasonShortName', (req, res) => {
    const { seasonShortName } = req.params;
    console.log(`GET Request Season '${seasonShortName}' Roster.`);
    Season.getId(seasonShortName).then((sPId) => {
        if (sPId == null) { return res400s(res, req, `Season Name '${seasonShortName}' Not Found`); }
        Season.getRoster(sPId).then((data) => {
            return res200s(res, req, data);
        }).catch((err) => errorHandler(err, res, "GET Season Information Error."));
    }).catch((err) => errorHandler(err, res, "GET Season ID Error."));
});

app.get('/api/season/v1/regular/name/:seasonShortName', (req, res) => {
    const { seasonShortName } = req.params;
    console.log(`"GET Request Season '${seasonShortName}' Regular."`);
    Season.getId(seasonShortName).then((sPId) => {
        if (sPId == null) { return res400s(res, req, `Season Name '${seasonShortName}' Not Found`); }
        Season.getRegular(sPId).then((data) => {
            return res200s(res, req, data);
        }).catch((err) => errorHandler(err, res, "GET Season Information Error."));
    }).catch((err) => errorHandler(err, res, "GET Season ID Error."));
});

app.get('/api/season/v1/playoffs/name/:seasonShortName', (req, res) => {
    const { seasonShortName } = req.params;
    console.log(`"GET Request Season '${seasonShortName}' Regular."`);
    Season.getId(seasonShortName).then((sPId) => {
        if (sPId == null) { return res400s(res, req, `Season Name '${seasonShortName}' Not Found`); }
        Season.getPlayoffs(sPId).then((data) => {
            return res200s(res, req, data);
        }).catch((err) => errorHandler(err, res, "GET Season Information Error."));
    }).catch((err) => errorHandler(err, res, "GET Season ID Error."));
});

//#endregion

/*  
    ----------------------
    Profile API Requests
    ----------------------
*/
//#region GET REQUESTS - Profile

app.get('/api/profile/v1/information/name/:profileName', (req, res) => {
    const { profileName } = req.params;
    console.log(`GET Request Profile '${profileName}' Information.`);
    Profile.getIdByName(profileName).then((pPId) => {
        if (pPId == null) { return res400s(res, req, `Profile Name '${profileName}' Not Found`); }
        Profile.getInfo(pPId).then((data) => {
            return res200s(res, req, data);
        }).catch((err) => errorHandler(err, res, "GET Profile Information Error."));
    }).catch((err) => errorHandler(err, res, "GET Profile ID Error."));
});

app.get('/api/profile/v1/games/name/:profileName/:seasonShortName', (req, res) => {
    const { profileName, seasonShortName } = req.params;
    console.log(`GET Request Profile '${profileName}' Game Log from Season '${seasonShortName}'.`);
    Profile.getIdByName(profileName).then((pPId) => {
        if (pPId == null) { return res400s(res, req, `Profile Name '${profileName}' Not Found`); }
        Season.getId(seasonShortName).then((sPId) => {
            if (sPId == null) { return res400s(res, req, `Season Shortname '${seasonShortName}' Not Found`); }
            Profile.getGames(pPId, sPId).then((data) => {
                if (data == null) { return res400s(res, req, `'${profileName}' does not have the Season '${seasonShortName}' logged.`); }
                return res200s(res, req, data);
            }).catch((err) => errorHandler(err, res, "GET Profile Games Error."));
        }).catch((err) => errorHandler(err, res, "GET Season ID Error."));
    }).catch((err) => errorHandler(err, res, "GET Profile ID Error."));
});

app.get('/api/profile/v1/stats/name/:profileName/:tournamentShortName', async (req, res) => {
    const { profileName, tournamentShortName } = req.params;
    console.log(`GET Request Profile '${profileName}' Stats Log from Tournament '${tournamentShortName}'.`);
    Profile.getIdByName(profileName).then((pPId) => {
        if (pPId == null) { return res400s(res, req, `Profile Name '${profileName}' Not Found`); }
        Tournament.getId(tournamentShortName).then((tPId) => {
            if (tPId == null) { return res400s(res, req, `Tournament Shortname '${tournamentShortName}' Not Found`); }
            Profile.getStats(pPId, tPId).then((data) => {
                if (data == null) { return res400s(res, req, `'${profileName}' does not have the Season '${tournamentShortName}' logged.`); }
                return res200s(res, req, data);
            }).catch((err) => errorHandler(err, res, "GET Profile Stats Error."));
        }).catch((err) => errorHandler(err, res, "GET Tournament ID Error."));
    }).catch((err) => errorHandler(err, res, "GET Profile ID Error."));
});

// Latest query
app.get('/api/profile/v1/games/latest/name/:profileName', (req, res) => {
    const { profileName } = req.params;
    console.log(`"GET Request Profile '${profileName}' Game Log from the latest Season."`);
    Profile.getIdByName(profileName).then((pPId) => {
        if (pPId == null) { return res400s(res, req, `Profile Name '${profileName}' Not Found`); }
        Profile.getGames(pPId).then((data) => {
            return res200s(res, req, data);
        }).catch((err) => errorHandler(err, res, "GET Profile Games Error."));
    }).catch((err) => errorHandler(err, res, "GET Profile ID Error."));
});

app.get('/api/profile/v1/stats/latest/name/:profileName', (req, res) => {
    const { profileName } = req.params;
    console.log(`"GET Request Profile '${profileName}' Game Log from the latest Tournament"`);
    Profile.getIdByName(profileName).then((pPId) => {
        if (pPId == null) { return res400s(res, req, `Profile Name '${profileName}' Not Found`); }
        Profile.getStats(pPId).then((data) => {
            return res200s(res, req, data);
        }).catch((err) => errorHandler(err, res, "GET Profile Games Error."));
    }).catch((err) => errorHandler(err, res, "GET Profile ID Error."));
});

//#endregion

//#region POST / PUT REQUESTS - Profile

app.post('/api/profile/v1/add/new', (req, res) => {
    const { profileName, summonerName } = req.body;
    // Check if Profile name already exists.
    Profile.getIdByName(profileName).then((pPId) => {
        if (pPId != null) {
            // Id Found in DB. That means Profile name exists. Reject.
            return res400s(res, req, `Profile '${profileName}' already exists under Profile ID '${pPId}'`);
        }
        // Check if the IGN exists. 
        Profile.getSummonerId(summonerName).then((summId) => {
            if (summId == null) {
                // Summoner Id does not exist
                return res400s(res, req, `Summoner Name '${summonerName}' does not exist.`);
            }
            // Check if summoner Name has its ID already registered. 
            Profile.getIdBySummonerId(summId).then((pPId) => {
                if (pPId != null) {
                    // Profile Id Found in DB. That means Profile name exists with Summoner. Reject.
                    Profile.getName(pPId, false).then((pName) => {
                        return res400s(res, req, `Summoner Name '${summonerName}' already registered under Profile Name '${pName}' and ID '${pPId}'`);
                    }).catch((err) => errorHandler(err, res, "GET Profile Name Error."));
                    return;
                }
                // New Summoner Id found. Make new Profile.
                Profile.postNew(profileName, summId).then((data) => {
                    return res200s(res, req, data);
                }).catch((err) => errorHandler(err, res, "POST Profile Add New Error 1."));
            }).catch((err) => errorHandler(err, res, "POST Profile Add New Error 3."));
        }).catch((err) => errorHandler(err, res, "POST Profile Add New Error 4."));
    });
});

app.put('/api/profile/v1/add/account', (req, res) => {
    const { profileName, summonerName } = req.body;
    Profile.getIdByName(profileName).then((pPId) => {
        if (pPId == null) {
            // Profile does not exist
            return res400s(res, req, `Profile '${profileName}' does not exist.`);
        }
        // Check if the IGN exists. 
        Profile.getSummonerId(summonerName).then((summId) => {
            if (summId == null) {
                // Summoner Id does not exist
                return res400s(res, req, `Summoner Name '${summonerName}' does not exist.`);
            }
            // Check if summoner Name has its ID already registered. 
            Profile.getIdBySummonerId(summId).then((profileIdExist) => {
                if (profileIdExist != null) {
                    // Profile Id Found in DB. That means Profile name exists with Summoner. Reject.
                    Profile.getName(profileIdExist, false).then((pName) => {
                        return res400s(res, req, `Summoner Name '${summonerName}' already registered under Profile Name '${pName}' and ID '${profileIdExist}'`);
                    }).catch((err) => errorHandler(err, res, "PUT Profile Info Error 1."));
                    return;
                }
                // Get Profile Information
                Profile.getInfo(pPId).then((infoData) => {
                    infoData['LeagueAccounts'][summId] = { 'MainAccount': false };
                    Profile.putInfo(pPId, summId, infoData).then((data) => {
                        return res200s(res, req, data);
                    }).catch((err) => errorHandler(err, res, "PUT Profile Info Error 2."));
                }).catch((err) => errorHandler(err, res, "PUT Profile Info Error 3."));
            }).catch((err) => errorHandler(err, res, "PUT Profile Info Error 4."));
        }).catch((err) => errorHandler(err, res, "PUT Profile Info Error 5."));
    }).catch((err) => errorHandler(err, res, "PUT Profile Info Error 6."));
})

// Remove summoner account from Profile.
// BODY EXAMPLE:
// {
//     "profileName": "NAME",
//     "summonerId": "SUMM_ID",
// }
app.put('/api/profile/v1/remove/account', (req, res) => {

})

app.put('/api/profile/v1/update/name', (req, res) => {
    const { currentName, newName } = req.body;
    // Check if currentName and newName exist
    Profile.getIdByName(currentName).then((profileId) => {
        if (profileId == null) {
            // Profile Name does not exist
            return res400s(res, req, `Profile '${currentName}' does not exist.`);
        }
        Profile.getIdByName(newName).then((checkId) => {
            if (checkId != null) {
                // New name already exists in Db
                return res400s(res, req, `New profile name '${newName}' is already taken!`);
            }
            Profile.updateName(profileId, newName, currentName).then((data) => {
                return res200s(res, req, data);
            }).catch((err) => errorHandler(err, res, "PUT Profile Name Change Error 1."));
        }).catch((err) => errorHandler(err, res, "PUT Profile Name Change Error 2."));
    }).catch((err) => errorHandler(err, res, "PUT Profile Name Change Error 3."))
})

app.put('/api/profile/v1/add/staff', (req, res) => {
    Staff.newStaff(req.body).then((response) => {
        return res.status(200).json(response);
    }).catch((err) => errorHandler(err, res, "PUT Profile Add Staff Error."));
});

// Update just password (staff only)
// BODY TEMPLATE:
// {
//     "profile": "NAME",
//     "password": "PASSWORD_HERE",
//     "admin": true,
//     "moderator": true
// }
app.put('/api/profile/v1/update', (req, res) => {

});

// Remove mod/admin powers
// BODY TEMPLATE:
// {
//     "profile": "NAME",
// }
app.put('/api/profile/v1/remove/staff', (req, res) => {

});

//#endregion

/*  
    ----------------------
    Team API Requests
    ----------------------
*/

//#region GET Requests - Team

app.get('/api/team/v1/information/name/:teamName', async (req, res) => {
    const { teamName } = req.params;
    console.log(`GET Request Team '${teamName}' Information.`);
    Team.getId(teamName).then((teamId) => {
        if (teamId == null) { return res400s(res, req, `Team Name '${teamName}' Not Found`); }
        Team.getInfo(teamId).then((data) => {
            return res200s(res, req, data);
        }).catch((err) => errorHandler(err, res, "GET Team Information Error."));
    }).catch((err) => errorHandler(err, res, "GET Team ID Error."));
});

app.get('/api/team/v1/scouting/name/:teamName/:seasonShortName', async (req, res) => {
    const { teamName, seasonShortName } = req.params;
    console.log(`GET Request Team '${teamName}' Scouting from Season '${seasonShortName}'.`);
    Team.getId(teamName).then((teamId) => {
        if (teamId == null) { return res400s(res, req, `Team Name '${teamName}' Not Found`); }
        Season.getId(seasonShortName).then((sPId) => {
            if (sPId == null) { return res400s(res, req, `Season Name '${seasonShortName}' Not Found`); }
            Team.getScouting(teamId, sPId).then((data) => {
                if (data == null) { return res400s(res, req, `'${teamName}' does not have Season '${seasonShortName}' Scouting logged`) }
                return res200s(res, req, data);
            }).catch((err) => errorHandler(err, res, "GET Team Scouting Error."));
        }).catch((err) => errorHandler(err, res, "GET Season ID Error."));
    }).catch((err) => errorHandler(err, res, "GET Team ID Error."));
});

app.get('/api/team/v1/games/name/:teamName/:seasonShortName', async (req, res) => {
    const { teamName, seasonShortName } = req.params;
    console.log(`GET Request Team '${teamName}' Game Log from Season '${seasonShortName}'.`);
    Team.getId(teamName).then((teamId) => {
        if (teamId == null) { return res400s(res, req, `Team Name '${teamName}' Not Found`); }
        Season.getId(seasonShortName).then((sPId) => {
            if (sPId == null) { return res400s(res, req, `Season Name '${seasonShortName}' Not Found`); }
            Team.getGames(teamId, sPId).then((data) => {
                if (data == null) { return res400s(res, req, `'${teamName}' does not have Season '${seasonShortName}' Games logged`); }
                return res200s(res, req, data);
            }).catch((err) => errorHandler(err, res, "GET Team Games Error."));
        }).catch((err) => errorHandler(err, res, "GET Season ID Error."));
    }).catch((err) => errorHandler(err, res, "GET Team ID Error."));
});

app.get('/api/team/v1/stats/name/:teamName/:tournamentName', async (req, res) => {
    const { teamName, tournamentName } = req.params;
    console.log(`GET Request Team '${teamName}' Stats Log from Tournament '${tournamentName}'.`);
    Team.getId(teamName).then((teamId) => {
        if (teamId == null) { return res400s(res, req, `Team Name '${teamName}' Not Found`); }
        Tournament.getId(tournamentName).then((tPId) => {
            if (tPId == null) { return res400s(res, req, `Tournament Name '${tournamentName}' Not Found`); }
            Team.getStats(teamId, tPId).then((data) => {
                if (data == null) { return res400s(res, req, `'${teamName}' does not have Tournament '${tournamentName}' Stats logged`); }
                return res200s(res, req, data);
            }).catch((err) => errorHandler(err, res, "GET Team Stats Error."));
        }).catch((err) => errorHandler(err, res, "GET Tournament ID Error."));
    }).catch((err) => errorHandler(err, res, "GET Team ID Error."));
});

// Latest query
app.get('/api/team/v1/scouting/latest/name/:teamName', async (req, res) => {
    const { teamName } = req.params;
    console.log(`GET Request Team '${teamName}' Scouting from the latest Season.`);
    Team.getId(req.params.teamName).then((teamId) => {
        if (teamId == null) { return res400s(res, req, `Team Name '${teamName}' Not Found`); }
        Team.getScouting(teamId).then((data) => {
            return res200s(res, req, data);
        }).catch((err) => errorHandler(err, res, "GET Team Scouting Error."));
    }).catch((err) => errorHandler(err, res, "GET Team ID Error."));
});

app.get('/api/team/v1/games/latest/name/:teamName', async (req, res) => {
    const { teamName } = req.params;
    console.log(`GET Request Team '${teamName}' Game Log from the latest Season.`);
    Team.getId(teamName).then((teamId) => {
        if (teamId == null) { return res400s(res, req, `Team Name '${teamName}' Not Found`); }
        Team.getGames(teamId).then((data) => {
            return res200s(res, req, data);
        }).catch((err) => errorHandler(err, res, "GET Team Games Error."));
    }).catch((err) => errorHandler(err, res, "GET Team ID Error."));
});

app.get('/api/team/v1/stats/latest/name/:teamName', async (req, res) => {
    const { teamName } = req.params;
    console.log(`GET Request Team '${teamName}' Stats from the latest Season.`);
    Team.getId(teamName).then((teamId) => {
        if (teamId == null) { return res400s(res, req, `Team Name '${teamName}' Not Found`); }
        Team.getStats(teamId).then((data) => {
            return res200s(res, req, data);
        }).catch((err) => errorHandler(err, res, "GET Team Stats Error."));
    }).catch((err) => errorHandler(err, res, "GET Team ID Error."));
});

//#endregion

//#region POST / PUT REQUESTS - Team

app.post('/api/team/v1/add/new', (req, res) => {
    const { teamName, shortName } = req.body;
    // Check if Team Name already exists
    Team.getId(teamName).then((tPId) => {
        if (tPId != null) {
            // Id found in DB. Team name exists. Reject.
            res400s(res, req, `Team '${teamName}' already exists under Team ID '${tPId}'`);
            return;
        }
        Team.postNew(teamName, shortName).then((data) => {
            return res200s(res, req, data);
        }).catch((err) => errorHandler(err, res, "POST Team Add New Error 1"));
    }).catch((err) => errorHandler(err, res, "POST Team Add New Error 2"));
})

//#endregion

/*  
    ----------------------
    Tournament API Requests
    ----------------------
*/

//#region GET Requests - Tournament

app.get('/api/tournament/v1/information/name/:tournamentShortName', async (req, res) => {
    const { tournamentShortName } = req.params;
    console.log("GET Request Tournament '" + tournamentShortName + "' Information.");
    Tournament.getId(tournamentShortName).then((tPId) => {
        if (tPId == null) { return res400s(res, req, `Tournament Name '${tournamentShortName}' Not Found`); }
        Tournament.getInfo(tPId).then((data) => {
            return res200s(res, req, data);
        }).catch((err) => errorHandler(err, res, "GET Tourney Information Error."));
    }).catch((err) => errorHandler(err, res, "GET Tourney ID Error."));
});

app.get('/api/tournament/v1/stats/name/:tournamentShortName', async (req, res) => {
    const { tournamentShortName } = req.params;
    console.log("GET Request Tournament '" + tournamentShortName + "' Tourney Stats.");
    Tournament.getId(tournamentShortName).then((tPId) => {
        if (tPId == null) { return res400s(res, req, `Tournament Name '${tournamentShortName}' Not Found`); }
        Tournament.getTourneyStats(tPId).then((data) => {
            return res200s(res, req, data);
        }).catch((err) => errorHandler(err, res, "GET Tourney Information Error."));
    }).catch((err) => errorHandler(err, res, "GET Tourney ID Error."));
});

app.get('/api/tournament/v1/leaderboards/name/:tournamentShortName', async (req, res) => {
    const { tournamentShortName } = req.params;
    console.log("GET Request Tournament '" + tournamentShortName + "' Leaderboards.");
    Tournament.getId(tournamentShortName).then((tPId) => {
        if (tPId == null) { return res400s(res, req, `Tournament Name '${tournamentShortName}' Not Found`); }
        Tournament.getLeaderboards(tPId).then((data) => {
            return res200s(res, req, data);
        }).catch((err) => errorHandler(err, res, "GET Tourney Leaderboard Error."));
    }).catch((err) => errorHandler(err, res, "GET Tourney ID Error."));
});

app.get('/api/tournament/v1/players/name/:tournamentShortName', async (req, res) => {
    const { tournamentShortName } = req.params;
    console.log("GET Request Tournament '" + tournamentShortName + "' Players.");
    Tournament.getId(tournamentShortName).then((tPId) => {
        if (tPId == null) { return res400s(res, req, `Tournament Name '${tournamentShortName}' Not Found`); }
        Tournament.getPlayerStats(tPId).then((data) => {
            return res200s(res, req, data);
        }).catch((err) => errorHandler(err, res, "GET Tourney Players Error."));
    }).catch((err) => errorHandler(err, res, "GET Tourney ID Error."));
});

app.get('/api/tournament/v1/teams/name/:tournamentShortName', async (req, res) => {
    const { tournamentShortName } = req.params;
    console.log("GET Request Tournament '" + tournamentShortName + "' Teams.");
    Tournament.getId(tournamentShortName).then((tPId) => {
        if (tPId == null) { return res400s(res, req, `Tournament Name '${tournamentShortName}' Not Found`); }
        Tournament.getTeamStats(tPId).then((data) => {
            return res200s(res, req, data);
        }).catch((err) => errorHandler(err, res, "GET Tourney Teams Error."));
    }).catch((err) => errorHandler(err, res, "GET Tourney ID Error."));
});

app.get('/api/tournament/v1/pickbans/name/:tournamentShortName', async (req, res) => {
    const { tournamentShortName } = req.params;
    console.log("GET Request Tournament '" + tournamentShortName + "' Pick Bans.");
    Tournament.getId(tournamentShortName).then((tPId) => {
        if (tPId == null) { return res400s(res, req, `Tournament Name '${tournamentShortName}' Not Found`); }
        Tournament.getPBStats(tPId).then((data) => {
            return res200s(res, req, data);
        }).catch((err) => errorHandler(err, res, "GET Tourney Pick Bans Error."));
    }).catch((err) => errorHandler(err, res, "GET Tourney ID Error."));
});

app.get('/api/tournament/v1/games/name/:tournamentShortName', async (req, res) => {
    const { tournamentShortName } = req.params;
    console.log("GET Request Tournament '" + tournamentShortName + "' Game Log.");
    Tournament.getId(tournamentShortName).then((tPId) => {
        if (tPId == null) { return res400s(res, req, `Tournament Name '${tournamentShortName}' Not Found`); }
        Tournament.getGames(tPId).then((data) => {
            return res200s(res, req, data);
        }).catch((err) => errorHandler(err, res, "GET Tourney Games Error."));
    }).catch((err) => errorHandler(err, res, "GET Tourney ID Error."));
});

//#endregion

/*  
    ----------------------
    Match API Requests
    ----------------------
*/
//#region GET Requests - Match

app.get('/api/match/v1/:matchId', (req, res) => {
    const { matchId } = req.params;
    console.log(`GET Request Match '${matchId}'.`);
    Match.getData(matchId).then((data) => {
        if (data == null) { return res400s(res, req, `Match ID '${matchId}' Not Found`); }
        return res200s(res, req, data);
    }).catch((err) => errorHandler(err, res, "GET Match Data Error."));
});

//#endregion

//#region POST / PUT Requests - Match

app.put('/api/match/v1/players/:matchId', (req, res) => {
    const { matchId } = req.params;
    const { bluePlayers, redPlayers } = req.body;
    console.log(`PUT Request Match '${matchId}' Players`);
    Match.putPlayersFix(bluePlayers, redPlayers, matchId).then((data) => {
        if (data == null) { return res400s(res, req, `Match ID '${matchId}' Not Found`); }
        return res200s(res, req, data);
    }).catch((err) => errorHandler(err, res, "GET Match Data Error."));
});

//#endregion

const port = 5000;
app.listen(port, () => console.log(`Stats server started on port ${port}`));