/*  Declaring npm modules */
const redis = require('redis');

/*  Import dependency modules */
import {
  dynamoDbGetItem,
  dynamoDbUpdateItem,
  dynamoDbDeleteItem,
  dynamoDbPutItem,
} from './dependencies/dynamoDbHelper';
import { mySqlCallSProc } from './dependencies/mySqlHelper';
import { getRiotMatchData } from './dependencies/awsLambdaHelper';
import { CACHE_KEYS } from './dependencies/cacheKeys'
/*  Import data functions */
import {
  getSeasonName,
  getSeasonShortName,
} from './seasonData';
import {
  getTournamentInfo,
  getTournamentName,
  getTournamentShortName,
  getTournamentTabName,
  getTournamentType,
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
import {
  getProfilePIdFromHash,
  getProfileHashId,
  getTeamPIdFromHash,
  GLOBAL_CONSTS,
} from './dependencies/global';
import { checkRdsStatus } from './dependencies/awsRdsHelper';
import { 
  AWS_RDS_STATUS,
  DYNAMODB_TABLENAMES,
  MISC_KEYS
} from '../../services/constants';

const cache = (process.env.NODE_ENV === 'production') ? redis.createClient(process.env.REDIS_URL) : redis.createClient(process.env.REDIS_PORT);

/**
 * Get the data of a specific Match from DynamoDb
 * @param {string} id       Match Id in string format
 */
export const getMatchData = (id) => {
  return new Promise(function (resolve, reject) {
    const cacheKey = CACHE_KEYS.MATCH_PREFIX + id;
    cache.get(cacheKey, async (err, data) => {
      if (err) { console.error(err); reject(err); }
      else if (data != null) { resolve(JSON.parse(data)); return; }
      try {
        const matchObject = await dynamoDbGetItem('Matches', id);
        if (!matchObject || matchObject.Setup) { resolve(null); return; } // Not Found or it's a Setup
        const seasonPId = matchObject.SeasonPId;
        matchObject['SeasonShortName'] = await getSeasonShortName(seasonPId);
        matchObject['SeasonName'] = await getSeasonName(seasonPId);
        const tourneyPId = matchObject['TournamentPId'];
        matchObject['TournamentShortName'] = await getTournamentShortName(tourneyPId);
        matchObject['TournamentType'] = await getTournamentType(tourneyPId);
        const gameDurationMinute = matchObject['GameDuration'] / 60;
        for (const teamObject of Object.values(matchObject.Teams)) {
          teamObject['TeamName'] = await getTeamName(teamObject['TeamHId']);
          teamObject['TeamShortName'] = await getTeamShortName(teamObject['TeamHId']);
          teamObject['GoldDiffEarlyToMid'] = teamObject['GoldDiffMid'] - teamObject['GoldDiffEarly'];
          for (const playerObject of Object.values(teamObject.Players)) {
            playerObject['ProfileName'] = await getProfileName(playerObject['ProfileHId']);
            playerObject['Kda'] = (playerObject['Deaths'] > 0) ? (((playerObject['Kills'] + playerObject['Assists']) / playerObject['Deaths']).toFixed(2)).toString() : "Perfect";
            playerObject['KillPct'] = (teamObject['TeamKills'] == 0) ? 0 : ((playerObject['Kills'] + playerObject['Assists']) / teamObject['TeamKills']).toFixed(4);
            playerObject['KillPctAtEarly'] = ((playerObject['KillsAtEarly'] + playerObject['AssistsAtEarly']) / teamObject['KillsAtEarly']).toFixed(4);
            playerObject['KillPctAtMid'] = ((playerObject['KillsAtMid'] + playerObject['AssistsAtMid']) / teamObject['KillsAtMid']).toFixed(4);
            playerObject['DeathPct'] = (teamObject['TeamDeaths'] == 0) ? 0 : (playerObject['Deaths'] / teamObject['TeamDeaths']).toFixed(4);
            playerObject['GoldDiffEarlyToMid'] = playerObject['GoldDiffMid'] - playerObject['GoldDiffEarly'];
            playerObject['GoldPct'] = (playerObject['Gold'] / teamObject['TeamGold']).toFixed(4);
            playerObject['GoldPerMinute'] = (playerObject['Gold'] / gameDurationMinute).toFixed(2);
            playerObject['DamageDealtPct'] = (playerObject['TotalDamageDealt'] / teamObject['TeamDamageDealt']).toFixed(4);
            playerObject['CreepScorePct'] = (playerObject['CreepScore'] / teamObject['TeamCreepScore']).toFixed(4);
            playerObject['CreepScorePerMinute'] = (playerObject['CreepScore'] / gameDurationMinute).toFixed(2);
            playerObject['VisionScorePct'] = (playerObject['VisionScore'] / teamObject['TeamVisionScore']).toFixed(4);
            playerObject['VisionScorePerMinute'] = (playerObject['VisionScore'] / gameDurationMinute).toFixed(2);
            playerObject['WardsPlacedPerMinute'] = (playerObject['WardsPlaced'] / gameDurationMinute).toFixed(2);
            playerObject['ControlWardsBoughtPerMinute'] = (playerObject['ControlWardsBought'] / gameDurationMinute).toFixed(2);
            playerObject['WardsClearedPerMinute'] = (playerObject['WardsCleared'] / gameDurationMinute).toFixed(2);
          }
        }
        cache.set(cacheKey, JSON.stringify(matchObject, null, 2), 'EX', GLOBAL_CONSTS.TTL_DURATION);
        resolve(matchObject);
      }
      catch (error) { console.error(error); reject(error); }
    });
  })
}

/**
 * Get the 'Setup' object of a specific Match from DynamoDb
 * @param {string} id       Match Id in string format
 */
export const getMatchSetup = (id) => {
  return new Promise(async function (resolve, reject) {
    try {
      const matchJson = await dynamoDbGetItem('Matches', id);
      if (matchJson == null || !("Setup" in matchJson)) { resolve(null); return; } // Not Found
      const matchSetupJson = matchJson['Setup'];
      matchSetupJson['SeasonName'] = await getSeasonName(matchSetupJson['SeasonPId']);
      matchSetupJson['SeasonShortName'] = await getSeasonShortName(matchSetupJson['SeasonPId']);
      matchSetupJson['TournamentName'] = await getTournamentName(matchSetupJson['TournamentPId']);

      // Edit names into the Json
      const teamsObject = matchSetupJson['Teams'];
      for (let teamIdx = 0; teamIdx < Object.values(teamsObject).length; ++teamIdx) {
        const teamJson = Object.values(teamsObject)[teamIdx];
        if ('TeamHId' in teamJson) { teamJson['TeamName'] = await getTeamName(teamJson['TeamHId']) }
        const playersList = teamJson['Players'];
        for (let i = 0; i < playersList.length; ++i) {
          const playerJson = playersList[i];
          if ('ProfileHId' in playerJson) { playerJson['ProfileName'] = await getProfileName(playerJson['ProfileHId']); }
        }
      }

      resolve(matchSetupJson);
    }
    catch (error) { console.error(error); reject(error); }
  })
}

/**
 * Get all the Match Ids with Setup from the Miscellaneous DynamoDb table
 */
export const getMatchSetupList = () => {
  return new Promise(async function (resolve, reject) {
    try {
      const matchIdList = (await dynamoDbGetItem(DYNAMODB_TABLENAMES.MISCELLANEOUS, MISC_KEYS.MATCH_SETUP_IDS,))['MatchSetupIdList'];
      resolve(matchIdList);
    }
    catch (error) { console.error(error); reject(error); }
  })
}

/**
 * POST new MatchId and initializes its Setup
 * @param {string} matchId      Match Id (string)
 * @param {string} tournamentId ID of Tournament (number)
 * @param {boolean} invalidFlag 
 */
export const postMatchNewSetup = (matchId, tournamentId, invalidFlag) => {
  return new Promise(async function (resolve, reject) {
    try {
      const tournamentInfoObject = await getTournamentInfo(tournamentId);
      const seasonId = tournamentInfoObject.SeasonPId;

      // Make sure matchId is a valid value
      if (!(/^\d+$/.test(matchId))) {
        resolve({
          'MatchId': matchId,
          'Error': `Match ID ${matchId} is not a valid string.`,
        });
        return;
      }
      // Check if matchId already exists
      if (await dynamoDbGetItem('Matches', matchId)) {
        resolve({
          'MatchId': matchId,
          'Error': `Match ID ${matchId} already exists.`,
        });
        return;
      }
      // Check if seasonId exists
      if (!(await dynamoDbGetItem('Tournament', tournamentId))) {
        resolve({
          'MatchId': matchId,
          'Error': `Tournament ID ${tournamentId} doesn't exists.`,
        });
        return;
      }
      // Check if tournamentId exists
      if (!(await dynamoDbGetItem('Season', seasonId))) {
        resolve({
          'MatchId': matchId,
          'Error': `Season ID ${seasonId} doesn't exists.`,
        });
        return;
      }

      // Get data from Riot API
      const matchDataRiotJson = (await getRiotMatchData(matchId))['Data'];

      const setupObject = {}
      setupObject['Invalid'] = invalidFlag;
      setupObject['RiotMatchId'] = matchId;
      setupObject['SeasonPId'] = seasonId;
      setupObject['TournamentPId'] = tournamentId;
      setupObject['Teams'] = {}
      setupObject['Teams']['BlueTeam'] = {}
      setupObject['Teams']['BlueTeam']['TeamName'] = '';
      setupObject['Teams']['RedTeam'] = {}
      setupObject['Teams']['RedTeam']['TeamName'] = '';
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
      const newBluePlayerList = [];
      const newRedPlayerList = [];
      for (let playerIdx = 0; playerIdx < matchDataRiotJson['participants'].length; ++playerIdx) {
        const newPlayerObject = {}
        const playerRiotJson = matchDataRiotJson['participants'][playerIdx];
        newPlayerObject['ProfileName'] = '';
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

      // https://stackoverflow.com/questions/13304543/javascript-sort-array-based-on-another-array
      const roleSortList = ["Top", "Jungle", "Middle", "Bottom", "Support"];
      const sortRoles = (a, b) => {
        return roleSortList.indexOf(a.Role) - roleSortList.indexOf(b.Role);
      }
      setupObject['Teams']['BlueTeam']['Players'] = newBluePlayerList.sort(sortRoles);
      setupObject['Teams']['RedTeam']['Players'] = newRedPlayerList.sort(sortRoles);

      // Push into 'Matches' DynamoDb
      await dynamoDbUpdateItem('Matches', matchId,
        'SET #setup = :obj',
        {
          '#setup': 'Setup',
        },
        {
          ':obj': setupObject,
        }
      );

      // Push into Miscellaneous DynamoDb
      const setupIdList = await getMatchSetupList();
      setupIdList.push(matchId)
      const newDbItem = {
        Key: MISC_KEYS.MATCH_SETUP_IDS,
        MatchSetupIdList: setupIdList
      };
      await dynamoDbPutItem(DYNAMODB_TABLENAMES.MISCELLANEOUS, newDbItem, MISC_KEYS.MATCH_SETUP_IDS,);

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
//     "matchId": "3779688658",
//     "teams": // Setup Object
// }
export const putMatchSaveSetup = (matchId, bodyTeamsObject) => {
  return new Promise(function (resolve, reject) {
    const payloadBlueTeam = bodyTeamsObject.BlueTeam;
    const payloadRedTeam = bodyTeamsObject.RedTeam;
    const payloadBluePlayersList = payloadBlueTeam.Players;
    const payloadRedPlayersList = payloadRedTeam.Players;

    const transformTeamsObject = (color, editedTeamObject) => {
      for (let i = 0; i < editedTeamObject[`${color}Team`]['Players'].length; ++i) {
        const playerObject = editedTeamObject[`${color}Team`]['Players'][i];
        const payloadColorPlayersList = (color === 'Blue') ? payloadBluePlayersList : payloadRedPlayersList;
        playerObject['Role'] = payloadColorPlayersList[i]['Role'];
        playerObject['ProfileName'] = payloadColorPlayersList[i]['ProfileName'];
      }
    }

    dynamoDbGetItem('Matches', matchId).then(async (dbMatchObject) => {
      if (!dbMatchObject || !('Setup' in dbMatchObject)) { resolve(null); return; } // Not Found
      const newTeamsObject = dbMatchObject['Setup']['Teams'];
      newTeamsObject['BlueTeam']['TeamName'] = payloadBlueTeam.TeamName;
      newTeamsObject['RedTeam']['TeamName'] = payloadRedTeam.TeamName;
      newTeamsObject['BlueTeam']['Bans'] = payloadBlueTeam.Bans;
      newTeamsObject['RedTeam']['Bans'] = payloadRedTeam.Bans;
      transformTeamsObject('Blue', newTeamsObject);
      transformTeamsObject('Red', newTeamsObject);

      // Update to DynamoDb
      await dynamoDbUpdateItem('Matches', matchId,
        'SET #setup.#teams = :obj',
        {
          '#setup': 'Setup',
          '#teams': 'Teams',
        },
        {
          ':obj': newTeamsObject
        }
      );

      resolve({
        response: `Setup object successfully updated for Match ID '${matchId}'.`,
        objectUpdated: newTeamsObject,
      });
    }).catch((error) => { console.error(error); reject(error); });
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
export const putMatchPlayerFix = (playersToFix, matchId) => {
  return new Promise(function (resolve, reject) {
    checkRdsStatus().then((status) => {
      if (status !== AWS_RDS_STATUS.AVAILABLE) {
        resolve({ error: `AWS Rds Instance not available.` });
        return;
      }
      getMatchData(matchId).then(async (data) => {
        if (!data) { resolve({ error: `Match ID '${matchId}' Not Found` }); return; } // Not found
        let changesMade = false;
        let seasonId = data['SeasonPId'];
        let namesChanged = [];
        for (let tIdx = 0; tIdx < Object.keys(data.Teams).length; ++tIdx) {
          let teamId = Object.keys(data.Teams)[tIdx];
          let thisTeamPId = getTeamPIdFromHash(data.Teams[teamId]['TeamHId']);
          let { Players } = data.Teams[teamId];
          for (let pIdx = 0; pIdx < Object.values(Players).length; ++pIdx) {
            let playerObject = Object.values(Players)[pIdx];
            let thisProfilePId = getProfilePIdFromHash(playerObject['ProfileHId']);
            let champId = playerObject['ChampId'].toString();
            if (champId in playersToFix && playersToFix[champId] !== thisProfilePId) {
              let newProfilePId = playersToFix[champId];
              let name = await getProfileName(newProfilePId, false); // For PId
              //await getProfileName(newProfileId); // For HId
              if (!name) { resolve({ error: `Profile ID '${newProfilePId}' in body object Not Found` }); return; } // Not found
              namesChanged.push(name); // For response
              await mySqlCallSProc('updatePlayerIdByChampIdMatchId', newProfilePId, champId, matchId);
              playerObject['ProfileHId'] = getProfileHashId(newProfilePId);
              delete playerObject['ProfileName']; // In the database for no reason

              // Remove from Profile GameLog in former Profile Id and Team GameLog
              let profileGameLog = await getProfileGamesBySeason(thisProfilePId, seasonId);
              if (matchId in profileGameLog['Matches']) {
                delete profileGameLog['Matches'][matchId];
                await dynamoDbUpdateItem('Profile', thisProfilePId,
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
                await dynamoDbUpdateItem('Team', thisTeamPId,
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
          await dynamoDbUpdateItem('Matches', matchId,
            'SET #teams = :data',
            {
              '#teams': 'Teams',
            },
            {
              ':data': data.Teams,
            }
          );
          // Delete match cache
          cache.del(`${CACHE_KEYS.MATCH_PREFIX}${matchId}`);

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
    }).catch((error) => { console.error(error); reject(error); });
  });
}

/**
 * Removes the specific Match item from from DynamoDb. 
 * Also remove if it's just a 'Setup' 
 * @param {string} matchId      Match Id in string format
 */
export const deleteMatchData = (matchId) => {
  return new Promise((resolve, reject) => {
    dynamoDbGetItem('Matches', matchId).then(async (matchData) => {
      // 1) Remove and update Game Logs from EACH Profile Table
      // 2) Remove and update Game Logs from EACH Team Table
      // 3) Remove from Match Table
      // 4) Remove from MySQL
      if (!matchData) {
        resolve({ error: `Match Id '${matchId} Not Found.` });
        return;
      } // Not found

      // Check if it's just a Setup Match table.
      const setupFlag = !!matchData.Setup;
      if (matchData.Setup) {
        // Remove from Miscellaneous Table
        let setupIdList = await getMatchSetupList();
        setupIdList = setupIdList.filter(id => id !== matchId);
        const newDbItem = {
          Key: MISC_KEYS.MATCH_SETUP_IDS,
          MatchSetupIdList: setupIdList
        };
        await dynamoDbPutItem(DYNAMODB_TABLENAMES.MISCELLANEOUS, newDbItem, MISC_KEYS.MATCH_SETUP_IDS);

        // 3) 
        await dynamoDbDeleteItem('Matches', matchId);
        resolve({
          setup: setupFlag,
          response: `Match ID '${matchId}' removed from the database.`
        });
      }
      else {
        checkRdsStatus().then(async (status) => {
          if (status !== AWS_RDS_STATUS.AVAILABLE) {
            resolve({ error: `AWS Rds Instance not available.` });
            return;
          }
          const seasonPId = matchData['SeasonPId'];
          const { Teams } = matchData;
          for (const teamObject of Object.values(Teams)) {
            const teamPId = getTeamPIdFromHash(teamObject['TeamHId']);
            const teamSeasonGameLog = (await dynamoDbGetItem('Team', teamPId))['GameLog'][seasonPId]['Matches'];
            delete teamSeasonGameLog[matchId];
            const { Players } = teamObject;
            for (const playerObject of Object.values(Players)) {
              const profilePId = getProfilePIdFromHash(playerObject['ProfileHId']);
              const playerSeasonGameLog = (await dynamoDbGetItem('Profile', profilePId))['GameLog'][seasonPId]['Matches'];
              delete playerSeasonGameLog[matchId];
              // 1)
              await dynamoDbUpdateItem('Profile', profilePId,
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
            await dynamoDbUpdateItem('Team', teamPId,
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
          await dynamoDbDeleteItem('Matches', matchId);

          // 4) 
          await mySqlCallSProc('removeMatchByMatchId', parseInt(matchId));

          // Del from Cache
          cache.del(`${CACHE_KEYS.MATCH_PREFIX}${matchId}`);
          resolve({
            setup: setupFlag,
            response: `Match ID '${matchId}' removed from the database.`
          });
        }).catch((error) => { console.error(error); reject(error); });
      }
    }).catch((error) => { console.error(error); reject(error); });
  });
}

/**
 * Invalidate the match
 * @param {string} matchId      
 */
export const invalidateMatch = (matchId) => {
  return new Promise((resolve, reject) => {
    checkRdsStatus().then((status) => {
      if (status !== AWS_RDS_STATUS.AVAILABLE) {
        resolve({ error: `AWS Rds Instance not available.` });
        return;
      }
      getMatchData(matchId).then(async (matchObject) => {
        if (!matchObject) { resolve({ error: `Match ID '${matchId}' Not Found` }); return; } // Not found
        matchObject.Invalid = true;

        // MySQL
        await mySqlCallSProc('matchInvalidate', matchId);

        // DynamoDb
        await dynamoDbPutItem('Matches', matchObject, matchId);

        resolve({
          message: `Match invalidated.`,
          matchId: matchId,
        });
      }).catch((error) => { console.error(error); reject(error); });
    }).catch((error) => { console.error(error); reject(error); });
  });
}