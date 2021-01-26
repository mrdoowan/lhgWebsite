/*  Declaring npm modules */
require('dotenv').config({ path: '../../.env' });
const redis = require('redis');
const cache = (process.env.NODE_ENV === 'production') ? redis.createClient(process.env.REDIS_URL) : redis.createClient(process.env.REDIS_PORT);

/*  Import dependency modules */
const dynamoDb = require('./dependencies/dynamoDbHelper');
const mySql = require('./dependencies/mySqlHelper');
const lambda = require('./dependencies/awsLambdaHelper');
const keyBank = require('./dependencies/cacheKeys');
// Data Functions
import {
    getSeasonName,
    getSeasonShortName,
} from './seasonData';
import {
    getTournamentName,
    getTournamentShortName,
    getTournamentTabName,
} from './tournamentData';
import {
    getProfileName,
    getProfileGamesBySeason,
} from './profileData';
import {
    getTeamName,
    getTeamShortName,
    getTeamGamesBySeason,
} from './teamData';
const Team = require('./teamData');
const GLOBAL = require('./dependencies/global');

/**
 * Get the data of a specific Match from DynamoDb
 * @param {string} id       Match Id in string format
 */
export const getMatchData = async (id) => {
    return new Promise(function(resolve, reject) {
        const cacheKey = keyBank.MATCH_PREFIX + id;
        cache.get(cacheKey, async (err, data) => {
            if (err) { console.error(err); reject(err); }
            else if (data != null) { resolve(JSON.parse(data)); return; }
            try {
                let matchJson = await dynamoDb.getItem('Matches', 'MatchPId', id);
                if (matchJson == null || "Setup" in matchJson) { resolve(null); return; } // Not Found or it's a Setup
                let seasonPId = matchJson['SeasonPId'];
                matchJson['SeasonShortName'] = await getSeasonShortName(seasonPId);
                matchJson['SeasonName'] = await getSeasonName(seasonPId);
                let tourneyPId = matchJson['TournamentPId'];
                matchJson['TournamentShortName'] = await getTournamentShortName(tourneyPId);
                matchJson['TournamentName'] = await getTournamentName(tourneyPId);
                matchJson['TournamentTabName'] = await getTournamentTabName(tourneyPId);
                let gameDurationMinute = matchJson['GameDuration'] / 60;
                for (let i = 0; i < Object.keys(matchJson['Teams']).length; ++i) {
                    let teamId = Object.keys(matchJson['Teams'])[i];
                    let teamJson = matchJson['Teams'][teamId];
                    teamJson['TeamName'] = await getTeamName(teamJson['TeamHId']);
                    teamJson['TeamShortName'] = await getTeamShortName(teamJson['TeamHId']);
                    for (let j = 0; j < Object.keys(teamJson['Players']).length; ++j) {
                        let partId = Object.keys(teamJson['Players'])[j];
                        let playerJson = teamJson['Players'][partId];
                        playerJson['ProfileName'] = await getProfileName(playerJson['ProfileHId']);
                        playerJson['Kda'] = (playerJson['Deaths'] > 0) ? (((playerJson['Kills'] + playerJson['Assists']) / playerJson['Deaths']).toFixed(2)).toString() : "Perfect";
                        playerJson['KillPct'] = (teamJson['TeamKills'] == 0) ? 0 : ((playerJson['Kills'] + playerJson['Assists']) / teamJson['TeamKills']).toFixed(4);
                        playerJson['DeathPct'] = (teamJson['TeamDeaths'] == 0) ? 0 : (playerJson['Deaths'] / teamJson['TeamDeaths']).toFixed(4);
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
                cache.set(cacheKey, JSON.stringify(matchJson, null, 2), 'EX', GLOBAL.TTL_DURATION);
                resolve(matchJson);
            }
            catch (error) { console.error(error); reject(error); }
        });
    })
}

/**
 * Get the 'Setup' object of a specific Match from DynamoDb
 * @param {string} id       Match Id in string format
 */
export const getMatchSetup = async (id) => {
    return new Promise(async function(resolve, reject) {
        try {
            let matchJson = await dynamoDb.getItem('Matches', 'MatchPId', id);
            if (matchJson == null || !("Setup" in matchJson)) { resolve(null); return; } // Not Found
            let matchSetupJson = matchJson['Setup'];
            matchSetupJson['SeasonName'] = await getSeasonName(matchSetupJson['SeasonPId']);
            matchSetupJson['TournamentName'] = await getTournamentName(matchSetupJson['TournamentPId']);
            
            // Edit names into the Json
            let teamsObject = matchSetupJson['Teams'];
            for (let teamIdx = 0; teamIdx < Object.values(teamsObject).length; ++teamIdx) {
                let teamJson = Object.values(teamsObject)[teamIdx];
                if ('TeamHId' in teamJson) { teamJson['TeamName'] = await getTeamName(teamJson['TeamHId']) }
                let playersList = teamJson['Players'];
                for (let i = 0; i < playersList.length; ++i) {
                    let playerJson = playersList[i];
                    if ('ProfileHId' in playerJson) { playerJson['ProfileName'] = await getProfileName(playerJson['ProfileHId']); }
                }
            }

            resolve(matchSetupJson);
        }
        catch (error) { console.error(error); reject(error); }
    })
}

/**
 * Get the data of a specific Match from DynamoDb
 * @param {string} matchId      Match Id (string)
 * @param {string} seasonId     ID of Season (number)
 * @param {string} tournamentId ID of Tournament (number)
 */
export const putMatchNewSetup = (matchId, seasonId, tournamentId) => {
    return new Promise(async function(resolve, reject) {
        try {
            // Check if matchId already exists
            if (await dynamoDb.getItem('Matches', 'MatchPId', matchId) != null) {
                console.error(`Match ID ${matchId} already exists.`);
                resolve(null); 
                return; 
            }
            // Check if seasonId exists
            if (await dynamoDb.getItem('Tournament', 'TournamentPId', tournamentId) == null) {
                console.error(`Tournament ID ${tournamentId} doesn't exists.`);
                resolve(null); 
                return; 
            }
            // Check if tournamentId exists
            if (await dynamoDb.getItem('Season', 'SeasonPId', seasonId) == null) {
                console.error(`Season ID ${seasonId} doesn't exists.`);
                resolve(null); 
                return; 
            }

            // Get data from Riot API
            const matchDataRiotJson = (await lambda.getRiotMatchData(matchId))['Data'];

            let setupObject = {}
            setupObject['RiotMatchId'] = matchId;
            setupObject['SeasonPId'] = seasonId;
            setupObject['TournamentPId'] = tournamentId;
            setupObject['Teams'] = {}
            setupObject['Teams']['BlueTeam'] = {}
            setupObject['Teams']['RedTeam'] = {}
            // Iterate through Riot's 'teams' Object:
            // 1) Make Bans List
            for (let teamIdx = 0; teamIdx < matchDataRiotJson['teams'].length; ++teamIdx) {
                // Make Bans List
                const teamDataRiotJson = matchDataRiotJson['teams'][teamIdx];
                
                // 0 = BlueTeam
                // 1 = RedTeam
                // https://stackoverflow.com/questions/19590865/from-an-array-of-objects-extract-value-of-a-property-as-array
                if (teamIdx === 0) {
                    setupObject['Teams']['BlueTeam']['Bans'] = teamDataRiotJson['bans'].map(b => b.championId);
                }
                else if (teamIdx === 1) {
                    setupObject['Teams']['RedTeam']['Bans'] = teamDataRiotJson['bans'].map(b => b.championId);
                }
            }
            // Iterate through Riot's 'participants' Object:
            // 1) Make Players List
            let newBluePlayerList = [];
            let newRedPlayerList = [];
            for (let playerIdx = 0; playerIdx < matchDataRiotJson['participants'].length; ++playerIdx) {
                let newPlayerObject = {}
                const playerRiotJson = matchDataRiotJson['participants'][playerIdx];
                newPlayerObject['ChampId'] = playerRiotJson['championId'];
                newPlayerObject['Spell1Id'] = playerRiotJson['spell1Id'];
                newPlayerObject['Spell2Id'] = playerRiotJson['spell2Id'];
                const playerTimelineRiotJson = playerRiotJson['timeline'];
                newPlayerObject['Role'] = (playerTimelineRiotJson['lane'] === 'TOP') ? "Top" :
                    (playerTimelineRiotJson['lane'] === 'JUNGLE') ? "Jungle" :
                    (playerTimelineRiotJson['lane'] === 'MIDDLE') ? "Middle" :
                    (playerTimelineRiotJson['lane'] === 'BOTTOM' && playerTimelineRiotJson['role'] == 'DUO_CARRY') ? "Bottom" :
                    (playerTimelineRiotJson['lane'] === 'BOTTOM' && playerTimelineRiotJson['role'] == 'DUO_SUPPORT') ? "Support" :
                    "Unknown";
                // Add to List
                if (playerRiotJson['teamId'] === 100) { newBluePlayerList.push(newPlayerObject); }
                else if (playerRiotJson['teamId'] === 200) { newRedPlayerList.push(newPlayerObject); }
            }
            setupObject['Teams']['BlueTeam']['Players'] = newBluePlayerList;
            setupObject['Teams']['RedTeam']['Players'] = newRedPlayerList;

            // Push into DynamoDb
            await dynamoDb.updateItem('Matches', 'MatchPId', matchId,
                'SET #setup = :obj',
                {
                    '#setup': 'Setup',
                },
                {
                    ':obj': setupObject,
                }
            );
            resolve({
                response: `New Setup for Match ID '${matchId}' successfully created.`,
                objectCreated: setupObject,
            });
        }
        catch (error) { console.error(error); reject(error); }
    });
}

// BODY EXAMPLE:
// {
//     "matchId": "3450759464",
//     playersToFix: {
//         [champId]: 'P_ID',
//         // etc.
//     },
// }
/**
 * Get the data of a specific Match from DynamoDb
 * @param {string} playersToFix  JSON Object 
 * @param {string} matchId       Match Id in string format
 */
export const putMatchPlayerFix = async (playersToFix, matchId) => {
    return new Promise(function(resolve, reject) {
        getMatchData(matchId).then(async (data) => {
            if (data == null) { resolve(null); return; } // Not found
            let changesMade = false;
            let seasonId = data['SeasonPId'];
            let namesChanged = [];
            for (let tIdx = 0; tIdx < Object.keys(data.Teams).length; ++tIdx) {
                let teamId = Object.keys(data.Teams)[tIdx];
                let thisTeamPId = GLOBAL.getTeamPId(data.Teams[teamId]['TeamHId']);
                let { Players } = data.Teams[teamId];
                for (let pIdx = 0; pIdx < Object.values(Players).length; ++pIdx) {
                    let playerObject = Object.values(Players)[pIdx];
                    let thisProfilePId = GLOBAL.getProfilePId(playerObject['ProfileHId']);
                    let champId = playerObject['ChampId'].toString();
                    if (champId in playersToFix && playersToFix[champId] !== thisProfilePId) {
                        let newProfilePId = playersToFix[champId];
                        let name = await getProfileName(newProfilePId, false); // For PId
                        //await getProfileName(newProfileId); // For HId
                        if (name == null) { resolve(null); return; } // Not found
                        namesChanged.push(name); // For response
                        await mySql.callSProc('updatePlayerIdByChampIdMatchId', newProfilePId, champId, matchId);
                        playerObject['ProfileHId'] = GLOBAL.getProfileHId(newProfilePId);
                        delete playerObject['ProfileName']; // In the database for no reason

                        // Remove from Profile GameLog in former Profile Id and Team GameLog
                        let profileGameLog = await getProfileGamesBySeason(thisProfilePId, seasonId);
                        if (matchId in profileGameLog['Matches']) {
                            delete profileGameLog['Matches'][matchId];
                            await dynamoDb.updateItem('Profile', 'ProfilePId', thisProfilePId,
                                'SET #glog.#sId = :data',
                                {
                                    '#glog': 'GameLog',
                                    '#sId': seasonId,
                                },
                                {
                                    ':data': profileGameLog,
                                }
                            );
                        }
                        let teamGameLog = await getTeamGamesBySeason(thisTeamPId, seasonId);
                        if (matchId in teamGameLog['Matches']) {
                            delete teamGameLog['Matches'][matchId];
                            await dynamoDb.updateItem('Team', 'TeamPId', thisTeamPId,
                                'SET #gLog.#sId = :val',
                                {
                                    '#gLog': 'GameLog',
                                    '#sId': seasonId,
                                },
                                {
                                    ':val': teamGameLog,
                                }
                            );
                        }
                        changesMade = true;
                    }
                }
            }
            if (changesMade) {
                await dynamoDb.updateItem('Matches', 'MatchPId', matchId,
                    'SET #teams = :data',
                    {
                        '#teams': 'Teams',
                    },
                    {
                        ':data': data.Teams,
                    }
                );
                // Delete match cache
                cache.del(`${keyBank.MATCH_PREFIX}${matchId}`);
                
                // Return
                resolve({
                    response: `Match ID '${matchId}' successfully updated.`,
                    profileUpdate: namesChanged,
                })
            }
            else {
                resolve({ response: `No changes made in Match ID '${matchId}'` })
            }
        }).catch((error) => { console.error(error); reject(error); });
    });
}

/**
 * Removes the specific Match item from from DynamoDb
 * @param {string} matchId      Match Id in string format
 */
export const deleteMatchData = async (matchId) => {
    return new Promise(async (resolve, reject) => {
        try {
            // 1) Remove and update Game Logs from EACH Profile Table
            // 2) Remove and update Game Logs from EACH Team Table
            // 3) Remove from Match Table
            // 4) Remove from MySQL
            let matchData = await dynamoDb.getItem('Matches', 'MatchPId', matchId);
            if (matchData == null) { resolve(null); return; } // Not found
            // Check if it's just a Setup Match table. If it is, skip everything below
            if (!('Setup' in matchData)) {
                let seasonPId = matchData['SeasonPId'];
                const { Teams } = matchData;
                for (let teamIdx = 0; teamIdx < Object.values(Teams).length; ++teamIdx) {
                    let teamObject = Object.values(Teams)[teamIdx];
                    let teamPId = GLOBAL.getTeamPId(teamObject['TeamHId']);
                    let teamSeasonGameLog = (await dynamoDb.getItem('Team', 'TeamPId', teamPId))['GameLog'][seasonPId]['Matches'];
                    delete teamSeasonGameLog[matchId];
                    const { Players } = teamObject;
                    for (let playerIdx = 0; playerIdx < Object.values(Players).length; ++playerIdx) {
                        let playerObject = Object.values(Players)[playerIdx];
                        let profilePId = GLOBAL.getProfilePId(playerObject['ProfileHId']);
                        let playerSeasonGameLog = (await dynamoDb.getItem('Profile', 'ProfilePId', profilePId))['GameLog'][seasonPId]['Matches'];
                        delete playerSeasonGameLog[matchId];
                        // 1)
                        await dynamoDb.updateItem('Profile', 'ProfilePId', profilePId,
                            'SET #gLog.#sPId.#mtch = :data',
                            {
                                '#gLog': 'GameLog',
                                '#sPId': seasonPId,
                                '#mtch': 'Matches'
                            },
                            {
                                ':data': playerSeasonGameLog,
                            }
                        );
                    }
                    // 2)
                    await dynamoDb.updateItem('Team', 'TeamPId', teamPId,
                        'SET #gLog.#sPId.#mtch = :data',
                        {
                            '#gLog': 'GameLog',
                            '#sPId': seasonPId,
                            '#mtch': 'Matches'
                        },
                        {
                            ':data': teamSeasonGameLog,
                        }
                    );
                }
                // 4) 
                await mySql.callSProc('removeMatchByMatchId', parseInt(matchId));
            }
            
            // 3) 
            await dynamoDb.deleteItem('Matches', 'MatchPId', matchId);

            // Del from Cache
            cache.del(`${keyBank.MATCH_PREFIX}${matchId}`);
            resolve({ response: `Match ID '${matchId}' removed from the database.` });
        }
        catch (err) { reject({ error: err }) };
    });
}