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

// Turn number into string
function strPadZeroes(num, size) {
    var s = num+"";
    while (s.length < size) s = "0" + s;
    return s;
}

/*  
    ----------------------
    API Functions
    ----------------------
*/

app.get('/api/match/:matchId', async (req, res) => {
    console.log("GET Request Match '" + req.params.matchId + "'.")
    var matchJson = await dynamoDb.getItem('Matches', 'MatchPId', req.params.matchId);
    // Replace the HIds with the actual Names (will have to learn how to cache on the server side later)
    var seasonPId = matchJson['SeasonPId'];
    var seasonInfoObject = (await dynamoDb.getItem('Season', 'SeasonPId', seasonPId))['Information'];
    matchJson['SeasonShortName'] = seasonInfoObject['SeasonShortName'];
    matchJson['SeasonName'] = seasonInfoObject['SeasonName'];
    var tourneyPId = matchJson['TournamentPId'];
    var tourneyInfoObject = (await dynamoDb.getItem('Tournament', 'TournamentPId', tourneyPId))['Information'];
    matchJson['TournamentShortName'] = tourneyInfoObject['TournamentShortName'];
    matchJson['TournamentName'] = tourneyInfoObject['TournamentName'];
    for (var i = 0; i < Object.keys(matchJson['Teams']).length; ++i) {
        var teamId = Object.keys(matchJson['Teams'])[i];
        var teamJson = matchJson['Teams'][teamId];
        var teamPId = teamHashIds.decode(teamJson['TeamHId'])[0];
        teamJson['TeamName'] = (await dynamoDb.getItem('Team', 'TeamPId', strPadZeroes(teamPId, envVars.PID_LENGTH)))['Information']['TeamName'];

        for (var j = 0; j < Object.keys(teamJson['Players']).length; ++j) {
            var partId = Object.keys(teamJson['Players'])[j];
            var playerJson = teamJson['Players'][partId];
            var profilePId = profileHashIds.decode(playerJson['ProfileHId'])[0];
            playerJson['ProfileName'] = (await dynamoDb.getItem('Profile', 'ProfilePId', strPadZeroes(profilePId, envVars.PID_LENGTH)))['Information']['ProfileName'];
        }
    }
    res.json(matchJson);
});

const port = 5000;

app.listen(port, () => console.log(`Stats server started on port ${port}`));