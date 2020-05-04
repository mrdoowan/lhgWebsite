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
    var leaguesJson = {};
    var seasonList = await dynamoDb.scanTable('Season', 'Information');
    for (var i = 0; i < seasonList.length; ++i) {
        var seasonInfoDb = seasonList[i]['Information'];
        var seasonTime = seasonInfoDb['SeasonTime'];
        if (seasonTime in leaguesJson) {
            leaguesJson[seasonTime] = {};
        }
        leaguesJson[seasonTime]['Date'] = seasonInfoDb['DateOpened'];
        var leagueType = seasonInfoDb['LeagueType'];
        leaguesJson[seasonTime][leagueType] = {};
        leaguesJson[seasonTime][leagueType]['ShortName'] = seasonInfoDb['SeasonShortName'];
    }
    res.json(leaguesJson);
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
    var seasonInfoJson = await dynamoDb.getItem('Season', 'SeasonPId', req.params.seasonId, 'Information');
    if ('FinalStandings' in seasonInfoJson) {
        for (var i = 0; i < seasonInfoJson['FinalStandings'].length; ++i) {
            seasonInfoJson[i]['TeamName'] = getTeamName(seasonInfoJson['FinalStandings'][i]['TeamHId']);
        }
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
    var seasonRosterJson = await dynamoDb.getItem('Season', 'SeasonPId', req.params.seasonId, 'Roster');
    if ('Teams' in seasonRosterJson) {
        for (var i = 0; i < Object.keys(seasonRosterJson['Teams']).length; ++i) {
            var teamHId = Object.keys(seasonRosterJson['Teams'])[i];
            var teamJson = seasonRosterJson['Teams'][teamHId];
            teamJson['TeamName'] = getTeamName(teamHId);
            for (var j = 0; j < Object.keys(teamJson['Players']).length; ++j) {
                var profileHId = Object.keys(teamJson['Players'])[j];
                var playerJson = teamJson['Players'][profileHId];
                playerJson['ProfileName'] = getProfileName(profileHId);
            }
        }
    }
    if ('FreeAgents' in seasonRosterJson) {
        for (var i = 0; i < Object.keys(seasonRosterJson['FreeAgents']).length; ++i) {
            var profileHId = Object.keys(seasonRosterJson['FreeAgents'])[i];
            var playerJson = seasonRosterJson['FreeAgents'][profileHId];
            playerJson['ProfileName'] = getProfileName(profileHId);
        }
    }
    if ('ESubs' in seasonRosterJson) {
        for (var i = 0; i < Object.keys(seasonRosterJson['ESubs']).length; ++i) {
            var profileHId = Object.keys(seasonRosterJson['ESubs'])[i];
            var playerJson = seasonRosterJson['ESubs'][profileHId];
            playerJson['ProfileName'] = getProfileName(profileHId);
        }
    }
});

app.get('/api/season/:seasonId/regular', async (req, res) => {
    console.log("GET Request Season'" + req.params.seasonId + "' Regular.");
    var seasonRegularJson = await dynamoDb.getItem('Season', 'SeasonPId', req.params.seasonId, 'Roster');
    for (var i = 0; i < seasonRegularJson['RegularSeasonDivisions'].length; ++i) {
        var divisionJson = seasonRegularJson['RegularSeasonDivisions'][i];
        for (var j = 0; j < divisionJson['RegularSeasonTeams'].length; ++j) {
            var teamJson = divisionJson['RegularSeasonTeams'][j];
            teamJson['TeamName'] = getTeamName(teamJson['TeamHId']);
        }
    }
    for (var i = 0; i < seasonRegularJson['RegularSeasonGames'].length; ++i) {
        var gameJson = seasonRegularJson['RegularSeasonGames'][i];
        gameJson['BlueTeamName'] = getTeamName(gameJson['BlueTeamHId']);
        gameJson['RedTeamName'] = getTeamName(gameJson['RedTeamHid']);
        gameJson['ModeratorName'] = getProfileName(gameJson['ModeratorHId']);
        gameJson['MvpName'] = getProfileName(gameJson['MvpHId']);
    }
});

app.get('/api/season/:seasonId/playoffs', async (req, res) => {
    console.log("GET Request Season'" + req.params.seasonId + "' Playoffs.");
    var playoffJson = await dynamoDb.getItem('Season', 'SeasonPId', req.params.seasonId, 'Playoffs');
    for (var i = 0; i < Object.values(playoffJson['PlayoffBracket']).length; ++i) {
        // Quarterfinals, Semifinals, Championships
        var roundTypeArray = Object.values(playoffJson['PlayoffBracket'])[i];
        for (var j = 0; j < roundTypeArray.length; ++j) {
            var seriesJson = roundTypeArray[j];
            seriesJson['HigherTeamName'] = getProfileName(seriesJson['HigherTeamHId']);
            seriesJson['LowerTeamName'] = getProfileName(seriesJson['LowerTeamHId']);
            seriesJson['SeriesMvpName'] = getProfileName(seriesJson['SeriesMvpHId']);
        }
    }
    for (var i = 0; i < playoffJson['PlayoffGames'].length; ++i) {
        var gameJson = playoffJson['PlayoffGames'][i];
        gameJson['BlueTeamName'] = getTeamName(gameJson['BlueTeamHId']);
        gameJson['RedTeamName'] = getTeamName(gameJson['RedTeamHId']);
        gameJson['ModeratorName'] = getProfileName(gameJson['ModeratorHId']);
        gameJson['MvpName'] = getProfileName(gameJson['MvpHId']);
    }
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
    for (var i = 0; i < Object.keys(matchJson['Teams']).length; ++i) {
        var teamId = Object.keys(matchJson['Teams'])[i];
        var teamJson = matchJson['Teams'][teamId];
        teamJson['TeamName'] = getTeamName(teamJson['TeamHId']);

        for (var j = 0; j < Object.keys(teamJson['Players']).length; ++j) {
            var partId = Object.keys(teamJson['Players'])[j];
            var playerJson = teamJson['Players'][partId];
            playerJson['ProfileName'] = getProfileName(playerJson['ProfileHId']);
        }
    }
    res.json(matchJson);
});
//#endregion

const port = 5000;

app.listen(port, () => console.log(`Stats server started on port ${port}`));