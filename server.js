// This will be used for the back-end and interface with both APIs
// This calls on LHG's DynamnDB for fast reads

/*  Declaring npm modules */
const express = require('express');
const app = express();
require('dotenv').config();

/*  Import helper Data function modules */
const Season = require('./functions/seasonData');
const Tournament = require('./functions/tournamentData');
const Profile = require('./functions/profileData');
const Team = require('./functions/teamData');
const Match = require('./functions/matchData');

/*  
    ----------------------
    League API Requests
    ----------------------
*/
//#region League

app.get('/api/leagues/v1', (req, res) => {
    console.log("GET Request Leagues.");
    Season.getLeagues().then((data) => {
        res.json(data);
    }).catch(errCode => res.status(errCode).send("GET Leagues Information Error."));
});

//#endregion

/*  
    ----------------------
    Season API Requests
    ----------------------
*/
//#region Season

app.get('/api/season/v1/information/name/:seasonShortName', (req, res) => {
    console.log("GET Request Season '" + req.params.seasonShortName + "' Information.");
    Season.getId(req.params.seasonShortName).then((sPId) => {
        Season.getInfo(sPId).then((data) => {
            res.json(data);
        }).catch(errCode => res.status(errCode).send("GET Season Information Error."))
    }).catch(errCode => res.status(errCode).send("GET Season ID Error."));
});

app.get('/api/season/v1/roster/name/:seasonShortName', (req, res) => {
    console.log("GET Request Season '" + req.params.seasonShortName + "' Roster.");
    Season.getId(req.params.seasonShortName).then((sPId) => {
        Season.getRoster(sPId).then((data) => {
            res.json(data);
        }).catch(errCode => res.status(errCode).send("GET Season Information Error."));
    }).catch(errCode => res.status(errCode).send("GET Season ID Error."));
});

app.get('/api/season/v1/regular/name/:seasonShortName', (req, res) => {
    console.log("GET Request Season '" + req.params.seasonShortName + "' Regular.");
    Season.getId(req.params.seasonShortName).then((sPId) => {
        Season.getRegular(sPId).then((data) => {
            res.json(data);
        }).catch(errCode => res.status(errCode).send("GET Season Information Error."));
    }).catch(errCode => res.status(errCode).send("GET Season ID Error."));
});

app.get('/api/season/v1/playoffs/name/:seasonShortName', (req, res) => {
    console.log("GET Request Season '" + req.params.seasonShortName + "' Playoffs.");
    Season.getId(req.params.seasonShortName).then((sPId) => {
        Season.getPlayoffs(sPId).then((data) => {
            res.json(data);
        }).catch(errCode => res.status(errCode).send("GET Season Information Error."));
    }).catch(errCode => res.status(errCode).send("GET Season ID Error."));
});

//#endregion

/*  
    ----------------------
    Profile API Requests
    ----------------------
*/
//#region Profile

app.get('/api/profile/v1/information/name/:profileName', (req, res) => {
    console.log("GET Request Profile '" + req.params.profileName + "' Information.");
    Profile.getId(req.params.profileName).then((pPId) => {
        Profile.getInfo(pPId).then((data) => {
            res.json(data);
        }).catch(errCode => res.status(errCode).send("GET Profile Information Error."));
    }).catch(errCode => res.status(errCode).send("GET Profile ID Error."));
});

app.get('/api/profile/v1/games/name/:profileName/:seasonShortName', (req, res) => {
    console.log("GET Request Profile '" + req.params.profileName + "' Game Log for Season '" + req.params.seasonShortName +  "'.");
    Profile.getId(req.params.profileName).then((pPId) => {
        Season.getId(req.params.seasonShortName).then((sPId) => {
            Profile.getGames(pPId, sPId).then((data) => {
                res.json(data);
            }).catch(errCode => res.status(errCode).send("GET Profile Games Error."));
        }).catch(errCode => res.status(errCode).send("GET Season ID Error."));
    }).catch(errCode => res.status(errCode).send("GET Profile ID Error."));
});

app.get('/api/profile/v1/stats/name/:profileName/:tournamentShortName', async (req, res) => {
    console.log("GET Request Profile '" + req.params.profileName + "' Stats Log for Tournament '" + req.params.tournamentShortName +  "'.");
    Profile.getId(req.params.profileName).then((pPId) => {
        Tournament.getId(req.params.tournamentShortName).then((tPId) => {
            Profile.getStats(pPId, tPId).then((data) => {
                res.json(data);
            }).catch(errCode => res.status(errCode).send("GET Profile Stats Error."));
        }).catch(errCode => res.status(errCode).send("GET Tournament ID Error."));
    }).catch(errCode => res.status(errCode).send("GET Profile ID Error."));
});

//#endregion

/*  
    ----------------------
    Team API Requests
    ----------------------
*/

//#region Team

app.get('/api/team/v1/information/name/:teamName', async (req, res) => {
    console.log("GET Request Team '" + req.params.teamName + "' Information.");
    Team.getId(req.params.teamName).then((teamId) => {
        Team.getInfo(teamId).then((data) => {
            res.json(data);
        }).catch(errCode => res.status(errCode).send("GET Team Information Error."));
    }).catch(errCode => res.status(errCode).send("GET Team ID Error."));
});

app.get('/api/team/v1/scouting/name/:teamName/:seasonShortName', async (req, res) => {
    console.log("GET Request Team '" + req.params.teamName + "' Scouting for Season '" + req.params.seasonShortName +  "'.");
    Team.getId(req.params.teamName).then((teamId) => {
        Season.getId(req.params.seasonShortName).then((sPId) => {
            Team.getScouting(teamId, sPId).then((data) => {
                res.json(data);
            }).catch(errCode => res.status(errCode).send("GET Team Scouting Error."));
        }).catch(errCode => res.status(errCode).send("GET Season ID Error."));
    }).catch(errCode => res.status(errCode).send("GET Team ID Error."));
});

app.get('/api/team/v1/games/name/:teamName/:seasonShortName', async (req, res) => {
    console.log("GET Request Team '" + req.params.teamName + "' Game Log for Season '" + req.params.seasonShortName +  "'.");
    Team.getId(req.params.teamName).then((teamId) => {
        Season.getId(req.params.seasonShortName).then((sPId) => {
            Team.getGames(teamId, sPId).then((data) => {
                res.json(data);
            }).catch(errCode => res.status(errCode).send("GET Team Games Error."));
        }).catch(errCode => res.status(errCode).send("GET Season ID Error."));
    }).catch(errCode => res.status(errCode).send("GET Team ID Error."));
});

app.get('/api/team/v1/stats/name/:teamName/:tournamentName', async (req, res) => {
    console.log("GET Request Team '" + req.params.teamName + "' Stats Log for Tournament '" + req.params.tournamentName +  "'.");
    Team.getId(req.params.teamName).then((teamId) => {
        Tournament.getId(req.params.tournamentName).then((tPId) => {
            Team.getStats(teamId, tPId).then((data) => {
                res.json(data);
            }).catch(errCode => res.status(errCode).send("GET Team Stats Error."));
        }).catch(errCode => res.status(errCode).send("GET Tournament ID Error."));
    }).catch(errCode => res.status(errCode).send("GET Team ID Error."));
});

//#endregion

/*  
    ----------------------
    Tournament API Requests
    ----------------------
*/

//#region Tournament

app.get('/api/tournament/v1/information/name/:tournamentShortName', async (req, res) => {
    console.log("GET Request Tournament '" + req.params.tournamentShortName + "' Information.");
    Tournament.getId(req.params.tournamentShortName).then((tPId) => {
        Tournament.getInfo(tPId).then((data) => {
            res.json(data);
        }).catch(errCode => res.status(errCode).send("GET Tourney Information Error."));
    }).catch(errCode => res.status(errCode).send("GET Tourney ID Error."));
});

app.get('/api/tournament/v1/stats/name/:tournamentShortName', async (req, res) => {
    console.log("GET Request Tournament '" + req.params.tournamentShortName + "' Tourney Stats.");
    Tournament.getId(req.params.tournamentShortName).then((tPId) => {
        Tournament.getTourneyStats(tPId).then((data) => {
            res.json(data);
        }).catch(errCode => res.status(errCode).send("GET Tourney Information Error."));
    }).catch(errCode => res.status(errCode).send("GET Tourney ID Error."));
});

app.get('/api/tournament/v1/leaderboards/name/:tournamentShortName', async (req, res) => {
    console.log("GET Request Tournament '" + req.params.tournamentShortName + "' Leaderboards.");
    Tournament.getId(req.params.tournamentShortName).then((tPId) => {
        Tournament.getLeaderboards(tPId).then((data) => {
            res.json(data);
        }).catch(errCode => res.status(errCode).send("GET Tourney Leaderboard Error."));
    }).catch(errCode => res.status(errCode).send("GET Tourney ID Error."));
});

app.get('/api/tournament/v1/players/name/:tournamentShortName', async (req, res) => {
    console.log("GET Request Tournament '" + req.params.tournamentShortName + "' Players.");
    Tournament.getId(req.params.tournamentShortName).then((tPId) => {
        Tournament.getPlayerStats(tPId).then((data) => {
            res.json(data);
        }).catch(errCode => res.status(errCode).send("GET Tourney Players Error."));
    }).catch(errCode => res.status(errCode).send("GET Tourney ID Error."));
});

app.get('/api/tournament/v1/teams/name/:tournamentShortName', async (req, res) => {
    console.log("GET Request Tournament '" + req.params.tournamentShortName + "' Teams.");
    Tournament.getId(req.params.tournamentShortName).then((tPId) => {
        Tournament.getTeamStats(tPId).then((data) => {
            res.json(data);
        }).catch(errCode => res.status(errCode).send("GET Tourney Teams Error."));
    }).catch(errCode => res.status(errCode).send("GET Tourney ID Error."));
});

app.get('/api/tournament/v1/pickbans/name/:tournamentShortName', async (req, res) => {
    console.log("GET Request Tournament '" + req.params.tournamentShortName + "' Pick Bans.");
    Tournament.getId(req.params.tournamentShortName).then((tPId) => {
        Tournament.getPBStats(tPId).then((data) => {
            res.json(data);
        }).catch(errCode => res.status(errCode).send("GET Tourney Pick Bans Error."));
    }).catch(errCode => res.status(errCode).send("GET Tourney ID Error."));
});

app.get('/api/tournament/v1/games/name/:tournamentShortName', async (req, res) => {
    console.log("GET Request Tournament '" + req.params.tournamentShortName + "' Game Log.");
    Tournament.getId(req.params.tournamentShortName).then((tPId) => {
        Tournament.getGames(tPId).then((data) => {
            res.json(data);
        }).catch(errCode => res.status(errCode).send("GET Tourney Games Error."));
    }).catch(errCode => res.status(errCode).send("GET Tourney ID Error."));
});

//#endregion

/*  
    ----------------------
    Match API Requests
    ----------------------
*/
//#region Match

app.get('/api/match/v1/:matchId', (req, res) => {
    console.log("GET Request Match '" + req.params.matchId + "'.");
    Match.getData(req.params.matchId).then((data) => {
        res.json(data);
    }).catch(errCode => res.status(errCode).send("GET Match Data Error."));
});

//#endregion

const port = 5000;

app.listen(port, () => console.log(`Stats server started on port ${port}`));