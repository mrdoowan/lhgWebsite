module.exports = {
    getId: getSeasonId,
    getShortName: getSeasonShortName,
    getName: getSeasonName,
    getTime: getSeasonTime,
    getLeagues: getLeagues,
    getInfo: getSeasonInformation,
    getRoster: getSeasonRoster,
    getRegular: getRegularSeason,
    getPlayoffs: getSeasonPlayoffs,
}

/*  Declaring npm modules */
require('dotenv').config({ path: '../.env' });
const redis = require('redis');
const cache = redis.createClient(process.env.REDIS_PORT);

/*  Import helper function modules */
const dynamoDb = require('./dynamoDbHelper');
const keyBank = require('./cacheKeys');
const helper = require('./helper');
// Data Functions
const Tournament = require('./tournamentData');
const Profile = require('./profileData');
const Team = require('./teamData');

// Get SeasonPId from DynamoDb
function getSeasonId(shortName) {
    let simpleName = helper.filterName(shortName);
    let cacheKey = keyBank.SEASON_ID_PREFIX + simpleName;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, (err, data) => {
            if (err) { console.error(err); reject(500) }
            else if (data != null) { resolve(parseInt(data)); } // NOTE: Needs to be number
            else {
                dynamoDb.scanTable('Season', ['SeasonPId'], 'SeasonShortName', simpleName)
                .then((obj) => {
                    if (obj.length === 0) { console.error("Season Shortname '" + shortName + "' Not Found"); reject(404); } // Not Found
                    else {
                        let Id = obj[0]['SeasonPId'];
                        cache.set(cacheKey, Id);
                        resolve(Id);
                    }
                }).catch((err) => { console.error(err); reject(500) });
            }
        });
    });
}

// Get SeasonShortName from DynamoDb
function getSeasonShortName(sPId) {
    let cacheKey = keyBank.SEASON_CODE_PREFIX + sPId;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, (err, data) => {
            if (err) { console(err); reject(500); }
            else if (data != null) { resolve(data); }
            else {
                dynamoDb.getItem('Season', 'SeasonPId', sPId, ['SeasonShortName'])
                .then((obj) => {
                    if (obj == null) { reject(404); }
                    else {
                        let shortName = obj['SeasonShortName'];
                        cache.set(cacheKey, shortName);
                        resolve(shortName);
                    }
                }).catch((err) => { console.error(err); reject(500) });
            }
        });
    });
}

// Get SeasonName from DynamoDb
function getSeasonName(sPId) {
    let cacheKey = keyBank.SEASON_NAME_PREFIX + sPId;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, (err, data) => {
            if (err) { console(err); reject(500); }
            else if (data != null) { resolve(data); }
            else {
                dynamoDb.getItem('Season', 'SeasonPId', sPId, ['Information'])
                .then((obj) => {
                    if (obj == null) { reject(404); }
                    else {
                        let name = obj['Information']['SeasonName'];
                        cache.set(cacheKey, name);
                        resolve(name);
                    }
                }).catch((err) => { console.error(err); reject(500) });
            }
        });
    });
}

// Returns a Season Time (i.e. W2020PL)
function getSeasonTime(sPId) {
    let cacheKey = keyBank.SEASON_TIME_PREFIX + sPId;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, (err, data) => {
            if (err) { console(err); reject(500); }
            else if (data != null) { resolve(data); }
            else {
                dynamoDb.getItem('Season', 'SeasonPId', sPId, ['Information'])
                .then((obj) => {
                    if (obj == null) { reject(404); }
                    else {
                        let time = obj['Information']['SeasonTime'];
                        cache.set(cacheKey, time);
                        resolve(time);
                    }
                }).catch((err) => { console.error(err); reject(500) });
            }
        });
    });
}

// For leagues page
function getLeagues() {
    return new Promise(function(resolve, reject) {
        cache.get(keyBank.LEAGUE_KEY, async (err, data) => {
            if (err) { console.error(err); reject(500); }
            else if (data != null) { resolve(JSON.parse(data)); }
            else {
                try {
                    let seasonList = await dynamoDb.scanTable('Season', ['Information']);
                    if (seasonList != null) {
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
                        let returnObject = {};
                        returnObject['Leagues'] = Object.values(leagueObject).sort((a, b) => (a.Date < b.Date) ? 1 : -1);
                        cache.set(keyBank.LEAGUE_KEY, JSON.stringify(returnObject, null, 2));
                        resolve(returnObject);
                    }
                    else {
                        resolve({});   // Return empty if does not exist
                    }     
                }
                catch (err) { console.error(err); reject(500); }
            }
        });
    })
}

function getSeasonInformation(sPId) {
    let cacheKey = keyBank.SEASON_INFO_PREFIX + sPId;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, async (err, data) => {
            if (err) { console(err); reject(500); }
            else if (data != null) { resolve(JSON.parse(data)); }
            else {
                try {
                    let seasonInfoJson = (await dynamoDb.getItem('Season', 'SeasonPId', sPId, ['Information']))['Information'];
                    if (seasonInfoJson != null) {
                        seasonInfoJson['TournamentPIds']['RegTournamentShortName'] = await Tournament.getShortName(seasonInfoJson['TournamentPIds']['RegTournamentPId']);
                        seasonInfoJson['TournamentPIds']['PostTournamentShortName'] = await Tournament.getShortName(seasonInfoJson['TournamentPIds']['PostTournamentPId']);
                        if ('FinalStandings' in seasonInfoJson) {
                            for (let i = 0; i < seasonInfoJson['FinalStandings'].length; ++i) {
                                let teamObject = seasonInfoJson['FinalStandings'][i];
                                teamObject['TeamName'] = await Team.getName(teamObject['TeamHId']);
                            }
                        }
                        if ('FinalsMvpHId' in seasonInfoJson) {
                            seasonInfoJson['FinalsMvpName'] = await Profile.getName(seasonInfoJson['FinalsMvpHId']);
                        }
                        if ('AllStars' in seasonInfoJson) {
                            seasonInfoJson['AllStars']['TopName'] = await Profile.getName(seasonInfoJson['AllStars']['TopHId']);
                            seasonInfoJson['AllStars']['JungleName'] = await Profile.getName(seasonInfoJson['AllStars']['JungleHId']);
                            seasonInfoJson['AllStars']['MidName'] = await Profile.getName(seasonInfoJson['AllStars']['MidHId']);
                            seasonInfoJson['AllStars']['BotName'] = await Profile.getName(seasonInfoJson['AllStars']['BotHId']);
                            seasonInfoJson['AllStars']['SupportName'] = await Profile.getName(seasonInfoJson['AllStars']['SupportHId']);
                        }
                        cache.set(cacheKey, JSON.stringify(seasonInfoJson, null, 2));
                        resolve(seasonInfoJson);
                    }
                    else {
                        resolve({});    // If 'Information' does not exist
                    }
                }
                catch (err) { console.error(err); reject(500); }
            }
        });
    });
}

function getSeasonRoster(sPId) {
    let cacheKey = keyBank.SEASON_ROSTER_PREFIX + sPId;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, async (err, data) => {
            if (err) { console(err); reject(500); }
            else if (data != null) { resolve(JSON.parse(data)); }
            else {
                try {
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
                                    playerJson['ProfileName'] = await Profile.getName(profileHId);
                                }
                            }
                        }
                        if ('FreeAgents' in seasonRosterJson) {
                            for (let i = 0; i < Object.keys(seasonRosterJson['FreeAgents']).length; ++i) {
                                let profileHId = Object.keys(seasonRosterJson['FreeAgents'])[i];
                                let playerJson = seasonRosterJson['FreeAgents'][profileHId];
                                playerJson['ProfileName'] = await Profile.getName(profileHId);
                            }
                        }
                        if ('ESubs' in seasonRosterJson) {
                            for (let i = 0; i < Object.keys(seasonRosterJson['ESubs']).length; ++i) {
                                let profileHId = Object.keys(seasonRosterJson['ESubs'])[i];
                                playerJson['ProfileName'] = await Profile.getName(profileHId);
                            }
                        }
                        cache.set(cacheKey, JSON.stringify(seasonRosterJson, null, 2));
                        resolve(seasonRosterJson);
                    }
                    else {
                        resolve({});    // If 'Roster' does not exist
                    }
                }
                catch (err) { console.error(err); reject(500); }
            }
        });
    });
}

function getRegularSeason(sPId) {
    let cacheKey = keyBank.SEASON_REGULAR_PREFIX + sPId;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, async (err, data) => {
            if (err) { console(err); reject(500); }
            else if (data != null) { resolve(JSON.parse(data)); }
            else {
                try {
                    let seasonRegularJson = (await dynamoDb.getItem('Season', 'SeasonPId', sPId, ['Regular']))['Regular'];
                    if (seasonRegularJson != null) {
                        for (let i = 0; i < seasonRegularJson['RegularSeasonDivisions'].length; ++i) {
                            let divisionJson = seasonRegularJson['RegularSeasonDivisions'][i];
                            for (let j = 0; j < divisionJson['RegularSeasonTeams'].length; ++j) {
                                let teamJson = divisionJson['RegularSeasonTeams'][j];
                                teamJson['TeamName'] = await Team.getName(teamJson['TeamHId']);
                            }
                        }
                        for (let i = 0; i < seasonRegularJson['RegularSeasonGames'].length; ++i) {
                            let gameJson = seasonRegularJson['RegularSeasonGames'][i];
                            gameJson['BlueTeamName'] = await Team.getName(gameJson['BlueTeamHId']);
                            gameJson['RedTeamName'] = await Team.getName(gameJson['RedTeamHid']);
                            gameJson['ModeratorName'] = await Profile.getName(gameJson['ModeratorHId']);
                            gameJson['MvpName'] = await Profile.getName(gameJson['MvpHId']);
                        }
                        cache.set(cacheKey, JSON.stringify(seasonRegularJson, null, 2));
                        resolve(seasonRegularJson);
                    }
                    else {
                        resolve({});    // If 'Season' does not exist
                    }
                }
                catch (err) { console.error(err); reject(500); }
            }
        });
    });
}

function getSeasonPlayoffs(sPId) {
    let cacheKey = keyBank.SEASON_PLAYOFF_PREFIX + sPId;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, async (err, data) => {
            if (err) { console(err); reject(500); }
            else if (data != null) { resolve(JSON.parse(data)); }
            else {
                try {
                    let playoffJson = (await dynamoDb.getItem('Season', 'SeasonPId', sPId, ['Playoffs']))['Playoffs'];
                    if (playoffJson != null) {
                        for (let i = 0; i < Object.values(playoffJson['PlayoffBracket']).length; ++i) {
                            let roundTypeArray = Object.values(playoffJson['PlayoffBracket'])[i];
                            for (let j = 0; j < roundTypeArray.length; ++j) {
                                let seriesJson = roundTypeArray[j];
                                seriesJson['HigherTeamName'] = await Profile.getName(seriesJson['HigherTeamHId']);
                                seriesJson['LowerTeamName'] = await Profile.getName(seriesJson['LowerTeamHId']);
                                seriesJson['SeriesMvpName'] = await Profile.getName(seriesJson['SeriesMvpHId']);
                            }
                        }
                        for (let i = 0; i < playoffJson['PlayoffGames'].length; ++i) {
                            let gameJson = playoffJson['PlayoffGames'][i];
                            gameJson['BlueTeamName'] = await Team.getName(gameJson['BlueTeamHId']);
                            gameJson['RedTeamName'] = await Team.getName(gameJson['RedTeamHId']);
                            gameJson['ModeratorName'] = await Profile.getName(gameJson['ModeratorHId']);
                            gameJson['MvpName'] = await Profile.getName(gameJson['MvpHId']);
                        }
                        cache.set(cacheKey, JSON.stringify(playoffJson, null, 2));
                        resolve(playoffJson);
                    }
                    else {
                        resolve({});    // If 'Playoffs' does not exist
                    }
                }
                catch (err) { console.error(err); reject(500); }
            }
        });
    });
}