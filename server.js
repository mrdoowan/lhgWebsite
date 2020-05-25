// This will be used for the back-end and interface with both APIs
// This calls on LHG's DynamnDB for fast reads

/*  Declaring npm modules */
const express = require('express');
const app = express();
const Hashids = require('hashids/cjs'); // For hashing and unhashing
const redis = require('redis');
require('dotenv').config();

/*  Import helper function modules */
const dynamoDb = require('./functions/dynamoDbHelper');
const keyBank = require('./functions/cacheKeys');

const Season = require('./functions/seasonData');
const Tournament = require('./functions/tournamentData');
const Profile = require('./functions/profileData');
const Team = require('./functions/teamData');
const Match = require('./functions/matchData');

/* 
    Import from other files that are not committed to Github
    Contact doowan about getting a copy of these files
*/
const envVars = require('./external/env');

/*  Configurations of npm modules */
const profileHashIds = new Hashids(envVars.PROFILE_HID_SALT, envVars.HID_LENGTH); // process.env.PROFILE_HID_SALT
const teamHashIds = new Hashids(envVars.TEAM_HID_SALT, envVars.HID_LENGTH); // process.env.TEAM_HID_SALT
const cache = redis.createClient(envVars.REDIS_PORT);

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

function getSeasonInformation(sPId) {
    let cacheKey = keyBank.SEASON_INFO_PREFIX + sPId;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, async (err, data) => {
            if (err) { console(err); reject(500); }
            else if (data != null) { resolve(JSON.parse(data)); }
            else {
                let seasonInfoJson = (await dynamoDb.getItem('Season', 'SeasonPId', sPId, ['Information']))['Information'];
                if (seasonInfoJson != null) {
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
                else {
                    resolve({});    // If 'Information' does not exist
                }
            }
        });
    });
}
app.get('/api/season/information/name/:seasonShortName', (req, res) => {
    console.log("GET Request Season '" + req.params.seasonShortName + "' Information.");
    getSeasonId(req.params.seasonShortName).then((sPId) => {
        getSeasonInformation(sPId).then((data) => {
            res.json(data);
        }).catch(errCode => res.status(errCode).send("GET Season Information Error."))
    }).catch(errCode => res.status(errCode).send("GET Season ID Error."));
});

function getSeasonRoster(sPId) {
    let cacheKey = keyBank.SEASON_ROSTER_PREFIX + sPId;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, async (err, data) => {
            if (err) { console(err); reject(500); }
            else if (data != null) { resolve(JSON.parse(data)); }
            else {
                let seasonRosterJson = (await dynamoDb.getItem('Season', 'SeasonPId', sPId, ['Roster']))['Roster'];
                if (seasonRosterJson != null) {
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
                else {
                    resolve({});    // If 'Roster' does not exist
                }
            }
        });
    });
}
app.get('/api/season/roster/name/:seasonShortName', (req, res) => {
    conole.log("GET Request Season '" + req.params.seasonShortName + "' Roster.");
    getSeasonId(req.params.seasonShortName).then((sPId) => {
        getSeasonRoster(sPId).then((data) => {
            res.json(data);
        }).catch(errCode => res.status(errCode).send("GET Season Information Error."));
    }).catch(errCode => res.status(errCode).send("GET Season ID Error."));
});

function getSeasonRegular(sPId) {
    let cacheKey = keyBank.SEASON_REGULAR_PREFIX + sPId;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, async (err, data) => {
            if (err) { console(err); reject(500); }
            else if (data != null) { resolve(JSON.parse(data)); }
            else {
                let seasonRegularJson = (await dynamoDb.getItem('Season', 'SeasonPId', sPId, ['Regular']))['Regular'];
                if (seasonRegularJson != null) {
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
                else {
                    resolve({});    // If 'Season' does not exist
                }
            }
        });
    });
}
app.get('/api/season/regular/name/:seasonShortName', (req, res) => {
    console.log("GET Request Season '" + req.params.seasonShortName + "' Regular.");
    getSeasonId(req.params.seasonShortName).then((sPId) => {
        getSeasonRegular(sPId).then((data) => {
            res.json(data);
        }).catch(errCode => res.status(errCode).send("GET Season Information Error."));
    }).catch(errCode => res.status(errCode).send("GET Season ID Error."));
});

function getSeasonPlayoffs(sPId) {
    let cacheKey = keyBank.SEASON_PLAYOFF_PREFIX + sPId;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, async (err, data) => {
            if (err) { console(err); reject(500); }
            else if (data != null) { resolve(JSON.parse(data)); }
            else {
                let playoffJson = (await dynamoDb.getItem('Season', 'SeasonPId', sPId, ['Playoffs']))['Playoffs'];
                if (playoffJson != null) {
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
                else {
                    resolve({});    // If 'Playoffs' does not exist
                }
            }
        });
    });
}
app.get('/api/season/playoffs/name/:seasonShortName', (req, res) => {
    console.log("GET Request Season '" + req.params.seasonShortName + "' Playoffs.");
    getSeasonId(req.params.seasonShortName).then((sPId) => {
        getSeasonPlayoffs(sPId).then((data) => {
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

function getProfileInfo(pPId) {
    let cacheKey = keyBank.PROFILE_INFO_PREFIX + pPId;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, async (err, data) => {
            if (err) { console(err); reject(500); }
            else if (data != null) { resolve(JSON.parse(data)); }
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
app.get('/api/profile/information/name/:profileName', (req, res) => {
    console.log("GET Request Profile '" + req.params.profileName + "' Information.");
    getProfilePId(req.params.profileName).then((pPId) => {
        getProfileInfo(pPId).then((data) => {
            res.json(data);
        }).catch(errCode => res.status(errCode).send("GET Profile Information Error."));
    }).catch(errCode => res.status(errCode).send("GET Profile ID Error."));
});

function getProfileGamesBySeason(pPId, sPId) {
    let cacheKey = keyBank.PROFILE_GAMES_PREFIX + pPId + '-' + sPId;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, async (err, data) => {
            if (err) { console(err); reject(500); }
            else if (data != null) { resolve(JSON.parse(data)); }
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
app.get('/api/profile/games/name/:profileName/:seasonShortName', (req, res) => {
    console.log("GET Request Profile '" + req.params.profileName + "' Game Log for Season '" + req.params.seasonShortName +  "'.");
    getProfilePId(req.params.profileName).then((pPId) => {
        getSeasonId(req.params.seasonShortName).then((sPId) => {
            getProfileGamesBySeason(pPId, sPId).then((data) => {
                res.json(data);
            }).catch(errCode => res.status(errCode).send("GET Profile Games Error."));
        }).catch(errCode => res.status(errCode).send("GET Season ID Error."));
    }).catch(errCode => res.status(errCode).send("GET Profile ID Error."));
});

function getProfileStatsByTourney(pPId, tPId) {
    let cacheKey = keyBank.PROFILE_STATS_PREFIX + pPId + '-' + tPId;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, async (err, data) => {
            if (err) { console(err); reject(500); }
            else if (data != null) { resolve(JSON.parse(data)); }
            else {
                let profileStatsJson = (await dynamoDb.getItem('Profile', 'ProfilePId', pPId, ['StatsLog']))['StatsLog'][tPId];
                if (profileStatsJson != null) {
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
                else {
                    resolve({});    // If 'StatsLog' does not exist
                }
            }
        });
    });
}
app.get('/api/profile/stats/name/:profileName/:tournamentShortName', async (req, res) => {
    console.log("GET Request Profile '" + req.params.profileName + "' Stats Log for Tournament '" + req.params.tournamentShortName +  "'.");
    getProfilePId(req.params.profileName).then((pPId) => {
        getTournamentId(req.params.tournamentShortName).then((tPId) => {
            getProfileStatsByTourney(pPId, tPId).then((data) => {
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

function getTeamInfo(teamPId) {
    let cacheKey = keyBank.TEAM_INFO_PREFIX + teamPId;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, async (err, data) => {
            if (err) { console(err); reject(500); }
            else if (data != null) { resolve(JSON.parse(data)); }
            else {
                let teamInfoJson = (await dynamoDb.getItem('Team', 'TeamPId', teamPId, ['Information']))['Information'];
                if (teamInfoJson != null) {
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
                else {
                    resolve({});    // If 'Information' does not exist
                }
            }
        });
    });
}
app.get('/api/team/information/name/:teamName', async (req, res) => {
    console.log("GET Request Team '" + req.params.teamName + "' Information.");
    getTeamPId(req.params.teamName).then((teamId) => {
        getTeamInfo(teamId).then((data) => {
            res.json(data);
        }).catch(errCode => res.status(errCode).send("GET Team Information Error."));
    }).catch(errCode => res.status(errCode).send("GET Team ID Error."));
});

function getTeamScoutingBySeason(teamPId, sPId) {
    let cacheKey = keyBank.TEAM_SCOUT_PREFIX + teamPId + '-' + sPId;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, async (err, data) => {
            if (err) { console(err); reject(500); }
            else if (data != null) { resolve(JSON.parse(data)); }
            else {
                let teamScoutingJson = (await dynamoDb.getItem('Team', 'TeamPId', teamPId, ['Scouting']))['Scouting'][sPId];
                if (teamScoutingJson != null) {
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
                else {
                    resolve({});    // If 'Scouting' does not exist
                }
            }
        });
    });
}
app.get('/api/team/scouting/name/:teamName/:seasonShortName', async (req, res) => {
    console.log("GET Request Team '" + req.params.teamName + "' Scouting for Season '" + req.params.seasonShortName +  "'.");
    getTeamPId(req.params.teamName).then((teamId) => {
        getSeasonId(req.params.seasonShortName).then((sPId) => {
            getTeamScoutingBySeason(teamId, sPId).then((data) => {
                res.json(data);
            }).catch(errCode => res.status(errCode).send("GET Team Scouting Error."));
        }).catch(errCode => res.status(errCode).send("GET Season ID Error."));
    }).catch(errCode => res.status(errCode).send("GET Team ID Error."));
});

function getTeamGamesBySeason(teamPId, sPId) {
    let cacheKey = keyBank.TEAM_GAMES_PREFIX + teamPId + '-' + sPId;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, async (err, data) => {
            if (err) { console(err); reject(500); }
            else if (data != null) { resolve(JSON.parse(data)); }
            else {
                let gameLogJson = (await dynamoDb.getItem('Team', 'TeamPId', teamPId, ['GameLog']))['GameLog'][sPId];
                if (gameLogJson != null) {
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
                else {
                    resolve({});    // If 'GameLog' does not exist
                }
            }
        });
    });
}
app.get('/api/team/games/name/:teamName/:seasonShortName', async (req, res) => {
    console.log("GET Request Team '" + req.params.teamName + "' Game Log for Season '" + req.params.seasonShortName +  "'.");
    getTeamPId(req.params.teamName).then((teamId) => {
        getSeasonId(req.params.seasonShortName).then((sPId) => {
            getTeamGamesBySeason(teamId, sPId).then((data) => {
                res.json(data);
            }).catch(errCode => res.status(errCode).send("GET Team Games Error."));
        }).catch(errCode => res.status(errCode).send("GET Season ID Error."));
    }).catch(errCode => res.status(errCode).send("GET Team ID Error."));
});

function getTeamStatsByTourney(teamPId, tPId) {
    let cacheKey = keyBank.TEAM_STATS_PREFIX + teamPId + '-' + tPId;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, async (err, data) => {
            if (err) { console(err); reject(500); }
            else if (data != null) resolve(JSON.parse(data));
            else {
                let statsJson = (await dynamoDb.getItem('Team', 'TeamPId', teamPId, ['StatsLog']))['StatsLog'][tPId];
                if (statsJson != null) {
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
                else {
                    resolve({});    // If 'StatsLog' does not exist
                }
            }
        });
    });
    
}
app.get('/api/team/stats/name/:teamName/:tournamentName', async (req, res) => {
    console.log("GET Request Team '" + req.params.teamName + "' Stats Log for Tournament '" + req.params.tournamentName +  "'.");
    getTeamPId(req.params.teamName).then((teamId) => {
        getTournamentId(req.params.tournamentName).then((tPId) => {
            getTeamStatsByTourney(teamId, tPId).then((data) => {
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

function getTourneyInfo(tPId) {
    let cacheKey = keyBank.TN_INFO_PREFIX + tPId;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, async (err, data) => {
            if (err) { console(err); reject(500); }
            else if (data != null) { resolve(JSON.parse(data)); }
            else {
                let tourneyInfoJson = (await dynamoDb.getItem('Tournament', 'TournamentPId', tPId, ['Information']))['Information'];
                if (tourneyInfoJson != null) {
                    tourneyInfoJson['SeasonName'] = await getSeasonName(tourneyInfoJson['SeasonPId']);
                    tourneyInfoJson['SeasonShortName'] = await getSeasonShortName(tourneyInfoJson['SeasonPId']);
                    cache.set(cacheKey, JSON.stringify(tourneyInfoJson, null, 2));
                    resolve(tourneyInfoJson);
                }
                else {
                    resolve({});    // If 'Information' does not exist
                }
            }
        });
    });
}
app.get('/api/tournament/information/name/:tournamentShortName', async (req, res) => {
    console.log("GET Request Tournament '" + req.params.tournamentShortName + "' Information.");
    getTournamentId(req.params.tournamentShortName).then((tPId) => {
        getTourneyInfo(tPId).then((data) => {
            res.json(data);
        }).catch(errCode => res.status(errCode).send("GET Tourney Information Error."));
    }).catch(errCode => res.status(errCode).send("GET Tourney ID Error."));
});

function getTourneyStats(tPId) {
    let cacheKey = keyBank.TN_STATS_PREFIX + tPId;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, async (err, data) => {
            if (err) { console(err); reject(500); }
            else if (data != null) { resolve(JSON.parse(data)); }
            else {
                let tourneyStatsJson = (await dynamoDb.getItem('Tournament', 'TournamentPId', tPId, ['TourneyStats']))['TourneyStats'];
                if (tourneyStatsJson != null) {
                    cache.set(cacheKey, JSON.stringify(tourneyStatsJson, null, 2));
                    resolve(tourneyStatsJson);
                }
                else {
                    resolve({});    // If 'TourneyStats' does not exist
                }
            }
        });
    });
}
app.get('/api/tournament/stats/name/:tournamentShortName', async (req, res) => {
    console.log("GET Request Tournament '" + req.params.tournamentShortName + "' Tourney Stats.");
    getTournamentId(req.params.tournamentShortName).then((tPId) => {
        getTourneyStats(tPId).then((data) => {
            res.json(data);
        }).catch(errCode => res.status(errCode).send("GET Tourney Information Error."));
    }).catch(errCode => res.status(errCode).send("GET Tourney ID Error."));
});

function getTourneyLeaderboards(tPId) {
    let cacheKey = keyBank.TN_LEADER_PREFIX + tPId;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, async (err, data) => {
            if (err) { console(err); reject(500); }
            else if (data != null) { resolve(JSON.parse(data)); }
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
                    resolve(leaderboardJson);
                }
                else {
                    resolve({});    // If 'Leaderboards' does not exist
                }
            }
        });
    });
    
}
app.get('/api/tournament/leaderboards/name/:tournamentShortName', async (req, res) => {
    console.log("GET Request Tournament '" + req.params.tournamentShortName + "' Leaderboards.");
    getTournamentId(req.params.tournamentShortName).then((tPId) => {
        getTourneyLeaderboards(tPId).then((data) => {
            res.json(data);
        }).catch(errCode => res.status(errCode).send("GET Tourney Leaderboard Error."));
    }).catch(errCode => res.status(errCode).send("GET Tourney ID Error."));
});

function getTourneyPlayerStats(tPId) {
    let cacheKey = keyBank.TN_PLAYER_PREFIX + tPId;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, async (err, data) => {
            if (err) { console(err); reject(500); }
            else if (data != null) { resolve(JSON.parse(data)); }
            else {
                let profileHIdList = (await dynamoDb.getItem('Tournament', 'TournamentPId', tPId, ['ProfileHIdList']))['ProfileHIdList'];
                if (profileHIdList != null) {
                    let profileStatsList = [];
                    for (let i = 0; i < profileHIdList.length; ++i) {
                        let pPId = helper.getPId(profileHIdList[i], profileHashIds);
                        let profileStatsLog = await getProfileStatsByTourney(pPId, tPId);
                        for (let j = 0; j < Object.keys(profileStatsLog['RoleStats']).length; ++j) {
                            let role = Object.keys(profileStatsLog['RoleStats'])[j];
                            let statsObj = profileStatsLog['RoleStats'][role];
                            profileStatsList.push({
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
                    let profileObject = {};
                    profileObject['PlayerList'] = profileStatsList;
                    cache.set(cacheKey, JSON.stringify(profileObject, null, 2));
                    resolve(profileObject);
                }
                else {
                    resolve({});    // If 'ProfileHIdList' does not exist
                }
            }
        });
    });
}
app.get('/api/tournament/players/name/:tournamentShortName', async (req, res) => {
    console.log("GET Request Tournament '" + req.params.tournamentShortName + "' Players.");
    getTournamentId(req.params.tournamentShortName).then((tPId) => {
        getTourneyPlayerStats(tPId).then((data) => {
            res.json(data);
        }).catch(errCode => res.status(errCode).send("GET Tourney Players Error."));
    }).catch(errCode => res.status(errCode).send("GET Tourney ID Error."));
});

function getTourneyTeamStats(tPId) {
    let cacheKey = keyBank.TN_TEAM_PREFIX + tPId;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, async (err, data) => {
            if (err) { console(err); reject(500); }
            else if (data != null) { resolve(JSON.parse(data)); }
            else {
                let teamHIdList = (await dynamoDb.getItem('Tournament', 'TournamentPId', tPId, ['TeamHIdList']))['TeamHIdList'];
                if (teamHIdList != null) {
                    let teamStatsList = [];
                    for (let i = 0; i < teamHIdList.length; ++i) {
                        let teamId = helper.getPId(teamHIdList[i], teamHashIds);
                        let teamStatsLog = await getTeamStatsByTourney(teamId, tPId);
                        teamStatsList.push({
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
                    let teamObject = {};
                    teamObject['TeamList'] = teamStatsList;
                    cache.set(cacheKey, JSON.stringify(teamObject, null, 2));
                    resolve(teamObject);
                }
                else {
                    resolve({});    // If 'TeamHIdList' does not exist
                }
            }
        });
    });
}
app.get('/api/tournament/teams/name/:tournamentShortName', async (req, res) => {
    console.log("GET Request Tournament '" + req.params.tournamentShortName + "' Teams.");
    getTournamentId(req.params.tournamentShortName).then((tPId) => {
        getTourneyTeamStats(tPId).then((data) => {
            res.json(data);
        }).catch(errCode => res.status(errCode).send("GET Tourney Teams Error."));
    }).catch(errCode => res.status(errCode).send("GET Tourney ID Error."));
});

function getTourneyPickBans(tPId) {
    let cacheKey = keyBank.TN_PICKBANS_PREFIX + tPId;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, async (err, data) => {
            if (err) { console(err); reject(500); }
            else if (data != null) { resolve(JSON.parse(data)); }
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
    getTournamentId(req.params.tournamentShortName).then((tPId) => {
        getTourneyPickBans(tPId).then((data) => {
            res.json(data);
        }).catch(errCode => res.status(errCode).send("GET Tourney Pick Bans Error."));
    }).catch(errCode => res.status(errCode).send("GET Tourney ID Error."));
});

function getTourneyGames(tPId) {
    let cacheKey = keyBank.TN_GAMES_PREFIX + tPId;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, async (err, data) => {
            if (err) { console(err); reject(500); }
            else if (data != null) { resolve(JSON.parse(data)); }
            else {
                let gameLogJson = (await dynamoDb.getItem('Tournament', 'TournamentPId', tPId, ['GameLog']))['GameLog'];
                if (gameLogJson != null) {
                    for (let i = 0; i < Object.keys(gameLogJson).length; ++i) {
                        let matchId = Object.keys(gameLogJson)[i];
                        let gameJson = gameLogJson[matchId];
                        gameJson['MatchPId'] = matchId;
                        gameJson['BlueTeamName'] = await getTeamName(gameJson['BlueTeamHId']);
                        gameJson['RedTeamName'] = await getTeamName(gameJson['RedTeamHId']);
                    }
                    cache.set(cacheKey, JSON.stringify(gameLogJson, null, 2));
                    resolve(gameLogJson);
                }
                else {
                    resolve({});    // If 'GameLog' does not exist
                }
                
            }
        });
    });
}
app.get('/api/tournament/games/name/:tournamentShortName', async (req, res) => {
    console.log("GET Request Tournament '" + req.params.tournamentShortName + "' Game Log.");
    getTournamentId(req.params.tournamentShortName).then((tPId) => {
        getTourneyGames(tPId).then((data) => {
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