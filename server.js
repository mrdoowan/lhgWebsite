// This will be used for the back-end and interface with both APIs
// This calls on LHG's relational Stats DB

/*  Declaring npm modules */
const express = require('express');
const app = express();
const Hashids = require('hashids/cjs'); // For hashing and unhashing
const redis = require('redis');

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
const cache = redis.createClient(envVars.REDIS_PORT);

/*  Cache Keys */
// Code === ShortName
const LEAGUE_KEY = 'Leagues';
const SEASON_CODE_PREFIX = 'SnCode-';           // Season Id
const SEASON_NAME_PREFIX = 'SnName-';           // Season Id
const SEASON_TIME_PREFIX = 'SnTime-';           // Season Id
const SEASON_ID_PREFIX = 'SnId-';               // Season sName
const SEASON_INFO_PREFIX = 'SnInfo-';           // Season Id
const SEASON_ROSTER_PREFIX = 'SnRoster-';       // Season Id
const SEASON_REGULAR_PREFIX = 'SnRegular-';     // Season Id
const SEASON_PLAYOFF_PREFIX = 'SnPlayoff-';     // Season Id
const TN_CODE_PREFIX = 'TnCode-';               // Tourn Id
const TN_NAME_PREFIX = 'TnName-';               // Tourn Id
const TN_ID_PREFIX = 'TnId-';                   // Tourn sName
const TN_INFO_PREFIX = 'TnInfo-';               // Tourn Id
const TN_STATS_PREFIX = 'TnStats-';             // Tourn Id
const TN_LEADER_PREFIX = 'TnLB-';               // Tourn Id
const TN_PLAYER_PREFIX = 'TnPlay-';             // Tourn Id
const TN_TEAM_PREFIX = 'TnTeam-';               // Tourn Id
const TN_PICKBANS_PREFIX = 'TnPB-';             // Tourn Id
const TN_GAMES_PREFIX = 'TnGames-';             // Tourn Id
const PROFILE_NAME_PREFIX = 'PName-';           // Prof Id
const PROFILE_PID_PREFIX = 'PPId-';             // Prof Name
const PROFILE_INFO_PREFIX = 'PInfo-';           // Prof Id
const PROFILE_GAMES_PREFIX = 'PGames-';         // Prof Id, Season Id
const PROFILE_STATS_PREFIX = 'PStats-';         // Prof Id, Tourn Id
const TEAM_NAME_PREFIX = 'TName-';              // Team Id
const TEAM_PID_PREFIX = 'TPId-';                // Team Name
const TEAM_INFO_PREFIX = 'TInfo-';              // Team Id
const TEAM_SCOUT_PREFIX = 'TScout-';            // Team Id, Season Id
const TEAM_GAMES_PREFIX = 'TGames-';            // Team Id, Season Id
const TEAM_STATS_PREFIX = 'TStats-';            // Team Id, Tourn Id
const MATCH_PREFIX = 'Match-';                  

/*  
    ----------------------
    Helper Functions
    ----------------------
*/
//#region Helper functions

// Turn number into string
function strPadZeroes(num, size) {
    let s = num+"";
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

//#endregion

//#region DynamoDb Helper Functions (w/ Caching)

// Get ProfileName from DynamoDb
function getProfileName(pHId) {
    let pPId = getPIdString(pHId, profileHashIds);
    let cacheKey = PROFILE_NAME_PREFIX + pPId;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, (err, data) => {
            if (err) reject(err);
            if (data != null) resolve(data);
            else {
                dynamoDb.getItem('Profile', 'ProfilePId', pPId, ['ProfileName'])
                .then((obj) => {
                    cache.set(cacheKey, obj['ProfileName']);
                    resolve(obj['ProfileName']);
                });
            }
        });
    });
}

// Get ProfilePId from ProfileName
function getProfilePId(name) {
    let simpleName = filterName(name);
    let cacheKey = PROFILE_PID_PREFIX + simpleName;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, (err, data) => {
            if (err) reject(err);
            if (data != null) resolve(data);
            else {
                dynamoDb.getItem('ProfileNameMap', 'ProfileName', simpleName)
                .then((obj) => {
                    let pPId = getPIdString(obj['ProfileHId'], profileHashIds);
                    cache.set(cacheKey, pPId);
                    resolve(pPId);
                });
            }
        });
    });
}

// Get TeamName from DynamoDb
function getTeamName(tHId) {
    let tPId = getPIdString(tHId, teamHashIds);
    let cacheKey = TEAM_NAME_PREFIX + tPId;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, (err, data) => {
            if (err) reject(err);
            if (data != null) resolve(data);
            else {
                dynamoDb.getItem('Team', 'TeamPId', tPId, ['TeamName'])
                .then((obj) => {
                    let name = obj['TeamName'];
                    cache.set(cacheKey, name);
                    resolve(name);
                });
            }
        });
    });
}

// Get TeamPId from TeamName
function getTeamPId(name) {
    let simpleName = filterName(name);
    let cacheKey = TEAM_PID_PREFIX + simpleName;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, (err, data) => {
            if (err) reject(err);
            if (data != null) resolve(data);
            else {
                dynamoDb.getItem('TeamNameMap', 'TeamName', simpleName)
                .then((obj) => {
                    let tPId = getPIdString(obj['TeamHId'], teamHashIds);
                    cache.set(cacheKey, tPId);
                    resolve(tPId);
                });
            }
        });
    });
}

// Get TournamentShortName from DynamoDb
function getTournamentShortName(tPId) {
    let cacheKey = TN_CODE_PREFIX + tPId;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, (err, data) => {
            if (err) reject(err);
            if (data != null) resolve(data);
            else {
                dynamoDb.getItem('Tournament', 'TournamentPId', tPId, ['TournamentShortName'])
                .then((obj) => {
                    let shortName = obj['TournamentShortName'];
                    cache.set(cacheKey, shortName);
                    resolve(shortName);
                });
            }
        });
    });
}

// Get TournamentName from DynamoDb
function getTournamentName(tPId) {
    let cacheKey = TN_NAME_PREFIX + tPId;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, (err, data) => {
            if (err) reject(err);
            if (data != null) resolve(data);
            else {
                dynamoDb.getItem('Tournament', 'TournamentPId', tPId, ['Information'])
                .then((obj) => {
                    let name = obj['Information']['TournamentName'];
                    cache.set(cacheKey, name);
                    resolve(name);
                });
            }
        });
    });
}

// Get SeasonShortName from DynamoDb
function getSeasonShortName(sPId) {
    let cacheKey = SEASON_CODE_PREFIX + sPId;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, (err, data) => {
            if (err) reject(err);
            if (data != null) resolve(data);
            else {
                dynamoDb.getItem('Season', 'SeasonPId', sPId, ['SeasonShortName'])
                .then((obj) => {
                    let shortName = obj['SeasonShortName'];
                    cache.set(cacheKey, shortName);
                    resolve(shortName);
                });
            }
        });
    });
}

// Get SeasonName from DynamoDb
function getSeasonName(sPId) {
    let cacheKey = SEASON_NAME_PREFIX + sPId;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, (err, data) => {
            if (err) reject(err);
            if (data != null) resolve(data);
            else {
                dynamoDb.getItem('Season', 'SeasonPId', sPId, ['Information'])
                .then((obj) => {
                    let name = obj['Information']['SeasonName'];
                    cache.set(cacheKey, name);
                    resolve(name);
                });
            }
        });
    });
}

function getSeasonTime(sPId) {
    let cacheKey = SEASON_TIME_PREFIX + sPId;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, (err, data) => {
            if (err) reject(err);
            if (data != null) resolve(data);
            else {
                dynamoDb.getItem('Season', 'SeasonPId', sPId, ['Information'])
                .then((obj) => {
                    let time = obj['Information']['SeasonTime'];
                    cache.set(cacheKey, time);
                    resolve(time);
                });
            }
        });
    });
}

// Get SeasonPId from DynamoDb
function getSeasonId(shortName) {
    let simpleName = filterName(shortName);
    let cacheKey = SEASON_ID_PREFIX + simpleName;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, (err, data) => {
            if (err) reject(err);
            if (data != null) resolve(parseInt(data)); // NOTE: Needs to be number
            else {
                dynamoDb.scanTable('Season', ['SeasonPId'], 'SeasonShortName', simpleName)
                .then((obj) => {
                    let Id = obj[0]['SeasonPId'];
                    cache.set(cacheKey, Id);
                    resolve(Id);
                });
            }
        });
    });
}

// Get TournamentPId from DynamoDb
function getTournamentPId(shortName) {
    let simpleName = filterName(shortName);
    let cacheKey = TN_ID_PREFIX + simpleName;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, (err, data) => {
            if (err) reject(err);
            if (data != null) resolve(parseInt(data)); // NOTE: Needs to be number
            else {
                dynamoDb.scanTable('Tournament', ['TournamentPId'], 'TournamentShortName', simpleName)
                .then((obj) => {
                    let Id = obj[0]['TournamentPId'];
                    cache.set(cacheKey, Id);
                    resolve(Id);
                });
            }
        });
    });
}

//#endregion

/*  
    ----------------------
    League API Requests
    ----------------------
*/
//#region League

app.get('/api/leagues', (req, res) => {
    console.log("GET Request Leagues.");
    cache.get(LEAGUE_KEY, async (err, data) => {
        if (err) res.status(500).json(err);
        if (data != null) res.json(JSON.parse(data));
        else {
            let seasonList = await dynamoDb.scanTable('Season', ['Information']);
            let leagueObject = {};
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
            let leagueList = Object.values(leagueObject).sort((a, b) => (a.Date < b.Date) ? 1 : -1);
            cache.set(LEAGUE_KEY, JSON.stringify(leagueList, null, 2));
            res.json(leagueList);     
        }
    });
});

//#endregion

/*  
    ----------------------
    Season API Requests
    ----------------------
*/
//#region Season

function getSeasonInformation(sPId) {
    let cacheKey = SEASON_INFO_PREFIX + sPId;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, async (err, data) => {
            if (err) reject(err);
            if (data != null) resolve(JSON.parse(data));
            else {
                let seasonInfoJson = (await dynamoDb.getItem('Season', 'SeasonPId', sPId, ['Information']))['Information'];
                seasonInfoJson['TournamentPIds']['RegTournamentShortName'] = await getTournamentShortName(seasonInfoJson['TournamentPIds']['RegTournamentPId']);
                seasonInfoJson['TournamentPIds']['PostTournamentShortName'] = await getTournamentShortName(seasonInfoJson['TournamentPIds']['PostTournamentPId']);
                if ('FinalStandings' in seasonInfoJson) {
                    for (let i = 0; i < seasonInfoJson['FinalStandings'].length; ++i) {
                        let teamObject = seasonInfoJson['FinalStandings'][i];
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
                cache.set(cacheKey, JSON.stringify(seasonInfoJson, null, 2));
                resolve(seasonInfoJson);
            }
        });
    });
}
app.get('/api/season/information/name/:seasonShortName', async (req, res) => {
    console.log("GET Request Season '" + req.params.seasonShortName + "' Information.");
    let sPId = await getSeasonId(req.params.seasonShortName);
    res.json(await getSeasonInformation(sPId));
});

function getSeasonRoster(sPId) {
    let cacheKey = SEASON_ROSTER_PREFIX + sPId;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, async (err, data) => {
            if (err) reject(err);
            if (data != null) resolve(JSON.parse(data));
            else {
                let seasonRosterJson = (await dynamoDb.getItem('Season', 'SeasonPId', sPId, ['Roster']))['Roster'];
                if ('Teams' in seasonRosterJson) {
                    for (let i = 0; i < Object.keys(seasonRosterJson['Teams']).length; ++i) {
                        let teamHId = Object.keys(seasonRosterJson['Teams'])[i];
                        let teamJson = seasonRosterJson['Teams'][teamHId];
                        teamJson['TeamName'] = await getTeamName(teamHId);
                        for (let j = 0; j < Object.keys(teamJson['Players']).length; ++j) {
                            let profileHId = Object.keys(teamJson['Players'])[j];
                            let playerJson = teamJson['Players'][profileHId];
                            playerJson['ProfileName'] = await getProfileName(profileHId);
                        }
                    }
                }
                if ('FreeAgents' in seasonRosterJson) {
                    for (let i = 0; i < Object.keys(seasonRosterJson['FreeAgents']).length; ++i) {
                        let profileHId = Object.keys(seasonRosterJson['FreeAgents'])[i];
                        let playerJson = seasonRosterJson['FreeAgents'][profileHId];
                        playerJson['ProfileName'] = await getProfileName(profileHId);
                    }
                }
                if ('ESubs' in seasonRosterJson) {
                    for (let i = 0; i < Object.keys(seasonRosterJson['ESubs']).length; ++i) {
                        let profileHId = Object.keys(seasonRosterJson['ESubs'])[i];
                        playerJson['ProfileName'] = await getProfileName(profileHId);
                    }
                }
                cache.set(cacheKey, JSON.stringify(seasonRosterJson, null, 2));
                resolve(seasonRosterJson);
            }
        });
    });
}
app.get('/api/season/roster/name/:seasonShortName', async (req, res) => {
    console.log("GET Request Season '" + req.params.seasonShortName + "' Roster.");
    let sPId = await getSeasonId(req.params.seasonShortName);
    res.json(await getSeasonRoster(sPId));
});

function getSeasonRegular(sPId) {
    let cacheKey = SEASON_REGULAR_PREFIX + sPId;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, async (err, data) => {
            if (err) reject(err);
            if (data != null) resolve(JSON.parse(data));
            else {
                let seasonRegularJson = (await dynamoDb.getItem('Season', 'SeasonPId', sPId, ['Regular']))['Regular'];
                for (let i = 0; i < seasonRegularJson['RegularSeasonDivisions'].length; ++i) {
                    let divisionJson = seasonRegularJson['RegularSeasonDivisions'][i];
                    for (let j = 0; j < divisionJson['RegularSeasonTeams'].length; ++j) {
                        let teamJson = divisionJson['RegularSeasonTeams'][j];
                        teamJson['TeamName'] = await getTeamName(teamJson['TeamHId']);
                    }
                }
                for (let i = 0; i < seasonRegularJson['RegularSeasonGames'].length; ++i) {
                    let gameJson = seasonRegularJson['RegularSeasonGames'][i];
                    gameJson['BlueTeamName'] = await getTeamName(gameJson['BlueTeamHId']);
                    gameJson['RedTeamName'] = await getTeamName(gameJson['RedTeamHid']);
                    gameJson['ModeratorName'] = await getProfileName(gameJson['ModeratorHId']);
                    gameJson['MvpName'] = await getProfileName(gameJson['MvpHId']);
                }
                cache.set(cacheKey, JSON.stringify(seasonRegularJson, null, 2));
                resolve(seasonRegularJson);
            }
        });
    });
}
app.get('/api/season/regular/name/:seasonShortName', async (req, res) => {
    console.log("GET Request Season '" + req.params.seasonShortName + "' Regular.");
    let sPId = await getSeasonId(req.params.seasonShortName);
    res.json(await getSeasonRegular(sPId));
});

function getSeasonPlayoffs(sPId) {
    let cacheKey = SEASON_PLAYOFF_PREFIX + sPId;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, async (err, data) => {
            if (err) reject(err);
            if (data != null) resolve(JSON.parse(data));
            else {
                let playoffJson = (await dynamoDb.getItem('Season', 'SeasonPId', sPId, ['Playoffs']))['Playoffs'];
                for (let i = 0; i < Object.values(playoffJson['PlayoffBracket']).length; ++i) {
                    let roundTypeArray = Object.values(playoffJson['PlayoffBracket'])[i];
                    for (let j = 0; j < roundTypeArray.length; ++j) {
                        let seriesJson = roundTypeArray[j];
                        seriesJson['HigherTeamName'] = await getProfileName(seriesJson['HigherTeamHId']);
                        seriesJson['LowerTeamName'] = await getProfileName(seriesJson['LowerTeamHId']);
                        seriesJson['SeriesMvpName'] = await getProfileName(seriesJson['SeriesMvpHId']);
                    }
                }
                for (let i = 0; i < playoffJson['PlayoffGames'].length; ++i) {
                    let gameJson = playoffJson['PlayoffGames'][i];
                    gameJson['BlueTeamName'] = await getTeamName(gameJson['BlueTeamHId']);
                    gameJson['RedTeamName'] = await getTeamName(gameJson['RedTeamHId']);
                    gameJson['ModeratorName'] = await getProfileName(gameJson['ModeratorHId']);
                    gameJson['MvpName'] = await getProfileName(gameJson['MvpHId']);
                }
                cache.set(cacheKey, JSON.stringify(playoffJson, null, 2));
                resolve(playoffJson);
            }
        });
    });
}
app.get('/api/season/playoffs/name/:seasonShortName', async (req, res) => {
    console.log("GET Request Season '" + req.params.seasonShortName + "' Playoffs.");
    let sPId = await getSeasonId(req.params.seasonShortName);
    res.json(await getSeasonPlayoffs(sPId));
});

//#endregion

/*  
    ----------------------
    Profile API Requests
    ----------------------
*/
//#region Profile

function getProfileInfo(pPId) {
    let cacheKey = PROFILE_INFO_PREFIX + pPId;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, async (err, data) => {
            if (err) reject(err);
            if (data != null) resolve(JSON.parse(data));
            else {
                let profileInfoJson = (await dynamoDb.getItem('Profile', 'ProfilePId', pPId, ['Information']))['Information'];
                if ('ActiveSeasonPId' in profileInfoJson) {
                    profileInfoJson['ActiveSeasonShortName'] = await getSeasonShortName(profileInfoJson['ActiveSeasonPId']);
                    profileInfoJson['ActiveSeasonName'] = await getSeasonName(profileInfoJson['ActiveSeasonPId']);
                }
                if ('ActiveTeamHId' in profileInfoJson) {
                    profileInfoJson['ActiveTeamName'] = await getTeamName(profileInfoJson['ActiveTeamHId']);
                }
                cache.set(cacheKey, JSON.stringify(profileInfoJson, null, 2));
                resolve(profileInfoJson);
            }
        });
    });
}
app.get('/api/profile/information/name/:profileName', async (req, res) => {
    console.log("GET Request Profile '" + req.params.profileName + "' Information.");
    let pPId = await getProfilePId(req.params.profileName);
    res.json(await getProfileInfo(pPId));
});

function getProfileGamesBySeason(pPId, sPId) {
    let cacheKey = PROFILE_GAMES_PREFIX + pPId + '-' + sPId;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, async (err, data) => {
            if (err) reject(err);
            if (data != null) resolve(JSON.parse(data));
            else {
                let profileGamesJson = (await dynamoDb.getItem('Profile', 'ProfilePId', pPId, ['GameLog']))['GameLog'][sPId];
                profileGamesJson['SeasonTime'] = await getSeasonTime(sPId);
                for (let i = 0; i < Object.values(profileGamesJson['Matches']).length; ++i) {
                    let matchJson = Object.values(profileGamesJson['Matches'])[i];
                    matchJson['TeamName'] = await getTeamName(matchJson['TeamHId']);
                    matchJson['EnemyTeamName'] = await getTeamName(matchJson['EnemyTeamHId']);
                    matchJson['KillPct'] = ((matchJson['Kills'] + matchJson['Assists']) / matchJson['TeamKills']).toFixed(4);
                    matchJson['DamagePct'] = (matchJson['DamageDealt'] / matchJson['TeamDamage']).toFixed(4);
                    matchJson['GoldPct'] = (matchJson['Gold'] / matchJson['TeamGold']).toFixed(4);
                    matchJson['VisionScorePct'] = (matchJson['VisionScore'] / matchJson['TeamVS']).toFixed(4);
                }
                cache.set(cacheKey, JSON.stringify(profileGamesJson, null, 2));
                resolve(profileGamesJson);
            }
        });
    });
}
app.get('/api/profile/games/name/:profileName/:seasonShortName', async (req, res) => {
    console.log("GET Request Profile '" + req.params.profileName + "' Game Log for Season '" + req.params.seasonShortName +  "'.");
    let pPId = await getProfilePId(req.params.profileName);
    let sPId = await getSeasonId(req.params.seasonShortName);
    res.json(await getProfileGamesBySeason(pPId, sPId));
});

function getProfileStatsByTourney(pPId, tPId) {
    let cacheKey = PROFILE_STATS_PREFIX + pPId + '-' + tPId;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, async (err, data) => {
            if (err) reject(err);
            if (data != null) resolve(JSON.parse(data));
            else {
                let profileStatsJson = (await dynamoDb.getItem('Profile', 'ProfilePId', pPId, ['StatsLog']))['StatsLog'][tPId];
                profileStatsJson['TournamentName'] = await getTournamentName(tPId);
                for (let i = 0; i < Object.keys(profileStatsJson['RoleStats']).length; ++i) {
                    let role = Object.keys(profileStatsJson['RoleStats'])[i];
                    let statsJson = profileStatsJson['RoleStats'][role];
                    let gameDurationMinute = statsJson['TotalGameDuration'] / 60;
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
                cache.set(cacheKey, JSON.stringify(profileStatsJson, null, 2));
                resolve(profileStatsJson);
            }
        });
    });
}
app.get('/api/profile/stats/name/:profileName/:tournamentShortName', async (req, res) => {
    console.log("GET Request Profile '" + req.params.profileName + "' Stats Log for Tournament '" + req.params.tournamentShortName +  "'.");
    let pPId = await getProfilePId(req.params.profileName);
    let tPId = await getTournamentPId(req.params.tournamentShortName);
    res.json(await getProfileStatsByTourney(pPId, tPId));
});

//#endregion

/*  
    ----------------------
    Team API Requests
    ----------------------
*/

//#region Team

function getTeamInfo(teamPId) {
    let cacheKey = TEAM_INFO_PREFIX + teamPId;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, async (err, data) => {
            if (err) reject(err);
            if (data != null) resolve(JSON.parse(data));
            else {
                let teamInfoJson = (await dynamoDb.getItem('Team', 'TeamPId', teamPId, ['Information']))['Information'];
                if ('TrophyCase' in teamInfoJson) {
                    for (let i = 0; i < Object.keys(teamInfoJson['TrophyCase']).length; ++i) {
                        let sPId = Object.keys(teamInfoJson['TrophyCase'])[i];
                        teamInfoJson['TrophyCase'][sPId]['Seasonname'] = getSeasonName(sPId);
                        teamInfoJson['TrophyCase'][sPId]['SeasonShortName'] = getSeasonShortName(sPId);
                    }
                }
                cache.set(cacheKey, JSON.stringify(teamInfoJson, null, 2));
                resolve(teamInfoJson);
            }
        });
    });
}
app.get('/api/team/information/name/:teamName', async (req, res) => {
    console.log("GET Request Team '" + req.params.teamName + "' Information.");
    let teamId = await getTeamPId(req.params.teamName);
    res.json(await getTeamInfo(teamId));
});

function getTeamScoutingBySeason(teamPId, sPId) {
    let cacheKey = TEAM_SCOUT_PREFIX + teamPId + '-' + sPId;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, async (err, data) => {
            if (err) reject(err);
            if (data != null) resolve(JSON.parse(data));
            else {
                let teamScoutingJson = (await dynamoDb.getItem('Team', 'TeamPId', teamPId, ['Scouting']))['Scouting'][sPId];
                teamScoutingJson['SeasonTime'] = await getSeasonTime(sPId);
                for (let i = 0; i < Object.values(teamScoutingJson['PlayerLog']).length; ++i) {
                    let roleMap = Object.values(teamScoutingJson['PlayerLog'])[i];
                    for (let j = 0; j < Object.keys(roleMap).length; ++j) {
                        let profileHId = Object.keys(roleMap)[j];
                        let statsJson = roleMap[profileHId];
                        statsJson['ProfileName'] = await getProfileName(profileHId);
                        statsJson['TotalKdaPlayer'] = (statsJson['TotalDeathsPlayer'] > 0) ? ((statsJson['TotalKillsPlayer'] + statsJson['TotalAssistsPlayer']) / statsJson['TotalDeathsPlayer']).toFixed(2).toString() : "Perfect";
                        statsJson['KillPctPlayer'] = ((statsJson['TotalKillsPlayer'] + statsJson['TotalAssistsPlayer']) / statsJson['TotalKillsTeam']).toFixed(4);
                        statsJson['DamagePctPlayer'] = (statsJson['TotalDamagePlayer'] / statsJson['TotalDamageTeam']).toFixed(4);
                        statsJson['GoldPctPlayer'] = (statsJson['TotalGoldPlayer'] / statsJson['TotalGoldTeam']).toFixed(4);
                        statsJson['VsPctPlayer'] = (statsJson['TotalVsPlayer'] / statsJson['TotalVsTeam']).toFixed(4);
                    }
                }
                cache.set(cacheKey, JSON.stringify(teamScoutingJson, null, 2));
                resolve(teamScoutingJson);
            }
        });
    });
}
app.get('/api/team/scouting/name/:teamName/:seasonShortName', async (req, res) => {
    console.log("GET Request Team '" + req.params.teamName + "' Scouting for Season '" + req.params.seasonShortName +  "'.");
    let teamId = await getTeamPId(req.params.teamName);
    let sPId = await getSeasonId(req.params.seasonShortName);
    res.json(await getTeamScoutingBySeason(teamId, sPId));
});

function getTeamGamesBySeason(teamPId, sPId) {
    let cacheKey = TEAM_GAMES_PREFIX + teamPId + '-' + sPId;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, async (err, data) => {
            if (err) reject(err);
            if (data != null) resolve(JSON.parse(data));
            else {
                let gameLogJson = (await dynamoDb.getItem('Team', 'TeamPId', teamPId, ['GameLog']))['GameLog'][sPId];
                gameLogJson['SeasonTime'] = getSeasonTime(sPId);
                for (let i = 0; i < Object.values(gameLogJson['Matches']).length; ++i) {
                    let matchObject = Object.values(gameLogJson['Matches'])[i];
                    for (let j = 0; j < Object.values(matchObject['ChampPicks']).length; ++j) {
                        let champObject = Object.values(matchObject['ChampPicks'])[j];
                        champObject['ProfileName'] = await getProfileName(champObject['ProfileHId']);
                    }
                    matchObject['EnemyTeamName'] = await getTeamName(matchObject['EnemyTeamHId']);
                }
                cache.set(cacheKey, JSON.stringify(gameLogJson, null, 2));
                resolve(gameLogJson);
            }
        });
    });
}
app.get('/api/team/games/name/:teamName/:seasonShortName', async (req, res) => {
    console.log("GET Request Team '" + req.params.teamName + "' Game Log for Season '" + req.params.seasonShortName +  "'.");
    let teamId = await getTeamPId(req.params.teamName);
    let sPId = await getSeasonId(req.params.seasonShortName);
    res.json(await getTeamGamesBySeason(teamId, sPId));
});

function getTeamStatsByTourney(teamPId, tPId) {
    let cacheKey = TEAM_STATS_PREFIX + teamPId + '-' + tPId;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, async (err, data) => {
            if (err) reject(err);
            if (data != null) resolve(JSON.parse(data));
            else {
                let statsJson = (await dynamoDb.getItem('Team', 'TeamPId', teamPId, ['StatsLog']))['StatsLog'][tPId];
                let totalGameDurationMinute = statsJson['TotalGameDuration'] / 60;
                statsJson['TournamentName'] = await getTournamentName(tPId);
                statsJson['GamesPlayedOnRed'] = statsJson['GamesPlayed'] - statsJson['GamesPlayedOnBlue'];
                statsJson['RedWins'] = statsJson['GamesWon'] - statsJson['BlueWins'];
                statsJson['AverageGameDuration'] = (statsJson['TotalGameDuration'] / statsJson['GamesPlayed']).toFixed(2);
                statsJson['AverageKills'] = (statsJson['TotalKills'] / statsJson['GamesPlayed']).toFixed(1);
                statsJson['AverageDeaths'] = (statsJson['TotalDeaths'] / statsJson['GamesPlayed']).toFixed(1);
                statsJson['KillDeathRatio'] = (statsJson['TotalDeaths'] > 0) ? (statsJson['TotalKills'] / statsJson['TotalDeaths']).toFixed(2).toString() : "Perfect";
                statsJson['AverageAssists'] = (statsJson['TotalAssists'] / statsJson['GamesPlayed']).toFixed(1);
                statsJson['GoldPerMinute'] = (statsJson['TotalGold'] / totalGameDurationMinute).toFixed(2);
                statsJson['DamagePerMinute'] = (statsJson['TotalDamageDealt'] / totalGameDurationMinute).toFixed(2);
                statsJson['CreepScorePerMinute'] = (statsJson['TotalCreepScore'] / totalGameDurationMinute).toFixed(2);
                statsJson['VisionScorePerMinute'] = (statsJson['TotalVisionScore'] / totalGameDurationMinute).toFixed(2);
                statsJson['WardsPerMinute'] = (statsJson['TotalWardsPlaced'] / totalGameDurationMinute).toFixed(2);
                statsJson['ControlWardsPerMinute'] = (statsJson['TotalControlWardsBought'] / totalGameDurationMinute).toFixed(2);
                statsJson['WardsClearedPerMinute'] = (statsJson['TotalWardsCleared'] / totalGameDurationMinute).toFixed(2);
                statsJson['AverageTowersTaken'] = (statsJson['TotalTowersTaken'] / statsJson['GamesPlayed']).toFixed(1);
                statsJson['AverageTowersLost'] = (statsJson['TotalTowersLost'] / statsJson['GamesPlayed']).toFixed(1);
                statsJson['FirstBloodPct'] = (statsJson['TotalFirstBloods'] / statsJson['GamesPlayed']).toFixed(4);
                statsJson['FirstTowerPct'] = (statsJson['TotalFirstTowers'] / statsJson['GamesPlayed']).toFixed(4);
                statsJson['AverageDragonsTaken'] = (statsJson['TotalDragonsTaken'] / statsJson['GamesPlayed']).toFixed(1);
                statsJson['DragonPct'] = (statsJson['TotalDragonsTaken'] / (statsJson['TotalDragonsTaken'] + statsJson['TotalEnemyDragons'])).toFixed(4);
                statsJson['AverageHeraldsTaken'] = (statsJson['TotalHeraldsTaken'] / statsJson['GamesPlayed']).toFixed(1);
                statsJson['HeraldPct'] = (statsJson['TotalHeraldsTaken'] / (statsJson['TotalHeraldsTaken'] + statsJson['TotalEnemyHeralds'])).toFixed(4);
                statsJson['AverageBaronsTaken'] = (statsJson['TotalBaronsTaken'] / statsJson['GamesPlayed']).toFixed(1);
                statsJson['BaronPct'] = (statsJson['TotalBaronsTaken'] / (statsJson['TotalBaronsTaken'] + statsJson['TotalEnemyBarons'])).toFixed(4);
                statsJson['WardsClearedPct'] = (statsJson['TotalWardsCleared'] / statsJson['TotalEnemyWardsPlaced']).toFixed(4);
                statsJson['AverageXpDiffEarly'] = (statsJson['TotalXpDiffEarly'] / statsJson['GamesPlayedOverEarly']).toFixed(1);
                statsJson['AverageXpDiffMid'] = (statsJson['TotalXpDiffMid'] / statsJson['GamesPlayedOverMid']).toFixed(1);
                statsJson['AverageGoldDiffEarly'] = (statsJson['TotalGoldDiffEarly'] / statsJson['GamesPlayedOverEarly']).toFixed(1);
                statsJson['AverageGoldDiffMid'] = (statsJson['TotalGoldDiffMid'] / statsJson['GamesPlayedOverMid']).toFixed(1);
                statsJson['AverageCsDiffEarly'] = (statsJson['TotalCsDiffEarly'] / statsJson['GamesPlayedOverEarly']).toFixed(1);
                statsJson['AverageCsDiffMid'] = (statsJson['TotalCsDiffMid'] / statsJson['GamesPlayedOverMid']).toFixed(1);
                cache.set(cacheKey, JSON.stringify(statsJson, null, 2));
                resolve(statsJson);
            }
        });
    });
    
}
app.get('/api/team/stats/name/:teamName/:tournamentName', async (req, res) => {
    console.log("GET Request Team '" + req.params.teamName + "' Stats Log for Tournament '" + req.params.tournamentName +  "'.");
    let teamId = await getTeamPId(req.params.teamName);
    let tPId = await getTournamentPId(req.params.tournamentName);
    res.json(await getTeamStatsByTourney(teamId, tPId));
});

//#endregion

/*  
    ----------------------
    Tournament API Requests
    ----------------------
*/

//#region Tournament

function getTourneyInfo(tPId) {
    let cacheKey = TN_INFO_PREFIX + tPId;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, async (err, data) => {
            if (err) reject(err);
            if (data != null) resolve(JSON.parse(data));
            else {
                let tourneyInfoJson = (await dynamoDb.getItem('Tournament', 'TournamentPId', tPId, ['Information']))['Information'];
                if (tourneyInfoJson != null) {
                    tourneyInfoJson['SeasonName'] = await getSeasonName(tourneyInfoJson['SeasonPId']);
                    tourneyInfoJson['SeasonShortName'] = await getSeasonShortName(tourneyInfoJson['SeasonPId']);
                    cache.set(cacheKey, JSON.stringify(tourneyInfoJson, null, 2));
                }
                resolve(tourneyInfoJson);
            }
        });
    });
}
app.get('/api/tournament/information/name/:tournamentShortName', async (req, res) => {
    console.log("GET Request Tournament '" + req.params.tournamentShortName + "' Information.");
    let tPId = await getTournamentPId(req.params.tournamentShortName);
    res.json(await getTourneyInfo(tPId));
});

function getTourneyStats(tPId) {
    let cacheKey = TN_STATS_PREFIX + tPId;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, async (err, data) => {
            if (err) reject(err);
            if (data != null) resolve(JSON.parse(data));
            else {
                let tourneyStatsJson = (await dynamoDb.getItem('Tournament', 'TournamentPId', tPId, ['TourneyStats']))['TourneyStats'];
                if (tourneyStatsJson != null) {
                    cache.set(cacheKey, JSON.stringify(tourneyStatsJson, null, 2));
                }
                resolve(tourneyStatsJson);
            }
        });
    });
}
app.get('/api/tournament/stats/name/:tournamentShortName', async (req, res) => {
    console.log("GET Request Tournament '" + req.params.tournamentShortName + "' Tourney Stats.");
    let tPId = await getTournamentPId(req.params.tournamentShortName);
    res.json(await getTourneyStats(tPId));
});

function getTourneyLeaderboards(tPId) {
    let cacheKey = TN_LEADER_PREFIX + tPId;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, async (err, data) => {
            if (err) reject(err);
            if (data != null) resolve(JSON.parse(data));
            else {
                let leaderboardJson = (await dynamoDb.getItem('Tournament', 'TournamentPId', tPId, ['Leaderboards']))['Leaderboards'];
                if (leaderboardJson != null) {
                    let gameRecords = leaderboardJson['GameRecords'];
                    for (let i = 0; i < Object.values(gameRecords).length; ++i) {
                        let gameObject = Object.values(gameRecords)[i];
                        gameObject['BlueTeamName'] = await getTeamName(gameObject['BlueTeamHId']);
                        gameObject['RedTeamName'] = await getTeamName(gameObject['RedTeamHId']);
                    }
                    let playerRecords = leaderboardJson['PlayerSingleRecords'];
                    for (let i = 0; i < Object.values(playerRecords).length; ++i) {
                        let playerList = Object.values(playerRecords)[i];
                        for (let j = 0; j < playerList.length; ++j) {
                            let playerObject = playerList[j];
                            playerObject['ProfileName'] = await getProfileName(playerObject['ProfileHId']);
                            playerObject['BlueTeamName'] = await getTeamName(playerObject['BlueTeamHId']);
                            playerObject['RedTeamName'] = await getTeamName(playerObject['RedTeamHId']);
                        }
                    }
                    let teamRecords = leaderboardJson['TeamSingleRecords'];
                    for (let i = 0; i < Object.values(teamRecords).length; ++i) {
                        let teamList = Object.values(teamRecords)[i];
                        for (let j = 0; j < teamList.length; ++j) {
                            let teamObject = teamList[j];
                            teamObject['TeamName'] = await getTeamName(teamObject['TeamHId']);
                            teamObject['BlueTeamName'] = await getTeamName(teamObject['BlueTeamHId']);
                            teamObject['RedTeamName'] = await getTeamName(teamObject['RedTeamHId']);
                        }
                    }
                    cache.set(cacheKey, JSON.stringify(leaderboardJson, null, 2));
                }
                resolve(leaderboardJson);
            }
        });
    });
    
}
app.get('/api/tournament/leaderboards/name/:tournamentShortName', async (req, res) => {
    console.log("GET Request Tournament '" + req.params.tournamentShortName + "' Leaderboards.");
    let tPId = await getTournamentPId(req.params.tournamentShortName);
    res.json(await getTourneyLeaderboards(tPId));
});

function getTourneyPlayerStats(tPId) {
    let cacheKey = TN_PLAYER_PREFIX + tPId;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, async (err, data) => {
            if (err) reject(err);
            if (data != null) resolve(JSON.parse(data));
            else {
                let profileHIdList = (await dynamoDb.getItem('Tournament', 'TournamentPId', tPId, ['ProfileHIdList']))['ProfileHIdList'];
                let profileData = [];
                if (profileHIdList != null) {
                    for (let i = 0; i < profileHIdList.length; ++i) {
                        let pPId = getPIdString(profileHIdList[i], profileHashIds);
                        let profileStatsLog = await getProfileStatsByTourney(pPId, tPId);
                        for (let j = 0; j < Object.keys(profileStatsLog['RoleStats']).length; ++j) {
                            let role = Object.keys(profileStatsLog['RoleStats'])[j];
                            let statsObj = profileStatsLog['RoleStats'][role];
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
                                'WardsClearedPerMinute': statsObj.WardsClearedPerMinute,
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
                    cache.set(cacheKey, JSON.stringify(profileData, null, 2));
                }
                resolve(profileData);
            }
        });
    });
}
app.get('/api/tournament/players/name/:tournamentShortName', async (req, res) => {
    console.log("GET Request Tournament '" + req.params.tournamentShortName + "' Players.");
    let tPId = await getTournamentPId(req.params.tournamentShortName);
    res.json(await getTourneyPlayerStats(tPId));
});

function getTourneyTeamStats(tPId) {
    let cacheKey = TN_TEAM_PREFIX + tPId;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, async (err, data) => {
            if (err) reject(err);
            if (data != null) resolve(JSON.parse(data));
            else {
                let teamHIdList = (await dynamoDb.getItem('Tournament', 'TournamentPId', tPId, ['TeamHIdList']))['TeamHIdList'];
                let teamData = [];
                if (teamHIdList != null) {
                    for (let i = 0; i < teamHIdList.length; ++i) {
                        let teamId = getPIdString(teamHIdList[i], teamHashIds);
                        let teamStatsLog = await getTeamStatsByTourney(teamId, tPId);
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
                            'DamagePerMinute': teamStatsLog.DamagePerMinute,
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
                    cache.set(cacheKey, JSON.stringify(teamData, null, 2));
                }
                resolve(teamData);
            }
        });
    });
}
app.get('/api/tournament/teams/name/:tournamentShortName', async (req, res) => {
    console.log("GET Request Tournament '" + req.params.tournamentShortName + "' Teams.");
    let tPId = await getTournamentPId(req.params.tournamentShortName);
    res.json(await getTourneyTeamStats(tPId));
});

function getTourneyPickBans(tPId) {
    let cacheKey = TN_PICKBANS_PREFIX + tPId;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, async (err, data) => {
            if (err) reject(err);
            if (data != null) resolve(JSON.parse(data));
            else {
                let tourneyJson = (await dynamoDb.getItem('Tournament', 'TournamentPId', tPId, ['PickBans', 'TourneyStats']));
                let pickBansJson = {}
                if (Object.keys(tourneyJson).length > 0) {
                    pbList = [];
                    let numberGames = tourneyJson['TourneyStats']['NumberGames'];
                    pickBansJson['NumberGames'] = numberGames;
                    for (let i = 0; i < Object.keys(tourneyJson['PickBans']).length; ++i) {
                        let champId = Object.keys(tourneyJson['PickBans'])[i];
                        let champObject = tourneyJson['PickBans'][champId];
                        champObject['Id'] = champId;
                        champObject['TimesPicked'] = champObject['BluePicks'] + champObject['RedPicks'];
                        champObject['TimesBanned'] = champObject['Phase1Bans'] + champObject['Phase2Bans'];
                        champObject['Presence'] = ((champObject['TimesPicked'] + champObject['TimesBanned']) / numberGames).toFixed(4);
                        champObject['NumLosses'] = champObject['TimesPicked'] - champObject['NumWins'];
                        pbList.push(champObject);
                    }
                    pickBansJson['PickBanList'] = pbList;
                    cache.set(cacheKey, JSON.stringify(pickBansJson, null, 2));
                }
                resolve(pickBansJson);
            }
        });
    });
}
app.get('/api/tournament/pickbans/name/:tournamentShortName', async (req, res) => {
    console.log("GET Request Tournament '" + req.params.tournamentShortName + "' Pick Bans.");
    let tPId = await getTournamentPId(req.params.tournamentShortName);
    res.json(await getTourneyPickBans(tPId));
});

function getTourneyGames(tPId) {
    let cacheKey = TN_GAMES_PREFIX + tPId;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, async (err, data) => {
            if (err) reject(err);
            if (data != null) resolve(JSON.parse(data));
            else {
                let gameLogJson = (await dynamoDb.getItem('Tournament', 'TournamentPId', tPId, ['GameLog']))['GameLog'];
                if (gameLogJson != null) {
                    for (let i = 0; i < Object.values(gameLogJson).length; ++i) {
                        let gameJson = Object.values(gameLogJson)[i];
                        gameJson['BlueTeamName'] = await getTeamName(gameJson['BlueTeamHId']);
                        gameJson['RedTeamName'] = await getTeamName(gameJson['RedTeamHId']);
                    }
                    cache.set(cacheKey, JSON.stringify(gameLogJson, null, 2));
                }
                resolve(gameLogJson);
            }
        });
    });
}
app.get('/api/tournament/games/name/:tournamentShortName', async (req, res) => {
    console.log("GET Request Tournament '" + req.params.tournamentShortName + "' Game Log.");
    let tPId = await getTournamentPId(req.params.tournamentShortName);
    res.json(await getTourneyGames(tPId));
});

//#endregion

/*  
    ----------------------
    Match API Requests
    ----------------------
*/
//#region Match

app.get('/api/match/:matchId', (req, res) => {
    console.log("GET Request Match '" + req.params.matchId + "'.");
    let cacheKey = MATCH_PREFIX + req.params.matchId;
    cache.get(cacheKey, async (err, data) => {
        if (err) res.status(500).json(err);
        if (data != null) res.json(JSON.parse(data));
        else {
            let matchJson = await dynamoDb.getItem('Matches', 'MatchPId', req.params.matchId);
            // Replace the HIds with the actual Names (will have to learn how to cache on the server side later)
            let seasonPId = matchJson['SeasonPId'];
            matchJson['SeasonShortName'] = await getSeasonShortName(seasonPId);
            matchJson['SeasonName'] = await getSeasonName(seasonPId);
            let tourneyPId = matchJson['TournamentPId'];
            matchJson['TournamentShortName'] = await getTournamentShortName(tourneyPId);
            matchJson['TournamentName'] = await getTournamentName(tourneyPId);
            let gameDurationMinute = matchJson['GameDuration'] / 60;
            for (let i = 0; i < Object.keys(matchJson['Teams']).length; ++i) {
                let teamId = Object.keys(matchJson['Teams'])[i];
                let teamJson = matchJson['Teams'][teamId];
                teamJson['TeamName'] = await getTeamName(teamJson['TeamHId']);
                for (let j = 0; j < Object.keys(teamJson['Players']).length; ++j) {
                    let partId = Object.keys(teamJson['Players'])[j];
                    let playerJson = teamJson['Players'][partId];
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
            cache.set(cacheKey, JSON.stringify(matchJson, null, 2));
            res.json(matchJson);
        }
    });
});

//#endregion

const port = 5000;

app.listen(port, () => console.log(`Stats server started on port ${port}`));