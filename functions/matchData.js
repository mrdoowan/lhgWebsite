module.exports = {
    getData: getMatchData,
}

/*  Declaring npm modules */
require('dotenv').config({ path: '../.env' });
const redis = require('redis');
const cache = redis.createClient(process.env.REDIS_PORT);

/*  Import helper function modules */
const dynamoDb = require('./dynamoDbHelper');
const keyBank = require('./cacheKeys');

async function getMatchData(Id) {
    return new Promise(function(resolve, reject) {
        let cacheKey = keyBank.MATCH_PREFIX + Id;
        cache.get(cacheKey, async (err, data) => {
            if (err) { reject(500); }
            else if (data != null) { resolve(JSON.parse(data)); }
            else {
                try {
                    let matchJson = await dynamoDb.getItem('Matches', 'MatchPId', req.params.matchId);
                    if (matchJson == null) { reject(404); }
                    else {
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
                        resolve(matchJson);
                    }
                }
                catch (err) { reject(500); }
            }
        });
    })
}