module.exports = {
    getData: getMatchData,
    putPlayersFix: putMatchPlayerFix,
    deleteData: removeMatchFromDb,
}

/*  Declaring npm modules */
require('dotenv').config({ path: '../../.env' });
const redis = require('redis');
const cache = (process.env.NODE_ENV === 'production') ? redis.createClient(process.env.REDIS_URL) : redis.createClient(process.env.REDIS_PORT);

/*  Import helper function modules */
const dynamoDb = require('./dynamoDbHelper');
const mySql = require('./mySqlHelper');
const keyBank = require('./cacheKeys');
// Data Functions
const Season = require('./seasonData');
const Tournament = require('./tournamentData');
const Profile = require('./profileData');
const Team = require('./teamData');
const GLOBAL = require('./global');

async function getMatchData(Id) {
    return new Promise(function(resolve, reject) {
        const cacheKey = keyBank.MATCH_PREFIX + Id;
        cache.get(cacheKey, async (err, data) => {
            if (err) { console.error(err); reject(err); }
            else if (data != null) { resolve(JSON.parse(data)); return; }
            try {
                let matchJson = await dynamoDb.getItem('Matches', 'MatchPId', Id);
                if (matchJson == null) { resolve(null); return; } // Not Found
                let seasonPId = matchJson['SeasonPId'];
                matchJson['SeasonShortName'] = await Season.getShortName(seasonPId);
                matchJson['SeasonName'] = await Season.getName(seasonPId);
                let tourneyPId = matchJson['TournamentPId'];
                matchJson['TournamentShortName'] = await Tournament.getShortName(tourneyPId);
                matchJson['TournamentName'] = await Tournament.getName(tourneyPId);
                matchJson['TournamentTabName'] = await Tournament.getTabName(tourneyPId);
                let gameDurationMinute = matchJson['GameDuration'] / 60;
                for (let i = 0; i < Object.keys(matchJson['Teams']).length; ++i) {
                    let teamId = Object.keys(matchJson['Teams'])[i];
                    let teamJson = matchJson['Teams'][teamId];
                    teamJson['TeamName'] = await Team.getName(teamJson['TeamHId']);
                    teamJson['TeamShortName'] = await Team.getShortName(teamJson['TeamHId']);
                    for (let j = 0; j < Object.keys(teamJson['Players']).length; ++j) {
                        let partId = Object.keys(teamJson['Players'])[j];
                        let playerJson = teamJson['Players'][partId];
                        playerJson['ProfileName'] = await Profile.getName(playerJson['ProfileHId']);
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
                cache.set(cacheKey, JSON.stringify(matchJson, null, 2), 'EX', GLOBAL.TTL_DURATION_3HRS);
                resolve(matchJson);
            }
            catch (error) { console.error(error); reject(error); }
        });
    })
}

// BODY EXAMPLE:
// {
//     playersToFix: {
//         [champId]: 'P_ID',
//         // etc.
//     },
// }
async function putMatchPlayerFix(playersToFix, matchId) {
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
                        let name = await Profile.getName(newProfilePId, false); // For PId
                        //await Profile.getName(newProfileId); // For HId
                        if (name == null) { resolve(null); return; } // Not found
                        namesChanged.push(name); // For response
                        await mySql.callSProcUpdate('updatePlayerIdByChampIdMatchId', newProfilePId, champId, matchId);
                        playerObject['ProfileHId'] = GLOBAL.getProfileHId(newProfilePId);
                        delete playerObject['ProfileName']; // In the database for no reason
                        // Remove from Profile GameLog in former Profile Id and Team GameLog
                        let profileGameLog = await Profile.getGames(thisProfilePId, seasonId);
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
                        let teamGameLog = await Team.getGames(thisTeamPId, seasonId);
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

async function removeMatchFromDb(matchId) {
    return new Promise(async (resolve, reject) => {
        try {
            // 1) Remove and update Game Logs from EACH Profile Collection
            // 2) Remove and update Game Logs from EACH Team Collection
            // 3) Remove from Match Collection
            // 4) Remove from MySQL
            let matchData = await dynamoDb.getItem('Matches', 'MatchPId', matchId);
            if (matchData == null) { resolve(null); return; } // Not found
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
            // 3) 
            await dynamoDb.deleteItem('Matches', 'MatchPId', matchId);
            // 4) 
            await mySql.callSProc('removeMatchByMatchId', parseInt(matchId));

            // Del from Cache
            cache.del(`${keyBank.MATCH_PREFIX}${matchId}`);
            resolve({ response: `Match ID '${matchId}' removed from the database.` });
        }
        catch (err) { reject({ error: err }) };
    });
}