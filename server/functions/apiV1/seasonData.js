/*  Declaring npm modules */
const redis = require('redis');
const cache = (process.env.NODE_ENV === 'production') ? redis.createClient(process.env.REDIS_URL) : redis.createClient(process.env.REDIS_PORT);

/*  Import dependency modules */
import {
    filterName,
    getProfileHashId,
    getTeamHashId,
    GLOBAL_CONSTS,
} from './dependencies/global';
import {
    dynamoDbGetItem,
    dynamoDbPutItem,
    dynamoDbScanTable,
} from './dependencies/dynamoDbHelper';
import { CACHE_KEYS } from './dependencies/cacheKeys'

/*  Import data functions */
import { getTournamentShortName } from './tournamentData';
import { getProfileName } from './profileData';
import { getTeamName } from './teamData';

/**
 * Get SeasonPId from DynamoDb
 * @param {string} shortName    Season shortName (i.e. 'w2020pl')
 */
export const getSeasonId = (shortName) => {
    let simpleName = filterName(shortName);
    const cacheKey = CACHE_KEYS.SEASON_ID_PREFIX + simpleName;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, (err, data) => {
            if (err) { console.error(err); reject(err); return; }
            else if (data != null) { resolve(parseInt(data)); return; } // NOTE: Needs to be number
            dynamoDbScanTable('Season', ['SeasonPId'], 'SeasonShortName', simpleName)
            .then((obj) => {
                if (obj.length === 0) { resolve(null); return; } // Not Found
                let Id = obj[0]['SeasonPId'];
                cache.set(cacheKey, Id);
                resolve(Id);
            }).catch((error) => { console.error(error); reject(error) });
        });
    });
}

/**
 * Get ShortName of a Season Id from DynamoDb. Returns a string (i.e. "f2019pl")
 * @param {number} seasonId      Season Id in number format
 */
export const getSeasonShortName = (seasonId) => {
    const cacheKey = CACHE_KEYS.SEASON_CODE_PREFIX + seasonId;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, (err, data) => {
            if (err) { console(err); reject(err); return; }
            else if (data != null) { resolve(data); return; }
            dynamoDbGetItem('Season', 'SeasonPId', seasonId)
            .then((obj) => {
                let shortName = obj['SeasonShortName'];
                if (shortName == null) { resolve(null); return; } // Not Found
                cache.set(cacheKey, shortName);
                resolve(shortName);
            }).catch((error) => { console.error(error); reject(error) });
        });
    });
}

/**
 * Get SeasonName of a Season Id from DynamoDb. Returns a string (i.e. "Fall 2019 Premier League")
 * @param {number} seasonId      Season Id in number format
 */
export const getSeasonName = (seasonId) => {
    const cacheKey = CACHE_KEYS.SEASON_NAME_PREFIX + seasonId;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, (err, data) => {
            if (err) { console(err); reject(err); return; }
            else if (data != null) { resolve(data); return; }
            dynamoDbGetItem('Season', 'SeasonPId', seasonId)
            .then((obj) => {
                if (obj == null) { resolve(null); return; } // Not Found
                let name = obj['Information']['SeasonName'];
                cache.set(cacheKey, name);
                resolve(name);
            }).catch((error) => { console.error(error); reject(error) });
        });
    });
}

/**
 * Returns a Season Time (i.e. Winter 2020)
 * @param {number} seasonId 
 */
export const getSeasonTime = (seasonId) => {
    const cacheKey = CACHE_KEYS.SEASON_TIME_PREFIX + seasonId;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, (err, data) => {
            if (err) { console(err); reject(err); return; }
            else if (data != null) { resolve(data); return; }
            dynamoDbGetItem('Season', 'SeasonPId', seasonId)
            .then((obj) => {
                if (obj == null) { resolve(null); return; } // Not Found
                let time = obj['Information']['SeasonTime'];
                cache.set(cacheKey, time);
                resolve(time);
            }).catch((error) => { console.error(error); reject(error) });
        });
    });
}

/**
 * Returns a Tab Label based on Season Time
 * @param {number} seasonId 
 */
export const getSeasonTabName = (seasonId) => {
    const cacheKey = CACHE_KEYS.SEASON_TAB_PREFIX + seasonId;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, (err, data) => {
            if (err) { console(err); reject(err); return; }
            else if (data != null) { resolve(data); return; }
            dynamoDbGetItem('Season', 'SeasonPId', seasonId)
            .then((obj) => {
                if (obj == null) { resolve(null); return; } // Not Found
                let time = obj['Information']['SeasonTabName'];
                cache.set(cacheKey, time);
                resolve(time);
            }).catch((error) => { console.error(error); reject(error) });
        });
    });
}

/**
 * For leagues page
 */
export const getLeagues = () => {
    return new Promise(function(resolve, reject) {
        cache.get(CACHE_KEYS.LEAGUE_KEY, async (err, data) => {
            if (err) { console.error(err); reject(err); return; }
            else if (data != null) { resolve(JSON.parse(data)); return; }
            try {
                let seasonList = await dynamoDbScanTable('Season', ['Information']);
                if (seasonList != null) {
                    let leagueObject = {};
                    seasonList.map((seasonInfoDb) => {
                        const { SeasonTime, DateOpened, LeagueCode, LeagueType, SeasonShortName } = seasonInfoDb['Information'];
                        if (!(SeasonTime in leagueObject)) {
                            leagueObject[SeasonTime] = { 'SeasonTime': SeasonTime }
                        }
                        leagueObject[SeasonTime]['Date'] = DateOpened;
                        leagueObject[SeasonTime][LeagueCode] = {};
                        leagueObject[SeasonTime][LeagueCode]['LeagueType'] = LeagueType;
                        leagueObject[SeasonTime][LeagueCode]['LeagueCode'] = LeagueCode;
                        leagueObject[SeasonTime][LeagueCode]['ShortName'] = SeasonShortName;
                    });
                    let returnObject = {};
                    returnObject['Leagues'] = Object.values(leagueObject).sort((a, b) => (a.Date < b.Date) ? 1 : -1);
                    cache.set(CACHE_KEYS.LEAGUE_KEY, JSON.stringify(returnObject, null, 2), 'EX', GLOBAL_CONSTS.TTL_DURATION);
                    resolve(returnObject);
                }
                else {
                    resolve(null);   // Return empty if does not exist
                }     
            }
            catch (ex) { console.error(ex); reject(ex); }
        });
    })
}

/**
 * Get 'Information' property from Season
 * @param {number} seasonId 
 */
export const getSeasonInformation = (seasonId) => {
    const cacheKey = CACHE_KEYS.SEASON_INFO_PREFIX + seasonId;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, async (err, data) => {
            if (err) { console(err); reject(err); return; }
            else if (data != null) { resolve(JSON.parse(data)); return; }
            try {
                let seasonInfoJson = (await dynamoDbGetItem('Season', 'SeasonPId', seasonId))['Information'];
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
                    cache.set(cacheKey, JSON.stringify(seasonInfoJson, null, 2), 'EX', GLOBAL_CONSTS.TTL_DURATION);
                    resolve(seasonInfoJson);
                }
                else {
                    resolve(null);    // If 'Information' does not exist
                }
            }
            catch (error) { console.error(error); reject(error); }
        });
    });
}

/**
 * Get 'Roster' property from Season and properties by HashId
 * @param {number} seasonId 
 */
export const getSeasonRosterById = (seasonId) => {
    return new Promise(function(resolve, reject) {
        // Gonna avoid caching for this one
        dynamoDbGetItem('Season', 'SeasonPId', seasonId).then(async (seasonJson) => {
            if (!seasonJson) { resolve(null); return; }
            const seasonRosterJson = seasonJson['Roster'];
            if (seasonRosterJson) {
                if ('Teams' in seasonRosterJson) {
                    for (const teamHId in seasonRosterJson['Teams']) {
                        const teamJson = seasonRosterJson['Teams'][teamHId];
                        teamJson['TeamName'] = await getTeamName(teamHId);
                        teamJson['TeamHId'] = teamHId;
                        for (const profileHId in teamJson['Players']) {
                            const playerJson = teamJson['Players'][profileHId];
                            playerJson['ProfileName'] = await getProfileName(profileHId);
                            playerJson['ProfileHId'] = profileHId;
                        }
                    }
                }
                resolve(seasonRosterJson);
            }
            else {
                resolve(null);    // If 'Roster' does not exist
            }
        }).catch((error) => { console.error(error); reject(error); });
    });
}

/**
 * Get 'Roster' property from Season and properties are the Team Names / Profile Names
 * @param {number} seasonId 
 */
export const getSeasonRosterByName = (seasonId) => {
    return new Promise((resolve, reject) => {
        getSeasonRosterById(seasonId).then((seasonRosterObject) => {
            // https://stackoverflow.com/questions/8483425/change-property-name
            const teamsRosterObject = seasonRosterObject.Teams;
            for (const teamHId in teamsRosterObject) {
                const teamObject = teamsRosterObject[teamHId]
                const playersRosterObject = teamsRosterObject[teamHId].Players;
                for (const profileHId in playersRosterObject) {
                    const profileObject = playersRosterObject[profileHId];
                    const profileName = profileObject.ProfileName;
                    playersRosterObject[profileName] = profileObject;
                    delete playersRosterObject[profileHId];
                }
                const teamName = teamObject.TeamName;
                teamsRosterObject[teamName] = teamObject;
                delete teamsRosterObject[teamHId];
            }
            resolve(seasonRosterObject);
        }).catch((error) => { console.error(error); reject(error); });
    });
}

/**
 * Get 'Regular' property from Season for the Regular Season
 * @param {number} seasonId 
 */
export const getSeasonRegular = (seasonId) => {
    const cacheKey = CACHE_KEYS.SEASON_REGULAR_PREFIX + seasonId;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, async (err, data) => {
            if (err) { console(err); reject(err); return; }
            else if (data != null) { resolve(JSON.parse(data)); return; }
            try {
                let seasonRegularJson = (await dynamoDbGetItem('Season', 'SeasonPId', seasonId))['Regular'];
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
                    cache.set(cacheKey, JSON.stringify(seasonRegularJson, null, 2), 'EX', GLOBAL_CONSTS.TTL_DURATION);
                    resolve(seasonRegularJson);
                }
                else {
                    resolve(null);    // If 'Season' does not exist
                }
            }
            catch (error) { console.error(error); reject(error); }
        });
    });
}

/**
 * Get 'Playoffs' property from Season for Playoffs
 * @param {number} seasonId 
 */
export const getSeasonPlayoffs = (seasonId) => {
    const cacheKey = CACHE_KEYS.SEASON_PLAYOFF_PREFIX + seasonId;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, async (err, data) => {
            if (err) { console(err); reject(err); return }
            else if (data != null) { resolve(JSON.parse(data)); return }
            try {
                let playoffJson = (await dynamoDbGetItem('Season', 'SeasonPId', seasonId))['Playoffs'];
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
                    cache.set(cacheKey, JSON.stringify(playoffJson, null, 2), 'EX', GLOBAL_CONSTS.TTL_DURATION);
                    resolve(playoffJson);
                }
                else {
                    resolve(null);    // If 'Playoffs' does not exist
                }
            }
            catch (error) { console.error(error); reject(error); }
        });
    });
}

/**
 * Adds new team into Season Roster. Initializes a new object if null
 * @param {number} seasonId     Assume valid
 * @param {string} teamPId      Assume valid
 */
export const putSeasonTeam = (seasonId, teamPId) => {
    return new Promise((resolve, reject) => {
        dynamoDbGetItem('Season', 'SeasonPId', seasonId).then(async (seasonObject) => {
            // Check if Roster property exists. If not, init new one
            if (!('Roster' in seasonObject)) {
                seasonObject.Roster = {
                    Teams: {}
                };
            }
            const seasonRosterObject = seasonObject.Roster;
            // Check if there is a duplicate
            const teamHId = getTeamHashId(teamPId);
            if (teamHId in seasonRosterObject.Teams) {
                resolve({
                    'SeasonId': seasonId,
                    'Error': `Team is already in the season.`
                });
            }
            seasonRosterObject.Teams[teamHId] = {
                Players: {}
            };
            await dynamoDbPutItem('Season', seasonObject, seasonId);
            resolve({
                'SeasonId': seasonId,
                'SeasonRoster': seasonRosterObject,
            });
        }).catch((err) => { console.error(err); reject(err); });
    });
}

/**
 * Adds new Profile into a team in the Season Roster.
 * @param {number} seasonId     Assume valid 
 * @param {string} teamPId      Assume valid
 * @param {string} profilePId   Assume valid
 */
export const putSeasonProfileInTeam = (seasonId, teamPId, profilePId) => {
    return new Promise((resolve, reject) => {
        dynamoDbGetItem('Season', 'SeasonPId', seasonId).then(async (seasonObject) => {
            // Check if Roster or Team property exists. If not, init new one
            if (!('Roster' in seasonObject) || !('Teams' in seasonObject.Roster)) {
                resolve({
                    'SeasonId': seasonId,
                    'Error': `Season Object does not have Roster`
                });
            }
            const rosterTeamObject = seasonObject.Roster.Teams;
            const teamHId = getTeamHashId(teamPId);
            if (!(teamHId in rosterTeamObject)) {
                resolve({
                    'SeasonId': seasonId,
                    'Error': `Team is not in the Season Rosters.`
                });
            }
            // Check for duplicate in ProfilePId
            const rosterPlayersObject = rosterTeamObject[teamHId].Players;
            const profileHId = getProfileHashId(profilePId);
            if (rosterPlayersObject && profileHId in rosterPlayersObject) {
                resolve({
                    'SeasonId': seasonId,
                    'Error': `Profile is already in the Team.`
                });
            }
            rosterPlayersObject[profileHId] = {};
            await dynamoDbPutItem('Season', seasonObject, seasonId);
            resolve({
                'SeasonId': seasonId,
                'SeasonRoster': seasonObject.Roster,
            });
        }).catch((err) => { console.error(err); reject(err); });
    });
}