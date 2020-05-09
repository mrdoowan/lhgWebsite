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

// Lowercases the name and removes all whitespaces
function filterName(name) {
    return name.toLowerCase().replace(/ /g, '');
}

// Get ProfileName from DynamoDb TODO: Caching
async function getProfileName(pHId) {
    return (await dynamoDb.getItem('Profile', 'ProfilePId', getPIdString(pHId, profileHashIds), ['ProfileName']))['ProfileName'];
}

// Get ProfilePId from ProfileName TODO: Caching
async function getProfilePId(name) {
    var HId = (await dynamoDb.getItem('ProfileNameMap', 'ProfileName', filterName(name)))['ProfileHId'];
    return getPIdString(HId, profileHashIds);
}

// Get TeamName from DynamoDb TODO: Caching
async function getTeamName(tHId) {
    return (await dynamoDb.getItem('Team', 'TeamPId', getPIdString(tHId, teamHashIds), ['TeamName']))['TeamName'];
}

// Get TeamPId from TeamName TODO: Caching
async function getTeamPId(name) {
    var HId = (await dynamoDb.getItem('TeamNameMap', 'TeamName', filterName(name)))['TeamHId'];
    return getPIdString(HId, teamHashIds);
}

// Get TournamentShortName from DynamoDb TODO: Caching
async function getTournamentShortName(tPId) {
    return (await dynamoDb.getItem('Tournament', 'TournamentPId', tPId, ['TournamentShortName']))['TournamentShortName'];
}

// Get TournamentName from DynamoDb TODO: Caching
async function getTournamentName(tPId) {
    return (await dynamoDb.getItem('Tournament', 'TournamentPId', tPId, ['Information']))['Information']['TournamentName'];
}

// Get SeasonShortName from DynamoDb TODO: Caching
async function getSeasonShortName(sPId) {
    return (await dynamoDb.getItem('Season', 'SeasonPId', sPId, ['SeasonShortName']))['SeasonShortName'];
}

// Get SeasonName from DynamoDb TODO: Caching
async function getSeasonName(sPId) {
    return (await dynamoDb.getItem('Season', 'SeasonPId', sPId, ['Information']))['Information']['SeasonName'];
}

async function getSeasonTime(sPId) {
    return (await dynamoDb.getItem('Season', 'SeasonPId', sPId, ['Information']))['Information']['SeasonTime'];
}

// Get SeasonPId from DynamoDb TODO: Caching
async function getSeasonPId(shortName) {
    return (await dynamoDb.scanTable('Season', ['SeasonPId'], 'SeasonShortName', filterName(shortName)))[0]['SeasonPId'];
}

// Get TournamentPId from DynamoDb TODO: Caching
async function getTournamentPId(shortName) {
    return (await dynamoDb.scanTable('Tournament', ['TournamentPId'], 'TournamentShortName', filterName(shortName)))[0]['TournamentPId'];
}

//#endregion

/*  
    ----------------------
    League API Requests
    ----------------------
*/
//#region League

// TODO: Caching
app.get('/api/leagues', async (req, res) => {
    console.log("GET Request Leagues.");
    var seasonList = await dynamoDb.scanTable('Season', ['Information']);
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

// TODO: Caching
async function getSeasonInformation(sPId) {
    var seasonInfoJson = (await dynamoDb.getItem('Season', 'SeasonPId', sPId, ['Information']))['Information'];
    seasonInfoJson['TournamentPIds']['RegTournamentShortName'] = await getTournamentShortName(seasonInfoJson['TournamentPIds']['RegTournamentPId']);
    seasonInfoJson['TournamentPIds']['PostTournamentShortName'] = await getTournamentShortName(seasonInfoJson['TournamentPIds']['PostTournamentPId']);
    if ('FinalStandings' in seasonInfoJson) {
        for (var i = 0; i < seasonInfoJson['FinalStandings'].length; ++i) {
            var teamObject = seasonInfoJson['FinalStandings'][i];
            teamObject['TeamName'] = await getTeamName(teamObject['TeamHId']);
        }
    }
    if ('FinalsMvpHId' in seasonInfoJson) {
        seasonInfoJson['FinalsMvpName'] = await getProfileName(seasonInfoJson['FinalsMvpHId']);
    }
    if ('AllStars' in seasonInfoJson) {
        seasonInfoJson['AllStars']['TopName'] = await getProfileName(seasonInfoJson['AllStars']['TopHId']);
        seasonInfoJson['AllStars']['JungleName'] = await getProfileName(seasonInfoJson['AllStars']['JungleHId']);
        seasonInfoJson['AllStars']['MidName'] = await getProfileName(seasonInfoJson['AllStars']['MidHId']);
        seasonInfoJson['AllStars']['BotName'] = await getProfileName(seasonInfoJson['AllStars']['BotHId']);
        seasonInfoJson['AllStars']['SupportName'] = await getProfileName(seasonInfoJson['AllStars']['SupportHId']);
    }
    return seasonInfoJson;
}
app.get('/api/season/information/name/:seasonShortName', async (req, res) => {
    console.log("GET Request Season '" + req.params.seasonShortName + "' Information.");
    var sPId = await getSeasonPId(req.params.seasonShortName);
    res.json(await getSeasonInformation(sPId));
});

// TODO: Caching
async function getSeasonRoster(sPId) {
    var seasonRosterJson = (await dynamoDb.getItem('Season', 'SeasonPId', sPId, ['Roster']))['Roster'];
    if ('Teams' in seasonRosterJson) {
        for (var i = 0; i < Object.keys(seasonRosterJson['Teams']).length; ++i) {
            var teamHId = Object.keys(seasonRosterJson['Teams'])[i];
            var teamJson = seasonRosterJson['Teams'][teamHId];
            teamJson['TeamName'] = await getTeamName(teamHId);
            for (var j = 0; j < Object.keys(teamJson['Players']).length; ++j) {
                var profileHId = Object.keys(teamJson['Players'])[j];
                var playerJson = teamJson['Players'][profileHId];
                playerJson['ProfileName'] = await getProfileName(profileHId);
            }
        }
    }
    if ('FreeAgents' in seasonRosterJson) {
        for (var i = 0; i < Object.keys(seasonRosterJson['FreeAgents']).length; ++i) {
            var profileHId = Object.keys(seasonRosterJson['FreeAgents'])[i];
            var playerJson = seasonRosterJson['FreeAgents'][profileHId];
            playerJson['ProfileName'] = await getProfileName(profileHId);
        }
    }
    if ('ESubs' in seasonRosterJson) {
        for (var i = 0; i < Object.keys(seasonRosterJson['ESubs']).length; ++i) {
            var profileHId = Object.keys(seasonRosterJson['ESubs'])[i];
            playerJson['ProfileName'] = await getProfileName(profileHId);
        }
    }
    return seasonRosterJson;
}
app.get('/api/season/roster/name/:seasonShortName', async (req, res) => {
    console.log("GET Request Season '" + req.params.seasonShortName + "' Roster.");
    var sPId = await getSeasonPId(req.params.seasonShortName);
    res.json(await getSeasonRoster(sPId));
});

// TODO: Caching
async function getSeasonRegular(sPId) {
    var seasonRegularJson = (await dynamoDb.getItem('Season', 'SeasonPId', sPId, ['Regular']))['Regular'];
    for (var i = 0; i < seasonRegularJson['RegularSeasonDivisions'].length; ++i) {
        var divisionJson = seasonRegularJson['RegularSeasonDivisions'][i];
        for (var j = 0; j < divisionJson['RegularSeasonTeams'].length; ++j) {
            var teamJson = divisionJson['RegularSeasonTeams'][j];
            teamJson['TeamName'] = await getTeamName(teamJson['TeamHId']);
        }
    }
    for (var i = 0; i < seasonRegularJson['RegularSeasonGames'].length; ++i) {
        var gameJson = seasonRegularJson['RegularSeasonGames'][i];
        gameJson['BlueTeamName'] = await getTeamName(gameJson['BlueTeamHId']);
        gameJson['RedTeamName'] = await getTeamName(gameJson['RedTeamHid']);
        gameJson['ModeratorName'] = await getProfileName(gameJson['ModeratorHId']);
        gameJson['MvpName'] = await getProfileName(gameJson['MvpHId']);
    }
    return seasonRegularJson;
}
app.get('/api/season/regular/name/:seasonShortName', async (req, res) => {
    console.log("GET Request Season '" + req.params.seasonShortName + "' Regular.");
    var sPId = await getSeasonPId(req.params.seasonShortName);
    res.json(await getSeasonRegular(sPId));
});

// TODO: Caching
async function getSeasonPlayoffs(sPId) {
    var playoffJson = (await dynamoDb.getItem('Season', 'SeasonPId', sPId, ['Playoffs']))['Playoffs'];
    for (var i = 0; i < Object.values(playoffJson['PlayoffBracket']).length; ++i) {
        var roundTypeArray = Object.values(playoffJson['PlayoffBracket'])[i];
        for (var j = 0; j < roundTypeArray.length; ++j) {
            var seriesJson = roundTypeArray[j];
            seriesJson['HigherTeamName'] = await getProfileName(seriesJson['HigherTeamHId']);
            seriesJson['LowerTeamName'] = await getProfileName(seriesJson['LowerTeamHId']);
            seriesJson['SeriesMvpName'] = await getProfileName(seriesJson['SeriesMvpHId']);
        }
    }
    for (var i = 0; i < playoffJson['PlayoffGames'].length; ++i) {
        var gameJson = playoffJson['PlayoffGames'][i];
        gameJson['BlueTeamName'] = await getTeamName(gameJson['BlueTeamHId']);
        gameJson['RedTeamName'] = await getTeamName(gameJson['RedTeamHId']);
        gameJson['ModeratorName'] = await getProfileName(gameJson['ModeratorHId']);
        gameJson['MvpName'] = await getProfileName(gameJson['MvpHId']);
    }
    return playoffJson;
}
app.get('/api/season/playoffs/name/:seasonShortName', async (req, res) => {
    console.log("GET Request Season '" + req.params.seasonShortName + "' Playoffs.");
    var sPId = await getSeasonPId(req.params.seasonShortName);
    res.json(await getSeasonPlayoffs(sPId));
});

//#endregion

/*  
    ----------------------
    Profile API Requests
    ----------------------
*/
//#region Profile

// TODO: Caching
async function getProfileInfo(pPId) {
    var profileInfoJson = (await dynamoDb.getItem('Profile', 'ProfilePId', pPId, ['Information']))['Information'];
    if ('ActiveSeasonPId' in profileInfoJson) {
        profileInfoJson['ActiveSeasonShortName'] = await getSeasonShortName(profileInfoJson['ActiveSeasonPId']);
        profileInfoJson['ActiveSeasonName'] = await getSeasonName(profileInfoJson['ActiveSeasonPId']);
    }
    if ('ActiveTeamHId' in profileInfoJson) {
        profileInfoJson['ActiveTeamName'] = await getTeamName(profileInfoJson['ActiveTeamHId']);
    }
    return profileInfoJson;
}
app.get('/api/profile/information/name/:profileName', async (req, res) => {
    console.log("GET Request Profile '" + req.params.profileName + "' Information.");
    var pPId = await getProfilePId(req.params.profileName);
    res.json(await getProfileInfo(pPId));
});

// TODO: Caching
async function getProfileGamesBySeason(pPId, sPId) {
    var profileGamesJson = (await dynamoDb.getItem('Profile', 'ProfilePId', pPId, ['GameLog']))['GameLog'][sPId];
    profileGamesJson['SeasonTime'] = await getSeasonTime(sPId);
    for (var i = 0; i < Object.values(profileGamesJson['Matches']).length; ++i) {
        var matchJson = Object.values(profileGamesJson['Matches'])[i];
        matchJson['TeamName'] = await getTeamName(matchJson['TeamHId']);
        matchJson['EnemyTeamName'] = await getTeamName(matchJson['EnemyTeamHId']);
        matchJson['KillPct'] = ((matchJson['Kills'] + matchJson['Assists']) / matchJson['TeamKills']).toFixed(4);
        matchJson['DamagePct'] = (matchJson['DamageDealt'] / matchJson['TeamDamage']).toFixed(4);
        matchJson['GoldPct'] = (matchJson['Gold'] / matchJson['TeamGold']).toFixed(4);
        matchJson['VisionScorePct'] = (matchJson['VisionScore'] / matchJson['TeamVS']).toFixed(4);
    }
    return profileGamesJson;
}
app.get('/api/profile/games/name/:profileName/:seasonShortName', async (req, res) => {
    console.log("GET Request Profile '" + req.params.profileName + "' Game Log for Season '" + req.params.seasonShortName +  "'.");
    var pPId = await getProfilePId(req.params.profileName);
    var sPId = await getSeasonPId(req.params.seasonShortName);
    res.json(await getProfileGamesBySeason(pPId, sPId));
});

// TODO: Caching
async function getProfileStatsByTourney(pPId, tPId) {
    var profileStatsJson = (await dynamoDb.getItem('Profile', 'ProfilePId', pPId, ['StatsLog']))['StatsLog'][tPId];
    //profileStatsJson['TournamentName'] = await getTournamentName(tPId);
    for (var i = 0; i < Object.keys(profileStatsJson['RoleStats']).length; ++i) {
        var role = Object.keys(profileStatsJson['RoleStats'])[i];
        var statsJson = profileStatsJson['RoleStats'][role];
        var gameDurationMinute = statsJson['TotalGameDuration'] / 60;
        statsJson['Kda'] = (statsJson['TotalDeaths'] > 0) ? ((statsJson['TotalKills'] + statsJson['TotalAssists']) / statsJson['TotalDeaths']).toFixed(2).toString() : "Perfect";
        statsJson['KillPct'] = ((statsJson['TotalKills'] + statsJson['TotalAssists']) / statsJson['TotalTeamKills']).toFixed(4);
        statsJson['DeathPct'] = (statsJson['TotalDeaths'] / statsJson['TotalTeamDeaths']).toFixed(4);
        statsJson['CreepScorePerMinute'] = (statsJson['TotalCreepScore'] / gameDurationMinute).toFixed(2);
        statsJson['GoldPerMinute'] = (statsJson['TotalGold'] / gameDurationMinute).toFixed(2);
        statsJson['GoldPct'] = (statsJson['TotalGold'] / statsJson['TotalTeamGold']).toFixed(4);
        statsJson['DamagePerMinute'] = (statsJson['TotalDamage'] / gameDurationMinute).toFixed(2);
        statsJson['DamagePct'] = (statsJson['TotalDamage'] / statsJson['TotalTeamDamage']).toFixed(4);
        statsJson['VisionScorePerMinute'] = (statsJson['TotalVisionScore'] / gameDurationMinute).toFixed(2);
        statsJson['VisionScorePct'] = (statsJson['TotalVisionScore'] / statsJson['TotalTeamVisionScore']).toFixed(4);
        statsJson['WardsPerMinute'] = (statsJson['TotalWardsPlaced'] / gameDurationMinute).toFixed(2);
        statsJson['WardsClearedPerMinute'] = (statsJson['TotalWardsCleared'] / gameDurationMinute).toFixed(2);
        statsJson['ControlWardsPerMinute'] = (statsJson['TotalControlWardsBought'] / gameDurationMinute).toFixed(2);
        statsJson['AverageCsAtEarly'] = (statsJson['TotalCsAtEarly'] / statsJson['GamesPlayedOverEarly']).toFixed(1);
        statsJson['AverageGoldAtEarly'] = (statsJson['TotalGoldAtEarly'] / statsJson['GamesPlayedOverEarly']).toFixed(1);
        statsJson['AverageXpAtEarly'] = (statsJson['TotalXpAtEarly'] / statsJson['GamesPlayedOverEarly']).toFixed(1);
        statsJson['AverageCsDiffEarly'] = (statsJson['TotalCsDiffEarly'] / statsJson['GamesPlayedOverEarly']).toFixed(1);
        statsJson['AverageGoldDiffEarly'] = (statsJson['TotalGoldDiffEarly'] / statsJson['GamesPlayedOverEarly']).toFixed(1);
        statsJson['AverageXpDiffEarly'] = (statsJson['TotalXpDiffEarly'] / statsJson['GamesPlayedOverEarly']).toFixed(1);
        statsJson['FirstBloodPct'] = (statsJson['TotalFirstBloods'] / statsJson['GamesPlayed']).toFixed(4);
    }
    return profileStatsJson;
}
app.get('/api/profile/stats/name/:profileName/:tournamentShortName', async (req, res) => {
    console.log("GET Request Profile '" + req.params.profileName + "' Stats Log for Tournament '" + req.params.tournamentShortName +  "'.");
    var pPId = await getProfilePId(req.params.profileName);
    var tPId = await getTournamentPId(req.params.tournamentShortName);
    res.json(await getProfileStatsByTourney(pPId, tPId));
});

//#endregion

/*  
    ----------------------
    Team API Requests
    ----------------------
*/
//#region Team

// TODO: Caching
async function getTeamInfo(teamPId) {
    var teamInfoJson = (await dynamoDb.getItem('Team', 'TeamPId', teamPId, ['Information']))['Information'];
    if ('TrophyCase' in teamInfoJson) {
        for (var i = 0; i < Object.keys(teamInfoJson['TrophyCase']).length; ++i) {
            var sPId = Object.keys(teamInfoJson['TrophyCase'])[i];
            teamInfoJson['TrophyCase'][sPId]['Seasonname'] = getSeasonName(sPId);
            teamInfoJson['TrophyCase'][sPId]['SeasonShortName'] = getSeasonShortName(sPId);
        }
    }
    return teamInfoJson;
}
app.get('/api/team/information/name/:teamName', async (req, res) => {
    console.log("GET Request Team '" + req.params.teamName + "' Information.");
    var teamId = await getTeamPId(req.params.teamName);
    res.json(await getTeamInfo(teamId));
});

// TODO: Caching
async function getTeamScouting(teamPId, sPId) {
    var teamScoutingJson = (await dynamoDb.getItem('Team', 'TeamPId', teamPId, ['Scouting']))['Scouting'][sPId];
    teamScoutingJson['SeasonTime'] = await getSeasonTime(sPId);
    for (var i = 0; i < Object.values(teamScoutingJson['PlayerLog']).length; ++i) {
        var roleMap = Object.values(teamScoutingJson['PlayerLog'])[i];
        for (var j = 0; j < Object.keys(roleMap).length; ++j) {
            var profileHId = Object.keys(roleMap)[j];
            var statsJson = roleMap[profileHId];
            statsJson['ProfileName'] = await getProfileName(profileHId);
            statsJson['TotalKdaPlayer'] = (statsJson['TotalDeathsPlayer'] > 0) ? ((statsJson['TotalKillsPlayer'] + statsJson['TotalAssistsPlayer']) / statsJson['TotalDeathsPlayer']).toFixed(2).toString() : "Perfect";
            statsJson['KillPctPlayer'] = ((statsJson['TotalKillsPlayer'] + statsJson['TotalAssistsPlayer']) / statsJson['TotalKillsTeam']).toFixed(4);
            statsJson['DamagePctPlayer'] = (statsJson['TotalDamagePlayer'] / statsJson['TotalDamageTeam']).toFixed(4);
            statsJson['GoldPctPlayer'] = (statsJson['TotalGoldPlayer'] / statsJson['TotalGoldTeam']).toFixed(4);
            statsJson['VsPctPlayer'] = (statsJson['TotalVsPlayer'] / statsJson['TotalVsTeam']).toFixed(4);
        }
    }
    return teamScoutingJson;
}
app.get('/api/team/scouting/name/:teamName/:seasonShortName', async (req, res) => {
    console.log("GET Request Team '" + req.params.teamName + "' Scouting for Season '" + req.params.seasonShortName +  "'.");
    var teamId = await getTeamPId(req.params.teamName);
    var sPId = await getSeasonPId(req.params.seasonShortName);
    res.json(await getTeamScouting(teamId, sPId));
});

// TODO: Caching
async function getTeamGames(teamPId, sPId) {
    var gameLogJson = (await dynamoDb.getItem('Team', 'TeamPId', teamPId, ['GameLog']))['GameLog'][sPId];
    gameLogJson['SeasonTime'] = getSeasonTime(sPId);
    for (var i = 0; i < Object.values(gameLogJson['Matches']).length; ++i) {
        var matchObject = Object.values(gameLogJson['Matches'])[i];
        for (var j = 0; j < Object.values(matchObject['ChampPicks']).length; ++j) {
            var champObject = Object.values(matchObject['ChampPicks'])[j];
            champObject['ProfileName'] = await getProfileName(champObject['ProfileHId']);
        }
        matchObject['EnemyTeamName'] = await getTeamName(matchObject['EnemyTeamHId']);
    }
    return gameLogJson;
}
app.get('/api/team/games/name/:teamName/:seasonShortName', async (req, res) => {
    console.log("GET Request Team '" + req.params.teamName + "' Game Log for Season '" + req.params.seasonShortName +  "'.");
    var teamId = await getTeamPId(req.params.teamName);
    var sPId = await getSeasonPId(req.params.seasonShortName);
    res.json(await getTeamGames(teamId, sPId));
});

// TODO: Caching
async function getTeamStatsByTourney(teamPId, tPId) {
    var statsJson = (await dynamoDb.getItem('Team', 'TeamPId', teamPId, ['StatsLog']))['StatsLog'][tPId];
    var totalGameDurationMinute = statsJson['TotalGameDuration'] / 60;
    statsJson['TournamentName'] = await getTournamentName(tPId);
    statsJson['GamesPlayedOnRed'] = statsJson['GamesPlayed'] - statsJson['GamesPlayedOnBlue'];
    statsJson['RedWins'] = statsJson['GamesWon'] - statsJson['BlueWins'];
    statsJson['AverageGameDuration'] = (statsJson['TotalGameDuration'] / statsJson['GamesPlayed']).toFixed(2);
    statsJson['AverageKills'] = (statsJson['TotalKills'] / statsJson['GamesPlayed']).toFixed(1);
    statsJson['AverageDeaths'] = (statsJson['TotalDeaths'] / statsJson['GamesPlayed']).toFixed(1);
    statsJson['KilLDeathRatio'] = (statsJson['TotalDeaths'] > 0) ? (statsJson['TotalKills'] / statsJson['TotalDeaths']).toFixed(1).toString : "Perfect";
    statsJson['AverageAssists'] = (statsJson['TotalAssists'] / statsJson['GamesPlayed']).toFixed(1);
    statsJson['GoldPerMinute'] = (statsJson['TotalGold'] / statsJson['GamesPlayed']).toFixed(1);
    statsJson['AverageTowersTaken'] = (statsJson['TotalTowersTaken'] / statsJson['GamesPlayed']).toFixed(1);
    statsJson['TotalTowersLost'] = (statsJson['TotalTowersLost'] / statsJson['GamesPlayed']).toFixed(1);
    statsJson['FirstBloodPct'] = (statsJson['TotalFirstBloods'] / statsJson['GamesPlayed']).toFixed(4);
    statsJson['FirstTowerPct'] = (statsJson['TotalFirstTowers'] / statsJson['GamesPlayed']).toFixed(4);
    statsJson['AverageDragonsTaken'] = (statsJson['TotalDragonsTaken'] / statsJson['GamesPlayed']).toFixed(1);
    statsJson['DragonPct'] = (statsJson['TotalDragonsTaken'] / (statsJson['TotalDragonsTaken'] + statsJson['TotalEnemyDragons'])).toFixed(4);
    statsJson['AverageHeraldsTaken'] = (statsJson['TotalHeraldsTaken'] / statsJson['GamesPlayed']).toFixed(1);
    statsJson['HeraldPct'] = (statsJson['TotalHeraldsTaken'] / (statsJson['TotalHeraldsTaken'] + statsJson['TotalEnemyHeralds'])).toFixed(4);
    statsJson['AverageBaronsTaken'] = (statsJson['TotalBaronsTaken'] / statsJson['GamesPlayed']).toFixed(1);
    statsJson['BaronPct'] = (statsJson['TotalBaronsTaken'] / (statsJson['TotalBaronsTaken'] + statsJson['TotalEnemyBarons'])).toFixed(4);
    statsJson['CreepScorePerMinute'] = (statsJson['TotalCreepScore'] / totalGameDurationMinute).toFixed(2);
    statsJson['VisionScorePerMinute'] = (statsJson['TotalVisionScore'] / totalGameDurationMinute).toFixed(2);
    statsJson['WardsPerMinute'] = (statsJson['TotalWardsPlaced'] / totalGameDurationMinute).toFixed(2);
    statsJson['ControlWardsPerMinute'] = (statsJson['TotalControlWardsBought'] / totalGameDurationMinute).toFixed(2);
    statsJson['WardsClearedPerMinute'] = (statsJson['TotalWardsCleared'] / totalGameDurationMinute).toFixed(2);
    statsJson['WardsClearedPct'] = (statsJson['TotalWardsCleared'] / statsJson['TotalEnemyWardsPlaced']).toFixed(4);
    statsJson['AverageXpDiffEarly'] = (statsJson['TotalXpDiffEarly'] / statsJson['GamesPlayedOverEarly']).toFixed(1);
    statsJson['AverageXpDiffMid'] = (statsJson['TotalXpDiffMid'] / statsJson['GamesPlayedOverMid']).toFixed(1);
    statsJson['AverageGoldDiffEarly'] = (statsJson['TotalGoldDiffEarly'] / statsJson['GamesPlayedOverEarly']).toFixed(1);
    statsJson['AverageGoldDiffMid'] = (statsJson['TotalGoldDiffMid'] / statsJson['GamesPlayedOverMid']).toFixed(1);
    statsJson['AverageCsDiffEarly'] = (statsJson['TotalCsDiffEarly'] / statsJson['GamesPlayedOverEarly']).toFixed(1);
    statsJson['AverageCsDiffMid'] = (statsJson['TotalCsDiffMid'] / statsJson['GamesPlayedOverMid']).toFixed(1);
    return statsJson;
}
app.get('/api/team/stats/name/:teamName/:tournamentName', async (req, res) => {
    console.log("GET Request Team '" + req.params.teamName + "' Stats Log for Tournament '" + req.params.tournamentName +  "'.");
    var teamId = await getTeamPId(req.params.teamName);
    var tPId = await getTournamentPId(req.params.tournamentName);
    res.json(await getTeamStatsByTourney(teamId, tPId));
});

//#endregion

/*  
    ----------------------
    Tournament API Requests
    ----------------------
*/
//#region Tournament

// TODO: Caching
async function getTourneyInfo(tPId) {
    var tourneyInfoJson = (await dynamoDb.getItem('Tournament', 'TournamentPId', tPId, ['Information']))['Information'];
    tourneyInfoJson['SeasonName'] = await getSeasonName(tourneyInfoJson['SeasonPId']);
    tourneyInfoJson['SeasonShortName'] = await getSeasonShortName(tourneyInfoJson['SeasonPId']);
    return tourneyInfoJson;
}
app.get('/api/tournament/information/name/:tournamentShortName', async (req, res) => {
    console.log("GET Request Tournament '" + req.params.tournamentShortName + "' Information.");
    var tPId = await getTournamentPId(req.params.tournamentShortName);
    res.json(await getTourneyInfo(tPId));
});

// TODO: Caching
async function getTourneyStats(tPId) {
    var tourneyStatsJson = (await dynamoDb.getItem('Tournament', 'TournamentPId', tPId, ['TourneyStats']))['TourneyStats'];
    return tourneyStatsJson;
}
app.get('/api/tournament/stats/name/:tournamentShortName', async (req, res) => {
    console.log("GET Request Tournament '" + req.params.tournamentShortName + "' Tourney Stats.");
    var tPId = await getTournamentPId(req.params.tournamentShortName);
    res.json(await getTourneyStats(tPId));
});

// TODO: Caching
async function getTourneyLeaderboards(tPId) {
    var leaderboardJson = (await dynamoDb.getItem('Tournament', 'TournamentPId', tPId, ['Leaderboards']))['Leaderboards'];
    var gameRecords = leaderboardJson['GameRecords'];
    for (var i = 0; i < Object.values(gameRecords).length; ++i) {
        var gameObject = Object.values(gameRecords)[i];
        gameObject['BlueTeamName'] = await getTeamName(gameObject['BlueTeamHId']);
        gameObject['RedTeamName'] = await getTeamName(gameObject['RedTeamHId']);
    }
    var playerRecords = leaderboardJson['PlayerSingleRecords'];
    for (var i = 0; i < Object.values(playerRecords).length; ++i) {
        var playerList = Object.values(playerRecords)[i];
        for (var j = 0; j < playerList.length; ++j) {
            var playerObject = playerList[j];
            playerObject['ProfileName'] = await getProfileName(playerObject['ProfileHId']);
            playerObject['BlueTeamName'] = await getTeamName(playerObject['BlueTeamHId']);
            playerObject['RedTeamName'] = await getTeamName(playerObject['RedTeamHId']);
        }
    }
    var teamRecords = leaderboardJson['TeamSingleRecords'];
    for (var i = 0; i < Object.values(teamRecords).length; ++i) {
        var teamList = Object.values(teamRecords)[i];
        for (var j = 0; j < teamList.length; ++j) {
            var teamObject = teamList[j];
            teamObject['TeamName'] = await getTeamName(teamObject['TeamHId']);
            teamObject['BlueTeamName'] = await getTeamName(teamObject['BlueTeamHId']);
            teamObject['RedTeamName'] = await getTeamName(teamObject['RedTeamHId']);
        }
    }
    return leaderboardJson;
}
app.get('/api/tournament/leaderboards/name/:tournamentShortName', async (req, res) => {
    console.log("GET Request Tournament '" + req.params.tournamentShortName + "' Leaderboards.");
    var tPId = await getTournamentPId(req.params.tournamentShortName);
    res.json(await getTourneyLeaderboards(tPId));
});

// TODO: Caching
async function getTourneyPlayerStats(tPId) {
    var profileHIdList = (await dynamoDb.getItem('Tournament', 'TournamentPId', tPId, ['ProfileHIdList']))['ProfileHIdList'];
    var profileData = [];
    for (var i = 0; i < profileHIdList.length; ++i) {
        var pPId = getPIdString(profileHIdList[i], profileHashIds);
        var profileStatsLog = await getProfileStatsByTourney(pPId, tPId);
        for (var j = 0; j < Object.keys(profileStatsLog['RoleStats']).length; ++j) {
            var role = Object.keys(profileStatsLog['RoleStats'])[j];
            var statsObj = profileStatsLog['RoleStats'][role];
            profileData.push({
                'ProfileName': await getProfileName(profileHIdList[i]),
                'Role': role,
                'GamesPlayed': statsObj.GamesPlayed,
                'GamesWin': statsObj.GamesWin,
                'Kda': statsObj.Kda,
                'TotalKills': statsObj.TotalKills,
                'TotalDeaths': statsObj.TotalDeaths,
                'TotalAssists': statsObj.TotalAssists,
                'KillPct': statsObj.KillPct,
                'DeathPct': statsObj.DeathPct,
                'GoldPct': statsObj.GoldPct,
                'FirstBloodPct': statsObj.FirstBloodPct,
                'DamagePct': statsObj.DamagePct,
                'VisionScorePct': statsObj.VisionScorePct,
                'CreepScorePerMinute': statsObj.CreepScorePerMinute,
                'GoldPerMinute': statsObj.GoldPerMinute,
                'DamagePerMinute': statsObj.DamagePerMinute,
                'VisionScorePerMinute': statsObj.VisionScorePerMinute,
                'WardsPerMinute': statsObj.WardsPerMinute,
                'ControlWardsPerMinute': statsObj.ControlWardsPerMinute,
                'AverageCsAtEarly': statsObj.AverageCsAtEarly,
                'AverageGoldAtEarly': statsObj.AverageGoldAtEarly,
                'AverageXpAtEarly': statsObj.AverageXpAtEarly,
                'AverageCsDiffEarly': statsObj.AverageCsDiffEarly,
                'AverageGoldDiffEarly': statsObj.AverageGoldDiffEarly,
                'AverageXpDiffEarly': statsObj.AverageXpDiffEarly,
                'TotalDoubleKills': statsObj.TotalDoubleKills,
                'TotalTripleKills': statsObj.TotalTripleKills,
                'TotalQuadraKills': statsObj.TotalQuadraKills,
                'TotalPentaKills': statsObj.TotalPentaKills,
                'TotalSoloKills': statsObj.TotalSoloKills,
            });
        }
    }
    return profileData;
}
app.get('/api/tournament/players/name/:tournamentShortName', async (req, res) => {
    console.log("GET Request Tournament '" + req.params.tournamentShortName + "' Players.");
    var tPId = await getTournamentPId(req.params.tournamentShortName);
    res.json(await getTourneyPlayerStats(tPId));
});

// TODO: Caching
async function getTourneyTeamStats(tPId) {
    var teamHIdList = (await dynamoDb.getItem('Tournament', 'TournamentPId', tPId, ['TeamHIdList']))['TeamHIdList'];
    var teamData = [];
    for (var i = 0; i < teamHIdList.length; ++i) {
        var teamId = getPIdString(teamHIdList[i], teamHashIds);
        var teamStatsLog = await getTeamStatsByTourney(teamId, tPId);
        teamData.push({
            'TeamName': await getTeamName(teamHIdList[i]),
            'GamesPlayed': teamStatsLog.GamesPlayed,
            'GamesWin': teamStatsLog.GamesWon,
            'AverageGameDuration': teamStatsLog.AverageGameDuration,
            'KillDeathRatio': teamStatsLog.KillDeathRatio,
            'AverageKills': teamStatsLog.AverageKills,
            'AverageDeaths': teamStatsLog.AverageDeaths,
            'AverageAssists': teamStatsLog.AverageAssists,
            'CreepScorePerMinute': teamStatsLog.CreepScorePerMinute,
            'GoldPerMinute': teamStatsLog.GoldPerMinute,
            'VisionScorePerMinute': teamStatsLog.VisionScorePerMinute,
            'WardsPerMinute': teamStatsLog.WardsPerMinute,
            'ControlWardsPerMinute': teamStatsLog.ControlWardsPerMinute,
            'WardsClearedPerMinute': teamStatsLog.WardsClearedPerMinute,
            'FirstBloodPct': teamStatsLog.FirstBloodPct,
            'FirstTowerPct': teamStatsLog.FirstTowerPct,
            'DragonPct': teamStatsLog.DragonPct,
            'HeraldPct': teamStatsLog.HeraldPct,
            'BaronPct': teamStatsLog.BaronPct,
            'WardsClearedPct': teamStatsLog.WardsClearedPct,
            'AverageTowersTaken': teamStatsLog.AverageTowersTaken,
            'AverageTowersLost': teamStatsLog.AverageTowersLost,
            'AverageDragonsTaken': teamStatsLog.AverageDragonsTaken,
            'AverageHeraldsTaken': teamStatsLog.AverageHeraldsTaken,
            'AverageBaronsTaken': teamStatsLog.AverageBaronsTaken,
            'AverageXpDiffEarly': teamStatsLog.AverageXpDiffEarly,
            'AverageXpDiffMid': teamStatsLog.AverageXpDiffMid,
            'AverageGoldDiffEarly': teamStatsLog.AverageGoldDiffEarly,
            'AverageGoldDiffMid': teamStatsLog.AverageGoldDiffMid,
            'AverageCsDiffEarly': teamStatsLog.AverageCsDiffEarly,
            'AverageCsDiffMid': teamStatsLog.AverageCsDiffMid,
        });
    }
    return teamData;
}
app.get('/api/tournament/teams/name/:tournamentShortName', async (req, res) => {
    console.log("GET Request Tournament '" + req.params.tournamentShortName + "' Teams.");
    var tPId = await getTournamentPId(req.params.tournamentShortName);
    res.json(await getTourneyTeamStats(tPId));
});

// TODO: Caching
async function getTourneyPickBans(tPId) {
    var tourneyJson = (await dynamoDb.getItem('Tournament', 'TournamentPId', tPId, ['PickBans', 'TourneyStats']));
    var pickBansJson = tourneyJson['PickBans'];
    var numberGames = tourneyJson['TourneyStats']['NumberGames'];
    for (var i = 0; i < Object.values(pickBansJson).length; ++i) {
        var champObject = Object.values(pickBansJson)[i];
        champObject['TimesPicked'] = champObject['Phase1Bans'] + champObject['Phase2Bans'];
        champObject['TimesBanned'] = champObject['BluePicks'] + champObject['RedPicks'];
        champObject['Presence'] = ((champObject['TimesPicked'] + champObject['TimesBanned']) / numberGames).toFixed(4);
    }
    return pickBansJson;
}
app.get('/api/tournament/pickbans/name/:tournamentShortName', async (req, res) => {
    console.log("GET Request Tournament '" + req.params.tournamentShortName + "' Pick Bans.");
    var tPId = await getTournamentPId(req.params.tournamentShortName);
    res.json(await getTourneyPickBans(tPId));
});

// TODO: Caching
async function getTourneyGames(tPId) {
    var gameLogJson = (await dynamoDb.getItem('Tournament', 'TournamentPId', tPId, ['GameLog']))['GameLog'];
    for (var i = 0; i < Object.values(gameLogJson).length; ++i) {
        var gameJson = Object.values(gameLogJson)[i];
        gameJson['BlueTeamName'] = await getTeamName(gameJson['BlueTeamHId']);
        gameJson['RedTeamName'] = await getTeamName(gameJson['RedTeamHId']);
    }
    return gameLogJson;
}
app.get('/api/tournament/games/name/:tournamentShortName', async (req, res) => {
    console.log("GET Request Tournament '" + req.params.tournamentShortName + "' Game Log.");
    var tPId = await getTournamentPId(req.params.tournamentShortName);
    res.json(await getTourneyGames(tPId));
});

//#endregion

/*  
    ----------------------
    Match API Requests
    ----------------------
*/
//#region Match

// TODO: Caching
app.get('/api/match/:matchId', async (req, res) => {
    console.log("GET Request Match '" + req.params.matchId + "'.");
    var matchJson = await dynamoDb.getItem('Matches', 'MatchPId', req.params.matchId);
    // Replace the HIds with the actual Names (will have to learn how to cache on the server side later)
    var seasonPId = matchJson['SeasonPId'];
    matchJson['SeasonShortName'] = await getSeasonShortName(seasonPId);
    matchJson['SeasonName'] = await getSeasonName(seasonPId);
    var tourneyPId = matchJson['TournamentPId'];
    matchJson['TournamentShortName'] = await getTournamentShortName(tourneyPId);
    matchJson['TournamentName'] = await getTournamentName(tourneyPId);
    var gameDurationMinute = matchJson['GameDuration'] / 60;
    for (var i = 0; i < Object.keys(matchJson['Teams']).length; ++i) {
        var teamId = Object.keys(matchJson['Teams'])[i];
        var teamJson = matchJson['Teams'][teamId];
        teamJson['TeamName'] = await getTeamName(teamJson['TeamHId']);
        for (var j = 0; j < Object.keys(teamJson['Players']).length; ++j) {
            var partId = Object.keys(teamJson['Players'])[j];
            var playerJson = teamJson['Players'][partId];
            playerJson['ProfileName'] = await getProfileName(playerJson['ProfileHId']);
            playerJson['Kda'] = (playerJson['Deaths'] > 0) ? (((playerJson['Kills'] + playerJson['Assists']) / playerJson['Deaths']).toFixed(2)).toString() : "Perfect";
            playerJson['KillPct'] = ((playerJson['Kills'] + playerJson['Assists']) / teamJson['TeamKills']).toFixed(4);
            playerJson['DeathPct'] = (playerJson['Deaths'] / teamJson['TeamDeaths']).toFixed(4);
            playerJson['GoldPct'] = (playerJson['Gold'] / teamJson['TeamGold']).toFixed(4);
            playerJson['GoldPerMinute'] = (playerJson['Gold'] / gameDurationMinute).toFixed(2);
            playerJson['DamageDealtPct'] = (playerJson['TotalDamageDealt'] / teamJson['TeamDamageDealt']).toFixed(4);
            playerJson['DamagePerMinute'] = (playerJson['TotalDamageDealt'] / gameDurationMinute).toFixed(2);
            playerJson['CreepScorePct'] = (playerJson['CreepScore'] / teamJson['TeamCreepScore']).toFixed(4);
            playerJson['CreepScorePerMinute'] = (playerJson['CreepScore'] / gameDurationMinute).toFixed(2);
            playerJson['VisionScorePct'] = (playerJson['VisionScore'] / teamJson['TeamVisionScore']).toFixed(4);
            playerJson['VisionScorePerMinute'] = (playerJson['VisionScore'] / gameDurationMinute).toFixed(2);
            playerJson['WardsPlacedPerMinute'] = (playerJson['WardsPlaced'] / gameDurationMinute).toFixed(2);
            playerJson['ControlWardsBoughtPerMinute'] = (playerJson['ControlWardsBought'] / gameDurationMinute).toFixed(2);
            playerJson['WardsClearedPerMinute'] = (playerJson['WardsCleared'] / gameDurationMinute).toFixed(2);
        }
    }
    res.json(matchJson);
});

//#endregion

const port = 5000;

app.listen(port, () => console.log(`Stats server started on port ${port}`));