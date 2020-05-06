// This will be used for the back-end and interface with both APIs
// This calls on LHG's relational Stats DB

/*  Declaring npm modules */
const express = require('express');
const app = express();
const Hashids = require('hashids/cjs'); // For hashing and unhashing

/*  Import helper function modules */
const dynamoDb = require('./dynamoDbHelper');

/* 
    Import from other files that are not committed to Github
    Contact doowan about getting a copy of these files
*/
const envVars = require('./external/env');

/*  Configurations of npm modules */
const profileHashIds = new Hashids(envVars.PROFILE_HID_SALT, envVars.HID_LENGTH); // process.env.PROFILE_HID_SALT
const teamHashIds = new Hashids(envVars.TEAM_HID_SALT, envVars.HID_LENGTH); // process.env.TEAM_HID_SALT

/*  
    ----------------------
    Helper Functions
    ----------------------
*/
//#region Helper functions

// Turn number into string
function strPadZeroes(num, size) {
    var s = num+"";
    while (s.length < size) s = "0" + s;
    return s;
}

// Turn HId into PId string
function getPIdString(hId, hashIdMethod) {
    return strPadZeroes(hashIdMethod.decode(hId)[0], envVars.PID_LENGTH);
}

// Get ProfileName from DynamoDb
async function getProfileName(pHId) {
    return await dynamoDb.getItem('Profile', 'ProfilePId', getPIdString(pHId, profileHashIds), 'ProfileName');
}

// Get TeamName from DynamoDb
async function getTeamName(tHId) {
    return await dynamoDb.getItem('Team', 'TeamPId', getPIdString(tHId, teamHashIds), 'TeamName');
}

//#endregion

/*  
    ----------------------
    League API Requests
    ----------------------
*/
//#region League
app.get('/api/leagues', async (req, res) => {
    console.log("GET Request Leagues.");
    var seasonList = await dynamoDb.scanTable('Season', 'Information');
    var leagueObject = {};
    seasonList.map((seasonInfoDb) => {
        const { SeasonTime, DateOpened, LeagueType, SeasonShortName } = seasonInfoDb['Information'];
        if (!(SeasonTime in leagueObject)) {
            leagueObject[SeasonTime] = { 'SeasonTime': SeasonTime }
        }
        leagueObject[SeasonTime]['Date'] = DateOpened;
        leagueObject[SeasonTime][LeagueType] = {};
        leagueObject[SeasonTime][LeagueType]['League'] = LeagueType;
        leagueObject[SeasonTime][LeagueType]['ShortName'] = SeasonShortName;
    });
    var leagueList = Object.values(leagueObject).sort((a, b) => (a.Date < b.Date) ? 1 : -1);
    res.json(leagueList);
});

//#endregion

/*  
    ----------------------
    Season API Requests
    ----------------------
*/
//#region Season
app.get('/api/season/:seasonId/information', async (req, res) => {
    console.log("GET Request Season'" + req.params.seasonId + "' Information.");
    var seasonInfoJson = await dynamoDb.getItem('Season', 'SeasonPId', req.params.seasonId, 'Information')['Information'];
    if ('FinalStandings' in seasonInfoJson) {
        seasonInfoJson['FinalStandings'].map((teamObject) => {
            teamObject['TeamName'] = getTeamName(teamObject['TeamHId']);
        })
    }
    if ('FinalsMvpHId' in seasonInfoJson) {
        seasonInfoJson['FinalsMvpName'] = getProfileName(seasonInfoJson['FinalsMvpHId']);
    }
    if ('AllStars' in seasonInfoJson) {
        seasonInfoJson['AllStars']['TopName'] = getProfileName(seasonInfoJson['AllStars']['TopHId']);
        seasonInfoJson['AllStars']['JungleName'] = getProfileName(seasonInfoJson['AllStars']['JungleHId']);
        seasonInfoJson['AllStars']['MidName'] = getProfileName(seasonInfoJson['AllStars']['MidHId']);
        seasonInfoJson['AllStars']['BotName'] = getProfileName(seasonInfoJson['AllStars']['BotHId']);
        seasonInfoJson['AllStars']['SupportName'] = getProfileName(seasonInfoJson['AllStars']['SupportHId']);
    }
    res.json(seasonInfoJson);
});

app.get('/api/season/:seasonId/roster', async (req, res) => {
    console.log("GET Request Season'" + req.params.seasonId + "' Roster.");
    var seasonRosterJson = await dynamoDb.getItem('Season', 'SeasonPId', req.params.seasonId, 'Roster')['Roster'];
    if ('Teams' in seasonRosterJson) {
        Object.keys(seasonRosterJson['Teams']).map((teamHId) => {
            var teamJson = seasonRosterJson['Teams'][teamHId];
            teamJson['TeamName'] = getTeamName(teamHId);
            Object.keys(teamJson['Players']).map((profileHId) => {
                var playerJson = teamJson['Players'][profileHId];
                playerJson['ProfileName'] = getProfileName(profileHId);
            });
        });
    }
    if ('FreeAgents' in seasonRosterJson) {
        Object.keys(seasonRosterJson['FreeAgents']).map((profileHId) => {
            var playerJson = seasonRosterJson['FreeAgents'][profileHId];
            playerJson['ProfileName'] = getProfileName(profileHId);
        });
    }
    if ('ESubs' in seasonRosterJson) {
        Object.keys(seasonRosterJson['ESubs']).map((profileHId) => {
            var playerJson = seasonRosterJson['ESubs'][profileHId];
            playerJson['ProfileName'] = getProfileName(profileHId);
        });
    }
});

app.get('/api/season/:seasonId/regular', async (req, res) => {
    console.log("GET Request Season'" + req.params.seasonId + "' Regular.");
    var seasonRegularJson = await dynamoDb.getItem('Season', 'SeasonPId', req.params.seasonId, 'Roster')['Roster'];
    seasonRegularJson['RegularSeasonDivisions'].map((divisionJson) => {
        divisionJson['RegularSeasonTeams'].map((teamJson) => {
            teamJson['TeamName'] = getTeamName(teamJson['TeamHId']);
        });
    });
    seasonRegularJson['RegularSeasonGames'].map((gameJson) => {
        gameJson['BlueTeamName'] = getTeamName(gameJson['BlueTeamHId']);
        gameJson['RedTeamName'] = getTeamName(gameJson['RedTeamHid']);
        gameJson['ModeratorName'] = getProfileName(gameJson['ModeratorHId']);
        gameJson['MvpName'] = getProfileName(gameJson['MvpHId']);
    });
    res.json(seasonRegularJson);
});

app.get('/api/season/:seasonId/playoffs', async (req, res) => {
    console.log("GET Request Season'" + req.params.seasonId + "' Playoffs.");
    var playoffJson = await dynamoDb.getItem('Season', 'SeasonPId', req.params.seasonId, 'Playoffs')['Playoffs'];
    Object.values(playoffJson['PlayoffBracket']).map((roundTypeArray) => {
        roundTypeArray.map((seriesJson) => {
            seriesJson['HigherTeamName'] = getProfileName(seriesJson['HigherTeamHId']);
            seriesJson['LowerTeamName'] = getProfileName(seriesJson['LowerTeamHId']);
            seriesJson['SeriesMvpName'] = getProfileName(seriesJson['SeriesMvpHId']);
        });
    });
    playoffJson['PlayoffGames'].map((gameJson) => {
        gameJson['BlueTeamName'] = getTeamName(gameJson['BlueTeamHId']);
        gameJson['RedTeamName'] = getTeamName(gameJson['RedTeamHId']);
        gameJson['ModeratorName'] = getProfileName(gameJson['ModeratorHId']);
        gameJson['MvpName'] = getProfileName(gameJson['MvpHId']);
    });
    res.json(playoffJson);
});
//#endregion

/*  
    ----------------------
    Tournament API Requests
    ----------------------
*/
//#region Tournament
app.get('/api/tournament/:tournamentId/information', async (req, res) => {
    console.log("GET Request Tournament'" + req.params.tournamentId + "' Information.");
});

app.get('/api/tournament/:tournamentId/tourneystats', async (req, res) => {
    console.log("GET Request Tournament'" + req.params.tournamentId + "' Tourney Stats.");
});

app.get('/api/tournament/:tournamentId/leaderboards', async (req, res) => {
    console.log("GET Request Tournament'" + req.params.tournamentId + "' Leaderboards.");
});

app.get('/api/tournament/:tournamentId/players', async (req, res) => {
    console.log("GET Request Tournament'" + req.params.tournamentId + "' Players.");
});

app.get('/api/tournament/:tournamentId/teams', async (req, res) => {
    console.log("GET Request Tournament'" + req.params.tournamentId + "' Teams.");
});

app.get('/api/tournament/:tournamentId/pickbans', async (req, res) => {
    console.log("GET Request Tournament'" + req.params.tournamentId + "' Pick Bans.");
});

app.get('/api/tournament/:tournamentId/games', async (req, res) => {
    console.log("GET Request Tournament'" + req.params.tournamentId + "' Game Log.");
});
//#endregion

/*  
    ----------------------
    Team API Requests
    ----------------------
*/
//#region Team
app.get('/api/team/:teamId/information', async (req, res) => {
    console.log("GET Request Team'" + req.params.teamId + "' Information.");
});

app.get('/api/team/:teamId/scouting/:seasonId', async (req, res) => {
    console.log("GET Request Team'" + req.params.teamId + "' Scouting for Season '" + req.params.seasonId +  "'.");
});

app.get('/api/team/:teamId/games/:seasonId', async (req, res) => {
    console.log("GET Request Team'" + req.params.teamId + "' Game Log for Season '" + req.params.seasonId +  "'.");
});

app.get('/api/team/:teamId/stats/:tournamentId', async (req, res) => {
    console.log("GET Request Team'" + req.params.teamId + "' Stats Log for Tournament '" + req.params.tournamentId +  "'.");
});
//#endregion

/*  
    ----------------------
    Profile API Requests
    ----------------------
*/
//#region Profile
app.get('/api/profile/:profileId/information', async (req, res) => {
    console.log("GET Request Profile'" + req.params.profileId + "' Information.");
});

app.get('/api/profile/:profileId/champs', async (req, res) => {
    console.log("GET Request Profile'" + req.params.profileId + "' Champs.");
});

app.get('/api/profile/:profileId/games/:seasonId', async (req, res) => {
    console.log("GET Request Profile'" + req.params.profileId + "' Game Log for Season '" + req.params.seasonId +  "'.");
});

app.get('/api/profile/:profileId/stats/:tournamentId', async (req, res) => {
    console.log("GET Request Profile'" + req.params.profileId + "' Stats Log for Tournament '" + req.params.tournamentId +  "'.");
});
//#endregion

/*  
    ----------------------
    Match API Requests
    ----------------------
*/
//#region Match
// {MAIN}/match/<MatchPId>
app.get('/api/match/:matchId', async (req, res) => {
    console.log("GET Request Match '" + req.params.matchId + "'.");
    var matchJson = await dynamoDb.getItem('Matches', 'MatchPId', req.params.matchId);
    // Replace the HIds with the actual Names (will have to learn how to cache on the server side later)
    var seasonPId = matchJson['SeasonPId'];
    var seasonInfoObject = await dynamoDb.getItem('Season', 'SeasonPId', seasonPId, 'Information');
    matchJson['SeasonShortName'] = seasonInfoObject['SeasonShortName'];
    matchJson['SeasonName'] = seasonInfoObject['SeasonName'];
    var tourneyPId = matchJson['TournamentPId'];
    var tourneyInfoObject = await dynamoDb.getItem('Tournament', 'TournamentPId', tourneyPId, 'Information');
    matchJson['TournamentShortName'] = tourneyInfoObject['TournamentShortName'];
    matchJson['TournamentName'] = tourneyInfoObject['TournamentName'];
    Object.keys(matchJson['Teams']).map((teamId) => {
        var teamJson = matchJson['Teams'][teamId];
        teamJson['TeamName'] = getTeamName(teamJson['TeamHId']);
        Object.keys(teamJson['Players']).map((partId) => {
            var playerJson = teamJson['Players'][partId];
            playerJson['ProfileName'] = getProfileName(playerJson['ProfileHId']);
        });
    });
    res.json(matchJson);
});
//#endregion

const port = 5000;

app.listen(port, () => console.log(`Stats server started on port ${port}`));