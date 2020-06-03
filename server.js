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
        res.json(data);
    }).catch(errCode => res.status(errCode).send("GET Leagues Information Error."));
});

//#endregion

/*  
    ----------------------
    Season API Requests
    ----------------------
*/
//#region GET Requests - Season

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
//#region GET REQUESTS - Profile

app.get('/api/profile/v1/information/name/:profileName', (req, res) => {
    console.log("GET Request Profile '" + req.params.profileName + "' Information.");
    Profile.getId(req.params.profileName).then((pPId) => {
        Profile.getInfo(pPId).then((data) => {
            res.json(data);
        }).catch(errCode => res.status(errCode).send("GET Profile Information Error."));
    }).catch(errCode => res.status(errCode).send("GET Profile ID Error."));
});

app.get('/api/profile/v1/games/name/:profileName/:seasonShortName', (req, res) => {
    console.log("GET Request Profile '" + req.params.profileName + "' Game Log from Season '" + req.params.seasonShortName +  "'.");
    Profile.getId(req.params.profileName).then((pPId) => {
        Season.getId(req.params.seasonShortName).then((sPId) => {
            Profile.getGames(pPId, sPId).then((data) => {
                res.json(data);
            }).catch(errCode => res.status(errCode).send("GET Profile Games Error."));
        }).catch(errCode => res.status(errCode).send("GET Season ID Error."));
    }).catch(errCode => res.status(errCode).send("GET Profile ID Error."));
});

app.get('/api/profile/v1/stats/name/:profileName/:tournamentShortName', async (req, res) => {
    console.log("GET Request Profile '" + req.params.profileName + "' Stats Log from Tournament '" + req.params.tournamentShortName +  "'.");
    Profile.getId(req.params.profileName).then((pPId) => {
        Tournament.getId(req.params.tournamentShortName).then((tPId) => {
            Profile.getStats(pPId, tPId).then((data) => {
                res.json(data);
            }).catch(errCode => res.status(errCode).send("GET Profile Stats Error."));
        }).catch(errCode => res.status(errCode).send("GET Tournament ID Error."));
    }).catch(errCode => res.status(errCode).send("GET Profile ID Error."));
});

// Latest query
app.get('/api/profile/v1/games/latest/name/:profileName', (req, res) => {
    console.log("GET Request Profile '" + req.params.profileName + "' Game Log from the latest Season.");
    Profile.getId(req.params.profileName).then((pPId) => {
        Profile.getGames(pPId).then((data) => {
            res.json(data);
        }).catch(errCode => res.status(errCode).send("GET Profile Games Error."));
    }).catch(errCode => res.status(errCode).send("GET Profile ID Error."));
});

app.get('/api/profile/v1/stats/latest/name/:profileName', (req, res) => {
    console.log("GET Request Profile '" + req.params.profileName + "' Game Log from the latest Tournament");
    Profile.getId(req.params.profileName).then((pPId) => {
        Profile.getStats(pPId).then((data) => {
            res.json(data);
        }).catch(errCode => res.status(errCode).send("GET Profile Games Error."));
    }).catch(errCode => res.status(errCode).send("GET Profile ID Error."));
});

//#endregion

//#region POST REQUESTS - Profile

// Add new profiles and its summoner accounts. 
// First Summoner listed will automatically be flagged as 'main'
// BODY EXAMPLE:
// {
//     "profile": "NAME",
//     "summonerNames": [],
// }
app.post('/api/profile/v1/add/new', (req, res) => {
    // Check if Profile name already exists. If it does, reject.
    Profile.getId(req.body.profile).then((pPId) => {
        // Id Found. That means Profile name exists
        
    })
    // Check if each summoner Name has its ID already registered. 
    // If it does, reject and respond with what Profile it conflicts.

    // Generate a new Profile ID

    // Add to "Profile" and "ProfileNameMap" Table

    // Add to "SummonerIdMap" Table

    // Cache set Key: PROFILE_INFO_PREFIX
})

// Add summoner accounts to profile. Summoner will not be flagged as 'main'
// BODY EXAMPLE:
// {
//     "profile": "NAME",
//     "summonerNames": [],
// }
app.put('/api/profile/v1/add/account', (req, res) => {

})

// Remove summoner accounts from Profile.
// BODY EXAMPLE:
// {
//     "profile": "NAME",
//     "summonerNames": [],
// }
app.put('/api/profile/v1/remove/account', (req, res) => {

})

// Update a Profile Name.
// BODY EXAMPLE:
// {
//     "currentProfile": "OLD_NAME",
//     "newProfile": "NEW_NAME",
// }
app.put('/api/profile/v1/update/name', (req, res) => {

})

// Add Staff and give credentials
// BODY TEMPLATE:
// {
//     "profile": "NAME",
//     "password": "PASSWORD_HERE",
//     "admin": true,
//     "moderator": true
// }
app.put('/api/profile/v1/add/staff', (req, res) => {
    Staff.newStaff(req.body).then((response) => {
        res.json(response);
    }).catch(errCode => res.status(errCode).send("PUT Profile Add Staff Error."));
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
    console.log("GET Request Team '" + req.params.teamName + "' Information.");
    Team.getId(req.params.teamName).then((teamId) => {
        Team.getInfo(teamId).then((data) => {
            res.json(data);
        }).catch(errCode => res.status(errCode).send("GET Team Information Error."));
    }).catch(errCode => res.status(errCode).send("GET Team ID Error."));
});

app.get('/api/team/v1/scouting/name/:teamName/:seasonShortName', async (req, res) => {
    console.log("GET Request Team '" + req.params.teamName + "' Scouting from Season '" + req.params.seasonShortName +  "'.");
    Team.getId(req.params.teamName).then((teamId) => {
        Season.getId(req.params.seasonShortName).then((sPId) => {
            Team.getScouting(teamId, sPId).then((data) => {
                res.json(data);
            }).catch(errCode => res.status(errCode).send("GET Team Scouting Error."));
        }).catch(errCode => res.status(errCode).send("GET Season ID Error."));
    }).catch(errCode => res.status(errCode).send("GET Team ID Error."));
});

app.get('/api/team/v1/games/name/:teamName/:seasonShortName', async (req, res) => {
    console.log("GET Request Team '" + req.params.teamName + "' Game Log from Season '" + req.params.seasonShortName +  "'.");
    Team.getId(req.params.teamName).then((teamId) => {
        Season.getId(req.params.seasonShortName).then((sPId) => {
            Team.getGames(teamId, sPId).then((data) => {
                res.json(data);
            }).catch(errCode => res.status(errCode).send("GET Team Games Error."));
        }).catch(errCode => res.status(errCode).send("GET Season ID Error."));
    }).catch(errCode => res.status(errCode).send("GET Team ID Error."));
});

app.get('/api/team/v1/stats/name/:teamName/:tournamentName', async (req, res) => {
    console.log("GET Request Team '" + req.params.teamName + "' Stats Log from Tournament '" + req.params.tournamentName +  "'.");
    Team.getId(req.params.teamName).then((teamId) => {
        Tournament.getId(req.params.tournamentName).then((tPId) => {
            Team.getStats(teamId, tPId).then((data) => {
                res.json(data);
            }).catch(errCode => res.status(errCode).send("GET Team Stats Error."));
        }).catch(errCode => res.status(errCode).send("GET Tournament ID Error."));
    }).catch(errCode => res.status(errCode).send("GET Team ID Error."));
});

// Latest query
app.get('/api/team/v1/scouting/latest/name/:teamName', async (req, res) => {
    console.log("GET Request Team '" + req.params.teamName + "' Scouting from the latest Season.");
    Team.getId(req.params.teamName).then((teamId) => {
        Team.getScouting(teamId).then((data) => {
            res.json(data);
        }).catch(errCode => res.status(errCode).send("GET Team Scouting Error."));
    }).catch(errCode => res.status(errCode).send("GET Team ID Error."));
});

app.get('/api/team/v1/games/latest/name/:teamName', async (req, res) => {
    console.log("GET Request Team '" + req.params.teamName + "' Game Log from the latest Season.");
    Team.getId(req.params.teamName).then((teamId) => {
        Team.getGames(teamId).then((data) => {
            res.json(data);
        }).catch(errCode => res.status(errCode).send("GET Team Games Error."));
    }).catch(errCode => res.status(errCode).send("GET Team ID Error."));
});

app.get('/api/team/v1/stats/latest/name/:teamName', async (req, res) => {
    console.log("GET Request Team '" + req.params.teamName + "' Game Log from the latest Season.");
    Team.getId(req.params.teamName).then((teamId) => {
        Team.getStats(teamId).then((data) => {
            res.json(data);
        }).catch(errCode => res.status(errCode).send("GET Team Stats Error."));
    }).catch(errCode => res.status(errCode).send("GET Team ID Error."));
});

//#endregion

/*  
    ----------------------
    Tournament API Requests
    ----------------------
*/

//#region GET Requests - Tournament

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
//#region GET Requests - Match

app.get('/api/match/v1/:matchId', (req, res) => {
    console.log("GET Request Match '" + req.params.matchId + "'.");
    Match.getData(req.params.matchId).then((data) => {
        res.json(data);
    }).catch(errCode => res.status(errCode).send("GET Match Data Error."));
});

//#endregion

const port = 5000;

app.listen(port, () => console.log(`Stats server started on port ${port}`));