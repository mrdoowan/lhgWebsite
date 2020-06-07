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
const helper = require('./functions/helper');
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
        return res.status(200).json(data);
    }).catch((err) => res.status(500).json({ error: "GET Leagues Information Error.", reason: err }));
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
        if (sPId == null) { return res.status(404).json({ error: `Season Name '${seasonShortName}' Not Found` }) }
        Season.getInfo(sPId).then((data) => {
            return res.status(200).json(data);
        }).catch(errCode => res.status(errCode).json({ error: "GET Season Information Error." }))
    }).catch(errCode => res.status(errCode).json({ error: "GET Season ID Error." }));
});

app.get('/api/season/v1/roster/name/:seasonShortName', (req, res) => {
    const { seasonShortName } = req.params;
    console.log(`GET Request Season '${seasonShortName}' Roster.`);
    Season.getId(seasonShortName).then((sPId) => {
        if (sPId == null) { return res.status(404).json({ error: `Season Name '${seasonShortName}' Not Found` }) }
        Season.getRoster(sPId).then((data) => {
            return res.status(200).json(data);
        }).catch(errCode => res.status(errCode).json({ error: "GET Season Information Error." }));
    }).catch(errCode => res.status(errCode).json({ error: "GET Season ID Error." }));
});

app.get('/api/season/v1/regular/name/:seasonShortName', (req, res) => {
    const { seasonShortName } = req.params;
    console.log(`"GET Request Season '${seasonShortName}' Regular."`);
    Season.getId(seasonShortName).then((sPId) => {
        if (sPId == null) { return res.status(404).json({ error: `Season Name '${seasonShortName}' Not Found` }) }
        Season.getRegular(sPId).then((data) => {
            return res.status(200).json(data);
        }).catch(errCode => res.status(errCode).json({ error: "GET Season Information Error." }));
    }).catch(errCode => res.status(errCode).json({ error: "GET Season ID Error." }));
});

app.get('/api/season/v1/playoffs/name/:seasonShortName', (req, res) => {
    const { seasonShortName } = req.params;
    console.log(`"GET Request Season '${seasonShortName}' Regular."`);
    Season.getId(seasonShortName).then((sPId) => {
        if (sPId == null) { return res.status(404).json({ error: `Season Name '${seasonShortName}' Not Found` }) }
        Season.getPlayoffs(sPId).then((data) => {
            return res.status(200).json(data);
        }).catch(errCode => res.status(errCode).json({ error: "GET Season Information Error." }));
    }).catch(errCode => res.status(errCode).json({ error: "GET Season ID Error." }));
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
        if (pPId == null) { return res.status(404).json({ error: `Profile Name '${profileName}' Not Found` }); }
        Profile.getInfo(pPId).then((data) => {
            return res.status(200).json(data);
        }).catch((err) => res.status(500).json({ error: "GET Profile Information Error.", reason: err }));
    }).catch((err) => res.status(500).json({ error: "GET Profile ID Error.", reason: err }));
});

app.get('/api/profile/v1/games/name/:profileName/:seasonShortName', (req, res) => {
    const { profileName, seasonShortName } = req.params;
    console.log(`GET Request Profile '${profileName}' Game Log from Season '${seasonShortName}'.`);
    Profile.getIdByName(profileName).then((pPId) => {
        if (pPId == null) { return res.status(404).json({ error: `Profile Name '${profileName}' Not Found` }); }
        Season.getId(seasonShortName).then((sPId) => {
            if (sPId == null) { return res.status(404).json({ error: `Season Shortname '${seasonShortName}' Not Found` }); }
            Profile.getGames(pPId, sPId).then((data) => {
                if (data == null) { return res.status(404).json({ error: `'${profileName}' does not have the Season '${seasonShortName}' logged.` }) }
                return res.status(200).json(data);
            }).catch((err) => res.status(500).json({ error: "GET Profile Games Error.", reason: err }));
        }).catch((err) => res.status(500).json({ error: "GET Season ID Error.", reason: err }));
    }).catch((err) => res.status(500).json({ error: "GET Profile ID Error.", reason: err }));
});

app.get('/api/profile/v1/stats/name/:profileName/:tournamentShortName', async (req, res) => {
    const { profileName, tournamentShortName } = req.params;
    console.log(`GET Request Profile '${profileName}' Stats Log from Tournament '${tournamentShortName}'.`);
    Profile.getIdByName(profileName).then((pPId) => {
        if (pPId == null) { return res.status(404).json({ error: `Profile Name '${profileName}' Not Found` }); }
        Tournament.getId(tournamentShortName).then((tPId) => {
            if (tPId == null) { return res.status(404).json({ error: `Tournament Shortname '${tournamentShortName}' Not Found` }); }
            Profile.getStats(pPId, tPId).then((data) => {
                if (data == null) { return res.status(404).json({ error: `'${profileName}' does not have the Season '${tournamentShortName}' logged.` }) }
                return res.status(200).json(data);
            }).catch((err) => res.status(500).json({ error: "GET Profile Stats Error.", reason: err }));
        }).catch((err) => res.status(500).json({ error: "GET Tournament ID Error.", reason: err }));
    }).catch((err) => res.status(500).json({ error: "GET Profile ID Error.", reason: err }));
});

// Latest query
app.get('/api/profile/v1/games/latest/name/:profileName', (req, res) => {
    const { profileName } = req.params;
    console.log(`"GET Request Profile '${profileName}' Game Log from the latest Season."`);
    Profile.getIdByName(profileName).then((pPId) => {
        if (pPId == null) { return res.status(404).json({ error: `Profile Name '${profileName}' Not Found` }); }
        Profile.getGames(pPId).then((data) => {
            return res.status(200).json(data);
        }).catch((err) => res.status(500).json({ error: "GET Profile Games Error.", reason: err }));
    }).catch((err) => res.status(500).json({ error: "GET Profile ID Error.", reason: err }));
});

app.get('/api/profile/v1/stats/latest/name/:profileName', (req, res) => {
    const { profileName } = req.params;
    console.log(`"GET Request Profile '${profileName}' Game Log from the latest Tournament"`);
    Profile.getIdByName(profileName).then((pPId) => {
        if (pPId == null) { return res.status(404).json({ error: `Profile Name '${profileName}' Not Found` }); }
        Profile.getStats(pPId).then((data) => {
            return res.status(200).json(data);
        }).catch((err) => res.status(500).json({ error: "GET Profile Games Error.", reason: err }));
    }).catch((err) => res.status(500).json({ error: "GET Profile ID Error.", reason: err }));
});

//#endregion

//#region POST / PUT REQUESTS - Profile

// Add new profiles and its summoner accounts. 
// First Summoner listed will automatically be flagged as 'main'
// BODY EXAMPLE:
// {
//     "profileName": "NAME",
//     "summonerName": "SUMM_NAME",
// }
app.post('/api/profile/v1/add/new', (req, res) => {
    const { profileName, summonerName } = req.body;
    // Check if Profile name already exists.
    Profile.getIdByName(profileName).then((pPId) => {
        if (pPId != null) {
            // Id Found in DB. That means Profile name exists. Reject.
            return res.status(422).json({ error: `Profile '${profileName}' already exists under Profile ID '${pPId}'` });
        }
        // Check if summoner Name has its ID already registered. 
        Profile.getSummonerId(summonerName).then((summId) => {
            if (summId != null) {
                return res.status(422).json({ error: `Summoner Name '${summonerName}' does not exist.` });
            }
            Profile.getIdBySummonerId(summId).then((pPId) => {
                if (pPId != null) {
                    // Profile Id Found in DB. That means Profile name exists with Summoner. Reject.
                    Profile.getName(pPId, false).then((pName) => {
                        return res.status(422).json({ error: `Summoner Name '${summonerName}' already registered under Profile Name '${pName}' and ID '${pPId}'` });
                    }).catch((err) => res.status(500).json({ error: "GET Profile Name Error.", reason: err }));
                    return;
                }
                // New Summoner Id found. Generate a new Profile ID
                helper.generateNewPId('Profile').then((newPId) => {
                    // Add to "Profile", "ProfileNameMap", "SummonerIdMap" Table
                    let newProfileItem = {
                        'Information': {
                            'LeagueAccounts': {
                                [summId]: {
                                    'MainAccount': true,
                                }
                            },
                            'ProfileName': profileName,
                        },
                        'ProfileName': profileName,
                        'ProfilePId': newPId,
                    };
                    Profile.postNew(newProfileItem, newPId, summId).then((data) => {
                        return res.status(200).json(data);
                    }).catch((err) => { res.status(500).json({ error: "POST Profile Add New Error 1. ", reason: err }) });
                }).catch((err) => { res.status(500).json({ error: "POST Profile Add New Error 2. ", reason: err }) });
            }).catch((err) => { res.status(500).json({ error: "POST Profile Add New Error 3. ", reason: err }) });
        }).catch((err) => { res.status(422).json({ error: `Summoner Name '${summonerName}' does not exist.` }) });
    });
});

// Add summoner accounts to profile. Summoner will not be flagged as 'main'
// BODY EXAMPLE:
// {
//     "profileName": "NAME",
//     "summonerName": [],
// }
app.put('/api/profile/v1/add/account', (req, res) => {

})

// Remove summoner accounts from Profile.
// BODY EXAMPLE:
// {
//     "profileName": "NAME",
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
        return res.status(200).json(response);
    }).catch(errCode => res.status(errCode).json({ error: "PUT Profile Add Staff Error." }));
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
        
        Team.getInfo(teamId).then((data) => {
            return res.status(200).json(data);
        }).catch(errCode => res.status(errCode).json({ error: "GET Team Information Error." }));
    }).catch(errCode => res.status(errCode).json({ error: "GET Team ID Error." }));
});

app.get('/api/team/v1/scouting/name/:teamName/:seasonShortName', async (req, res) => {
    console.log("GET Request Team '" + req.params.teamName + "' Scouting from Season '" + req.params.seasonShortName +  "'.");
    Team.getId(req.params.teamName).then((teamId) => {
        Season.getId(req.params.seasonShortName).then((sPId) => {
            Team.getScouting(teamId, sPId).then((data) => {
                return res.status(200).json(data);
            }).catch(errCode => res.status(errCode).json({ error: "GET Team Scouting Error." }));
        }).catch(errCode => res.status(errCode).json({ error: "GET Season ID Error." }));
    }).catch(errCode => res.status(errCode).json({ error: "GET Team ID Error." }));
});

app.get('/api/team/v1/games/name/:teamName/:seasonShortName', async (req, res) => {
    console.log("GET Request Team '" + req.params.teamName + "' Game Log from Season '" + req.params.seasonShortName +  "'.");
    Team.getId(req.params.teamName).then((teamId) => {
        Season.getId(req.params.seasonShortName).then((sPId) => {
            Team.getGames(teamId, sPId).then((data) => {
                return res.status(200).json(data);
            }).catch(errCode => res.status(errCode).json({ error: "GET Team Games Error." }));
        }).catch(errCode => res.status(errCode).json({ error: "GET Season ID Error." }));
    }).catch(errCode => res.status(errCode).json({ error: "GET Team ID Error." }));
});

app.get('/api/team/v1/stats/name/:teamName/:tournamentName', async (req, res) => {
    console.log("GET Request Team '" + req.params.teamName + "' Stats Log from Tournament '" + req.params.tournamentName +  "'.");
    Team.getId(req.params.teamName).then((teamId) => {
        Tournament.getId(req.params.tournamentName).then((tPId) => {
            Team.getStats(teamId, tPId).then((data) => {
                return res.status(200).json(data);
            }).catch(errCode => res.status(errCode).json({ error: "GET Team Stats Error." }));
        }).catch(errCode => res.status(errCode).json({ error: "GET Tournament ID Error." }));
    }).catch(errCode => res.status(errCode).json({ error: "GET Team ID Error." }));
});

// Latest query
app.get('/api/team/v1/scouting/latest/name/:teamName', async (req, res) => {
    console.log("GET Request Team '" + req.params.teamName + "' Scouting from the latest Season.");
    Team.getId(req.params.teamName).then((teamId) => {
        Team.getScouting(teamId).then((data) => {
            return res.status(200).json(data);
        }).catch(errCode => res.status(errCode).json({ error: "GET Team Scouting Error." }));
    }).catch(errCode => res.status(errCode).json({ error: "GET Team ID Error." }));
});

app.get('/api/team/v1/games/latest/name/:teamName', async (req, res) => {
    console.log("GET Request Team '" + req.params.teamName + "' Game Log from the latest Season.");
    Team.getId(req.params.teamName).then((teamId) => {
        Team.getGames(teamId).then((data) => {
            return res.status(200).json(data);
        }).catch(errCode => res.status(errCode).json({ error: "GET Team Games Error." }));
    }).catch(errCode => res.status(errCode).json({ error: "GET Team ID Error." }));
});

app.get('/api/team/v1/stats/latest/name/:teamName', async (req, res) => {
    console.log("GET Request Team '" + req.params.teamName + "' Game Log from the latest Season.");
    Team.getId(req.params.teamName).then((teamId) => {
        Team.getStats(teamId).then((data) => {
            return res.status(200).json(data);
        }).catch(errCode => res.status(errCode).json({ error: "GET Team Stats Error." }));
    }).catch(errCode => res.status(errCode).json({ error: "GET Team ID Error." }));
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
            return res.status(200).json(data);
        }).catch(errCode => res.status(errCode).json({ error: "GET Tourney Information Error." }));
    }).catch(errCode => res.status(errCode).json({ error: "GET Tourney ID Error." }));
});

app.get('/api/tournament/v1/stats/name/:tournamentShortName', async (req, res) => {
    console.log("GET Request Tournament '" + req.params.tournamentShortName + "' Tourney Stats.");
    Tournament.getId(req.params.tournamentShortName).then((tPId) => {
        Tournament.getTourneyStats(tPId).then((data) => {
            return res.status(200).json(data);
        }).catch(errCode => res.status(errCode).json({ error: "GET Tourney Information Error." }));
    }).catch(errCode => res.status(errCode).json({ error: "GET Tourney ID Error." }));
});

app.get('/api/tournament/v1/leaderboards/name/:tournamentShortName', async (req, res) => {
    console.log("GET Request Tournament '" + req.params.tournamentShortName + "' Leaderboards.");
    Tournament.getId(req.params.tournamentShortName).then((tPId) => {
        Tournament.getLeaderboards(tPId).then((data) => {
            return res.status(200).json(data);
        }).catch(errCode => res.status(errCode).json({ error: "GET Tourney Leaderboard Error." }));
    }).catch(errCode => res.status(errCode).json({ error: "GET Tourney ID Error." }));
});

app.get('/api/tournament/v1/players/name/:tournamentShortName', async (req, res) => {
    console.log("GET Request Tournament '" + req.params.tournamentShortName + "' Players.");
    Tournament.getId(req.params.tournamentShortName).then((tPId) => {
        Tournament.getPlayerStats(tPId).then((data) => {
            return res.status(200).json(data);
        }).catch(errCode => res.status(errCode).json({ error: "GET Tourney Players Error." }));
    }).catch(errCode => res.status(errCode).json({ error: "GET Tourney ID Error." }));
});

app.get('/api/tournament/v1/teams/name/:tournamentShortName', async (req, res) => {
    console.log("GET Request Tournament '" + req.params.tournamentShortName + "' Teams.");
    Tournament.getId(req.params.tournamentShortName).then((tPId) => {
        Tournament.getTeamStats(tPId).then((data) => {
            return res.status(200).json(data);
        }).catch(errCode => res.status(errCode).json({ error: "GET Tourney Teams Error." }));
    }).catch(errCode => res.status(errCode).json({ error: "GET Tourney ID Error." }));
});

app.get('/api/tournament/v1/pickbans/name/:tournamentShortName', async (req, res) => {
    console.log("GET Request Tournament '" + req.params.tournamentShortName + "' Pick Bans.");
    Tournament.getId(req.params.tournamentShortName).then((tPId) => {
        Tournament.getPBStats(tPId).then((data) => {
            return res.status(200).json(data);
        }).catch(errCode => res.status(errCode).json({ error: "GET Tourney Pick Bans Error." }));
    }).catch(errCode => res.status(errCode).json({ error: "GET Tourney ID Error." }));
});

app.get('/api/tournament/v1/games/name/:tournamentShortName', async (req, res) => {
    console.log("GET Request Tournament '" + req.params.tournamentShortName + "' Game Log.");
    Tournament.getId(req.params.tournamentShortName).then((tPId) => {
        Tournament.getGames(tPId).then((data) => {
            return res.status(200).json(data);
        }).catch(errCode => res.status(errCode).json({ error: "GET Tourney Games Error." }));
    }).catch(errCode => res.status(errCode).json({ error: "GET Tourney ID Error." }));
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
    console.log("GET Request Match '" + matchId + "'.");
    Match.getData(matchId).then((data) => {
        if (data == null) { return res.status(404).json({ error: `Match ID '${matchId}' Not Found` }); }
        return res.status(200).json(data);
    }).catch((err) => { res.status(500).json({ error: "GET Match Data Error. ", reason: err }) });
});

//#endregion

const port = 5000;

app.listen(port, () => console.log(`Stats server started on port ${port}`));