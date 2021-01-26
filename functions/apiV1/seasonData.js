/*  Declaring npm modules */
require('dotenv').config({ path: '../../.env' });
const redis = require('redis');
const cache = (process.env.NODE_ENV === 'production') ? redis.createClient(process.env.REDIS_URL) : redis.createClient(process.env.REDIS_PORT);

/*  Import dependency modules */
import {
    filterName,
    GLOBAL_CONSTS,
} from './dependencies/global';
import {
    dynamoDbGetItem,
    dynamoDbScanTable,
} from './dependencies/dynamoDbHelper';
import { CACHE_KEYS } from './dependencies/cacheKeys'

/*  Import data functions */
import { getTournamentShortName } from './tournamentData';
import { getProfileName } from './profileData';
import { getTeamName } from './teamData';

// Get SeasonPId from DynamoDb
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
 * @param {number} sPId      Season Id in number format
 */
export const getSeasonShortName = (sPId) => {
    const cacheKey = CACHE_KEYS.SEASON_CODE_PREFIX + sPId;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, (err, data) => {
            if (err) { console(err); reject(err); return; }
            else if (data != null) { resolve(data); return; }
            dynamoDbGetItem('Season', 'SeasonPId', sPId)
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
 * @param {number} sPId      Season Id in number format
 */
export const getSeasonName = (sPId) => {
    const cacheKey = CACHE_KEYS.SEASON_NAME_PREFIX + sPId;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, (err, data) => {
            if (err) { console(err); reject(err); return; }
            else if (data != null) { resolve(data); return; }
            dynamoDbGetItem('Season', 'SeasonPId', sPId)
            .then((obj) => {
                if (obj == null) { resolve(null); return; } // Not Found
                let name = obj['Information']['SeasonName'];
                cache.set(cacheKey, name);
                resolve(name);
            }).catch((error) => { console.error(error); reject(error) });
        });
    });
}

// Returns a Season Time (i.e. Winter 2020)
export const getSeasonTime = (sPId) => {
    const cacheKey = CACHE_KEYS.SEASON_TIME_PREFIX + sPId;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, (err, data) => {
            if (err) { console(err); reject(err); return; }
            else if (data != null) { resolve(data); return; }
            dynamoDbGetItem('Season', 'SeasonPId', sPId)
            .then((obj) => {
                if (obj == null) { resolve(null); return; } // Not Found
                let time = obj['Information']['SeasonTime'];
                cache.set(cacheKey, time);
                resolve(time);
            }).catch((error) => { console.error(error); reject(error) });
        });
    });
}

export const getSeasonTabName = (sPId) => {
    const cacheKey = CACHE_KEYS.SEASON_TAB_PREFIX + sPId;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, (err, data) => {
            if (err) { console(err); reject(err); return; }
            else if (data != null) { resolve(data); return; }
            dynamoDbGetItem('Season', 'SeasonPId', sPId)
            .then((obj) => {
                if (obj == null) { resolve(null); return; } // Not Found
                let time = obj['Information']['SeasonTabName'];
                cache.set(cacheKey, time);
                resolve(time);
            }).catch((error) => { console.error(error); reject(error) });
        });
    });
}

// For leagues page
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
                    resolve({});   // Return empty if does not exist
                }     
            }
            catch (ex) { console.error(ex); reject(ex); }
        });
    })
}

export const getSeasonInformation = (sPId) => {
    const cacheKey = CACHE_KEYS.SEASON_INFO_PREFIX + sPId;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, async (err, data) => {
            if (err) { console(err); reject(err); return; }
            else if (data != null) { resolve(JSON.parse(data)); return; }
            try {
                let seasonInfoJson = (await dynamoDbGetItem('Season', 'SeasonPId', sPId))['Information'];
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
                    resolve({});    // If 'Information' does not exist
                }
            }
            catch (error) { console.error(error); reject(error); }
        });
    });
}

export const getSeasonRoster = (sPId) => {
    const cacheKey = CACHE_KEYS.SEASON_ROSTER_PREFIX + sPId;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, async (err, data) => {
            if (err) { console(err); reject(err); return; }
            else if (data != null) { resolve(JSON.parse(data)); return; }
            try {
                let seasonRosterJson = (await dynamoDbGetItem('Season', 'SeasonPId', sPId))['Roster'];
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
                    cache.set(cacheKey, JSON.stringify(seasonRosterJson, null, 2), 'EX', GLOBAL_CONSTS.TTL_DURATION);
                    resolve(seasonRosterJson);
                }
                else {
                    resolve({});    // If 'Roster' does not exist
                }
            }
            catch (error) { console.error(error); reject(error); }
        });
    });
}

export const getRegularSeason = (sPId) => {
    const cacheKey = CACHE_KEYS.SEASON_REGULAR_PREFIX + sPId;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, async (err, data) => {
            if (err) { console(err); reject(err); return; }
            else if (data != null) { resolve(JSON.parse(data)); return; }
            try {
                let seasonRegularJson = (await dynamoDbGetItem('Season', 'SeasonPId', sPId))['Regular'];
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
                    resolve({});    // If 'Season' does not exist
                }
            }
            catch (error) { console.error(error); reject(error); }
        });
    });
}

export const getSeasonPlayoffs = (sPId) => {
    const cacheKey = CACHE_KEYS.SEASON_PLAYOFF_PREFIX + sPId;
    return new Promise(function(resolve, reject) {
        cache.get(cacheKey, async (err, data) => {
            if (err) { console(err); reject(err); return }
            else if (data != null) { resolve(JSON.parse(data)); return }
            try {
                let playoffJson = (await dynamoDbGetItem('Season', 'SeasonPId', sPId))['Playoffs'];
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
                    resolve({});    // If 'Playoffs' does not exist
                }
            }
            catch (error) { console.error(error); reject(error); }
        });
    });
}