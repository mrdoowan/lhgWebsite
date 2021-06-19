/*  Declaring npm modules */
const redis = require('redis');

/*  Import dependency modules */
import {
  filterName,
  getProfileHashId,
  getTeamPIdFromHash,
  getTeamHashId,
  getSeasonItems,
  getTourneyItems,
  generateNewPId,
  GLOBAL_CONSTS,
} from './dependencies/global';
import {
  dynamoDbGetItem,
  dynamoDbUpdateItem,
  dynamoDbPutItem,
  dynamoDbDeleteItem,
} from './dependencies/dynamoDbHelper';
import { mySqlCallSProc } from './dependencies/mySqlHelper';
import { CACHE_KEYS } from './dependencies/cacheKeys'
/*  Import data functions */
import {
  getSeasonName,
  getSeasonShortName,
  getSeasonTime,
} from './seasonData';
import {
  getTournamentName,
  getTournamentShortName
} from './tournamentData';
import { getProfileName } from './profileData';

const cache = (process.env.NODE_ENV === 'production') ? redis.createClient(process.env.REDIS_URL) : redis.createClient(process.env.REDIS_PORT);

/**
 * Get the TeamPId of its Name from DynamoDb
 * @param {string} name       Team's name
 */
// Get TeamPId from TeamName
export const getTeamPIdByName = (name) => {
  return new Promise(function (resolve, reject) {
    if (!name) { resolve(null); return; }
    const simpleName = filterName(name);
    const cacheKey = CACHE_KEYS.TEAM_PID_PREFIX + simpleName;
    cache.get(cacheKey, (err, data) => {
      if (err) { console.error(err); reject(err); return; }
      else if (data != null) { resolve(data); return; }
      dynamoDbGetItem('TeamNameMap', simpleName)
        .then((obj) => {
          if (obj == null) { resolve(null); return; } // Not Found
          const teamPId = getTeamPIdFromHash(obj['TeamHId']);
          cache.set(cacheKey, teamPId, 'EX', GLOBAL_CONSTS.TTL_DURATION);
          resolve(teamPId);
        }).catch((ex) => { console.error(ex); reject(ex) });
    });
  });
}

/**
 * 
 * @param {array} teamNameList 
 */
export const getTeamPIdListFromNames = (teamNameList) => {
  return new Promise(async (resolve, reject) => {
    try {
      const errorList = [];
      const teamPIdList = [];
      for (const teamName of teamNameList) {
        const teamPId = await getTeamPIdByName(teamName);
        if (!teamPId) {
          errorList.push(`${teamName} - Team name does not exist.`);
        }
        else if (teamPIdList.includes(teamPId)) {
          errorList.push(`${teamName} - Duplicate names.`);
        }
        else {
          teamPIdList.push(teamPId);
        }
      }

      if (errorList.length > 0) {
        resolve({ errorList: errorList });
      }
      else {
        resolve({ data: teamPIdList });
      }
    }
    catch (err) { reject(err); }
  });
}

/**
 * Get the TeamName of its hash ID from DynamoDb
 * @param {string} teamHId       Team's hash
 */
// Get TeamName from DynamoDb
export const getTeamName = (teamHId) => {
  return new Promise(function (resolve, reject) {
    if (!teamHId) { resolve(null); return; }
    const teamPId = getTeamPIdFromHash(teamHId);
    const cacheKey = CACHE_KEYS.TEAM_NAME_PREFIX + teamPId;
    cache.get(cacheKey, (err, data) => {
      if (err) { console.error(err); reject(err); return; }
      else if (data != null) { resolve(data); return; }
      dynamoDbGetItem('Team', teamPId)
        .then((obj) => {
          if (obj == null) { resolve(null); return; } // Not Found
          const name = obj['TeamName'];
          cache.set(cacheKey, name, 'EX', GLOBAL_CONSTS.TTL_DURATION);
          resolve(name);
        }).catch((ex) => { console.error(ex); reject(ex); });
    });
  });
}

/**
 * Get the TeamShortName of its hash ID from DynamoDb
 * @param {string} teamHId       Team's hash
 */
// Get Shortname from DynamoDb
export const getTeamShortName = (teamHId) => {
  return new Promise(function (resolve, reject) {
    if (!teamHId) { resolve(null); return; }
    const teamPId = getTeamPIdFromHash(teamHId);
    const cacheKey = CACHE_KEYS.TEAM_SHORTNAME_PREFIX + teamPId;
    cache.get(cacheKey, (err, data) => {
      if (err) { console.error(err); reject(err); return; }
      else if (data != null) { resolve(data); return; }
      dynamoDbGetItem('Team', teamPId)
        .then((obj) => {
          if (obj == null) { resolve(null); return; } // Not Found
          const shortName = obj['Information']['TeamShortName'];
          cache.set(cacheKey, shortName, 'EX', GLOBAL_CONSTS.TTL_DURATION);
          resolve(shortName);
        }).catch((ex) => { console.error(ex); reject(ex); });
    });
  });
}

export const getTeamInfo = (teamPId) => {
  return new Promise(function (resolve, reject) {
    if (!teamPId) { resolve(null); return; }
    const cacheKey = CACHE_KEYS.TEAM_INFO_PREFIX + teamPId;
    cache.get(cacheKey, async (err, data) => {
      if (err) { console(err); reject(err); return; }
      else if (data != null) { resolve(JSON.parse(data)); return; }
      try {
        let teamInfoJson = (await dynamoDbGetItem('Team', teamPId))['Information'];
        if (teamInfoJson != null) {
          if ('TrophyCase' in teamInfoJson) {
            for (let i = 0; i < Object.keys(teamInfoJson['TrophyCase']).length; ++i) {
              let sPId = Object.keys(teamInfoJson['TrophyCase'])[i];
              teamInfoJson['TrophyCase'][sPId]['Seasonname'] = getSeasonName(sPId);
              teamInfoJson['TrophyCase'][sPId]['SeasonShortName'] = getSeasonShortName(sPId);
            }
          }
          // Add Season List
          let gameLogJson = (await dynamoDbGetItem('Team', teamPId))['GameLog'];
          if (gameLogJson != null) {
            teamInfoJson['SeasonList'] = await getSeasonItems(Object.keys(gameLogJson));
          }
          // Add Tournament List
          let statsLogJson = (await dynamoDbGetItem('Team', teamPId))['StatsLog'];
          if (statsLogJson != null) {
            teamInfoJson['TournamentList'] = await getTourneyItems(Object.keys(statsLogJson));
          }
          cache.set(cacheKey, JSON.stringify(teamInfoJson, null, 2), 'EX', GLOBAL_CONSTS.TTL_DURATION);
          resolve(teamInfoJson);
        }
        else {
          resolve({});    // If 'Information' does not exist
        }
      }
      catch (ex) { console.error(ex); reject(ex); }
    });
  });
}

/**
 * 
 * @param {string} teamPId      Team Id (Assume this is valid)
 * @param {number} sPId         Season Id number
 */
export const getTeamScoutingBySeason = (teamPId, sPId = null) => {
  return new Promise(function (resolve, reject) {
    if (!teamPId) { resolve(null); return; }
    dynamoDbGetItem('Team', teamPId).then((teamObject) => {
      if (teamObject && 'Scouting' in teamObject) {
        const scoutingJson = teamObject['Scouting'];
        const seasonId = (sPId) ? sPId : (Math.max(...Object.keys(scoutingJson)));    // if season parameter Id is null, find latest
        const cacheKey = CACHE_KEYS.TEAM_SCOUT_PREFIX + teamPId + '-' + seasonId;

        cache.get(cacheKey, async (err, data) => {
          if (err) { console(err); reject(err); return; }
          else if (data != null) { resolve(JSON.parse(data)); return; }
          const teamScoutingSeasonJson = scoutingJson[seasonId];
          if (teamScoutingSeasonJson == null) { resolve(null); return; } // Not Found

          // Process Data
          teamScoutingSeasonJson['SeasonTime'] = await getSeasonTime(seasonId);
          teamScoutingSeasonJson['SeasonName'] = await getSeasonName(seasonId);
          teamScoutingSeasonJson['SeasonShortName'] = await getSeasonShortName(seasonId);
          for (let i = 0; i < Object.values(teamScoutingSeasonJson['PlayerLog']).length; ++i) {
            const roleMap = Object.values(teamScoutingSeasonJson['PlayerLog'])[i];
            for (let j = 0; j < Object.keys(roleMap).length; ++j) {
              const profileHId = Object.keys(roleMap)[j];
              const statsJson = roleMap[profileHId];
              statsJson['ProfileName'] = await getProfileName(profileHId);
              statsJson['TotalKdaPlayer'] = (statsJson['TotalDeathsPlayer'] > 0) ? ((statsJson['TotalKillsPlayer'] + statsJson['TotalAssistsPlayer']) / statsJson['TotalDeathsPlayer']).toFixed(2).toString() : "Perfect";
              statsJson['KillPctPlayer'] = (statsJson['TotalKillsTeam'] == 0) ? 0 : ((statsJson['TotalKillsPlayer'] + statsJson['TotalAssistsPlayer']) / statsJson['TotalKillsTeam']).toFixed(4);
              statsJson['DamagePctPlayer'] = (statsJson['TotalDamagePlayer'] / statsJson['TotalDamageTeam']).toFixed(4);
              statsJson['GoldPctPlayer'] = (statsJson['TotalGoldPlayer'] / statsJson['TotalGoldTeam']).toFixed(4);
              statsJson['VsPctPlayer'] = (statsJson['TotalVsPlayer'] / statsJson['TotalVsTeam']).toFixed(4);
            }
          }
          cache.set(cacheKey, JSON.stringify(teamScoutingSeasonJson, null, 2), 'EX', GLOBAL_CONSTS.TTL_DURATION);
          resolve(teamScoutingSeasonJson);
        });
      }
      else {
        if (!sPId) { resolve({}) }   // If 'Scouting' does not exist
        else { resolve(null); }      // Not Found
      }
    }).catch((err) => {
      console.error(err); reject(err);
    });
  });
}

/**
 * 
 * @param {string} teamPId      Team Id (Assume this is valid)
 * @param {number} sPId         Season Id number
 */
export const getTeamGamesBySeason = (teamPId, sPId = null) => {
  return new Promise(function (resolve, reject) {
    if (!teamPId) { resolve(null); return; }
    dynamoDbGetItem('Team', teamPId).then((teamObject) => {
      if (teamObject && 'GameLog' in teamObject) {
        const gameLogJson = teamObject['GameLog'];
        const seasonId = (sPId) ? sPId : (Math.max(...Object.keys(gameLogJson)));    // if season parameter Id is null, find latest
        const cacheKey = CACHE_KEYS.TEAM_GAMES_PREFIX + teamPId + '-' + seasonId;

        cache.get(cacheKey, async (err, data) => {
          if (err) { console(err); reject(err); return; }
          else if (data) { resolve(JSON.parse(data)); return; }
          const teamSeasonGamesJson = gameLogJson[seasonId];
          if (!teamSeasonGamesJson) { resolve(null); return; } // Not Found

          // Process Data
          teamSeasonGamesJson['SeasonTime'] = await getSeasonTime(seasonId);
          teamSeasonGamesJson['SeasonName'] = await getSeasonName(seasonId);
          teamSeasonGamesJson['SeasonShortName'] = await getSeasonShortName(seasonId);
          for (let i = 0; i < Object.values(teamSeasonGamesJson['Matches']).length; ++i) {
            const matchObject = Object.values(teamSeasonGamesJson['Matches'])[i];
            for (let j = 0; j < Object.values(matchObject['ChampPicks']).length; ++j) {
              const champObject = Object.values(matchObject['ChampPicks'])[j];
              champObject['ProfileName'] = await getProfileName(champObject['ProfileHId']);
            }
            matchObject['EnemyTeamName'] = await getTeamName(matchObject['EnemyTeamHId']);
          }
          cache.set(cacheKey, JSON.stringify(teamSeasonGamesJson, null, 2), 'EX', GLOBAL_CONSTS.TTL_DURATION);
          resolve(teamSeasonGamesJson);
        });
      }
      else {
        if (!sPId) { resolve({}); }  // If 'GameLog' does not exist
        else { resolve(null); }             // Not Found
      }
    }).catch((err) => {
      console.error(err); reject(err);
    });
  });
}

/**
 * 
 * @param {string} teamPId      Team Id (Assume this is valid)
 * @param {number} tPId         Tournament Id number
 */
export const getTeamStatsByTourney = (teamPId, tPId = null) => {
  return new Promise(function (resolve, reject) {
    if (!teamPId) { resolve(null); return; }
    dynamoDbGetItem('Team', teamPId).then((teamObject) => {
      if (teamObject && 'StatsLog' in teamObject) {
        const statsLogJson = teamObject['StatsLog'];
        const tourneyId = (tPId) ? tPId : (Math.max(...Object.keys(statsLogJson)));    // if tourney parameter Id is null, find latest
        const cacheKey = CACHE_KEYS.TEAM_STATS_PREFIX + teamPId + '-' + tourneyId;

        cache.get(cacheKey, async (err, data) => {
          if (err) { console(err); reject(err); return; }
          else if (data) { resolve(JSON.parse(data)); return; }
          const tourneyStatsJson = statsLogJson[tourneyId];
          if (!tourneyStatsJson) { resolve(null); return; } // Not Found

          // Process Data
          tourneyStatsJson['TournamentName'] = await getTournamentName(tourneyId);
          tourneyStatsJson['TournamentShortName'] = await getTournamentShortName(tourneyId);
          const totalGameDurationMinute = tourneyStatsJson['TotalGameDuration'] / 60;
          tourneyStatsJson['GamesPlayedOnRed'] = tourneyStatsJson['GamesPlayed'] - tourneyStatsJson['GamesPlayedOnBlue'];
          tourneyStatsJson['RedWins'] = tourneyStatsJson['GamesWon'] - tourneyStatsJson['BlueWins'];
          tourneyStatsJson['AverageGameDuration'] = (tourneyStatsJson['TotalGameDuration'] / tourneyStatsJson['GamesPlayed']).toFixed(2);
          tourneyStatsJson['AverageKills'] = (tourneyStatsJson['TotalKills'] / tourneyStatsJson['GamesPlayed']).toFixed(1);
          tourneyStatsJson['AverageDeaths'] = (tourneyStatsJson['TotalDeaths'] / tourneyStatsJson['GamesPlayed']).toFixed(1);
          tourneyStatsJson['KillDeathRatio'] = (tourneyStatsJson['TotalDeaths'] > 0) ? (tourneyStatsJson['TotalKills'] / tourneyStatsJson['TotalDeaths']).toFixed(2).toString() : "Perfect";
          tourneyStatsJson['AverageAssists'] = (tourneyStatsJson['TotalAssists'] / tourneyStatsJson['GamesPlayed']).toFixed(1);
          tourneyStatsJson['GoldPerMinute'] = (tourneyStatsJson['TotalGold'] / totalGameDurationMinute).toFixed(2);
          tourneyStatsJson['DamagePerMinute'] = (tourneyStatsJson['TotalDamageDealt'] / totalGameDurationMinute).toFixed(2);
          tourneyStatsJson['CreepScorePerMinute'] = (tourneyStatsJson['TotalCreepScore'] / totalGameDurationMinute).toFixed(2);
          tourneyStatsJson['VisionScorePerMinute'] = (tourneyStatsJson['TotalVisionScore'] / totalGameDurationMinute).toFixed(2);
          tourneyStatsJson['WardsPerMinute'] = (tourneyStatsJson['TotalWardsPlaced'] / totalGameDurationMinute).toFixed(2);
          tourneyStatsJson['ControlWardsPerMinute'] = (tourneyStatsJson['TotalControlWardsBought'] / totalGameDurationMinute).toFixed(2);
          tourneyStatsJson['WardsClearedPerMinute'] = (tourneyStatsJson['TotalWardsCleared'] / totalGameDurationMinute).toFixed(2);
          tourneyStatsJson['AverageTowersTaken'] = (tourneyStatsJson['TotalTowersTaken'] / tourneyStatsJson['GamesPlayed']).toFixed(1);
          tourneyStatsJson['AverageTowersLost'] = (tourneyStatsJson['TotalTowersLost'] / tourneyStatsJson['GamesPlayed']).toFixed(1);
          tourneyStatsJson['FirstBloodPct'] = (tourneyStatsJson['TotalFirstBloods'] / tourneyStatsJson['GamesPlayed']).toFixed(4);
          tourneyStatsJson['FirstTowerPct'] = (tourneyStatsJson['TotalFirstTowers'] / tourneyStatsJson['GamesPlayed']).toFixed(4);
          tourneyStatsJson['AverageDragonsTaken'] = (tourneyStatsJson['TotalDragonsTaken'] / tourneyStatsJson['GamesPlayed']).toFixed(1);
          tourneyStatsJson['DragonPct'] = (tourneyStatsJson['TotalDragonsTaken'] / (tourneyStatsJson['TotalDragonsTaken'] + tourneyStatsJson['TotalEnemyDragons'])).toFixed(4);
          tourneyStatsJson['AverageHeraldsTaken'] = (tourneyStatsJson['TotalHeraldsTaken'] / tourneyStatsJson['GamesPlayed']).toFixed(1);
          tourneyStatsJson['HeraldPct'] = (tourneyStatsJson['TotalHeraldsTaken'] / (tourneyStatsJson['TotalHeraldsTaken'] + tourneyStatsJson['TotalEnemyHeralds'])).toFixed(4);
          tourneyStatsJson['AverageBaronsTaken'] = (tourneyStatsJson['TotalBaronsTaken'] / tourneyStatsJson['GamesPlayed']).toFixed(1);
          tourneyStatsJson['BaronPct'] = (tourneyStatsJson['TotalBaronsTaken'] / (tourneyStatsJson['TotalBaronsTaken'] + tourneyStatsJson['TotalEnemyBarons'])).toFixed(4);
          tourneyStatsJson['WardsClearedPct'] = (tourneyStatsJson['TotalWardsCleared'] / tourneyStatsJson['TotalEnemyWardsPlaced']).toFixed(4);
          tourneyStatsJson['AverageXpDiffEarly'] = (!tourneyStatsJson['GamesPlayedOverEarly']) ? '' : (tourneyStatsJson['TotalXpDiffEarly'] / tourneyStatsJson['GamesPlayedOverEarly']).toFixed(1);
          tourneyStatsJson['AverageXpDiffMid'] = (!tourneyStatsJson['GamesPlayedOverMid']) ? '' : (tourneyStatsJson['TotalXpDiffMid'] / tourneyStatsJson['GamesPlayedOverMid']).toFixed(1);
          const avgGoldDiffEarlyFloat = tourneyStatsJson['TotalGoldDiffEarly'] / tourneyStatsJson['GamesPlayedOverEarly'];
          const avgGoldDiffMidFloat = tourneyStatsJson['TotalGoldDiffMid'] / tourneyStatsJson['GamesPlayedOverMid'];
          tourneyStatsJson['AverageGoldDiffEarly'] = (!tourneyStatsJson['GamesPlayedOverEarly']) ? '' : avgGoldDiffEarlyFloat.toFixed(1);
          tourneyStatsJson['AverageGoldDiffMid'] = (!tourneyStatsJson['GamesPlayedOverMid']) ? '' : avgGoldDiffMidFloat.toFixed(1);
          tourneyStatsJson['AverageTeamGoldDiffEarlyToMid'] = (!tourneyStatsJson['GamesPlayedOverMid']) ? '' : (avgGoldDiffMidFloat - avgGoldDiffEarlyFloat).toFixed(1);
          tourneyStatsJson['AverageCsDiffEarly'] = (!tourneyStatsJson['GamesPlayedOverEarly']) ? '' : (tourneyStatsJson['TotalCsDiffEarly'] / tourneyStatsJson['GamesPlayedOverEarly']).toFixed(1);
          tourneyStatsJson['AverageCsDiffMid'] = (!tourneyStatsJson['GamesPlayedOverMid']) ? '' : (tourneyStatsJson['TotalCsDiffMid'] / tourneyStatsJson['GamesPlayedOverMid']).toFixed(1);
          tourneyStatsJson['AverageTeamKillsEarly'] = (!tourneyStatsJson['GamesPlayedOverEarly']) ? '' : (tourneyStatsJson['TotalTeamKillsAtEarly'] / tourneyStatsJson['GamesPlayedOverEarly']).toFixed(2);
          tourneyStatsJson['AverageTeamKillsMid'] = (!tourneyStatsJson['GamesPlayedOverMid']) ? '' : (tourneyStatsJson['TotalTeamKillsAtMid'] / tourneyStatsJson['GamesPlayedOverMid']).toFixed(2);
          cache.set(cacheKey, JSON.stringify(tourneyStatsJson, null, 2), 'EX', GLOBAL_CONSTS.TTL_DURATION);
          resolve(tourneyStatsJson);
        });
      }
      else {
        if (!tPId) { resolve({}); }  // If 'StatsLog' does not exist
        else { resolve(null); } // Not Found
      }
    }).catch((err) => {
      console.error(err); reject(err);
    });
  });
}

// BODY EXAMPLE:
// {
//     "teamName": "NAME",
//     "shortName": "XXX",
// }
/**
 * Add a new team into the DB. Add new Team to "Team", "TeamNameMap"
 * @param {string} teamName 
 * @param {string} shortName    i.e. "TSM"
 */
export const postNewTeam = (teamName, shortName) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Generate new Team PId
      let newPId = await generateNewPId('Team');
      let newTeamItem = {
        'Information': {
          'TeamName': teamName,
          'TeamShortName': shortName,
        },
        'TeamName': teamName,
        'TeamPId': newPId,
      }
      // Add to 'Team' Table
      await dynamoDbPutItem('Team', newTeamItem, newPId);
      // Add to 'TeamNameMap' Table
      let simpleTeamName = filterName(newTeamItem['TeamName']);
      let newTeamMap = {
        'TeamName': simpleTeamName,
        'TeamHId': getTeamHashId(newPId),
      }
      await dynamoDbPutItem('TeamNameMap', newTeamMap, simpleTeamName);

      resolve({
        'TeamName': newTeamItem['TeamName'],
        'TeamPId': newPId,
      });
    }
    catch (err) { console.error(err); reject(err); }
  });
}

/**
 * 
 * @param {*} teamPId 
 * @param {*} newName 
 * @param {*} oldName 
 * @returns 
 */
export const updateTeamName = (teamPId, newName, oldName) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Update "Team" table
      await dynamoDbUpdateItem('Team', teamPId,
        'SET #name = :new, #info.#name = :new',
        {
          '#name': 'TeamName',
          '#info': 'Information',
        },
        {
          ':new': newName,
        }
      );
      // Add newName to "TeamNameMap" table
      await dynamoDbPutItem('TeamNameMap', {
        'TeamName': filterName(newName),
        'TeamHId': getTeamHashId(teamPId),
      }, filterName(newName));
      // Delete oldName from "TeamNameMap" table
      await dynamoDbDeleteItem('TeamNameMap', filterName(oldName));

      // Del Cache
      cache.del(CACHE_KEYS.TEAM_PID_PREFIX + filterName(oldName));
      cache.del(CACHE_KEYS.TEAM_NAME_PREFIX + teamPId);
      cache.del(CACHE_KEYS.TEAM_INFO_PREFIX + teamPId);

      resolve({
        'TeamPId': teamPId,
        'NewProfileName': newName,
        'OldProfileName': oldName,
      });
    }
    catch (err) {
      console.error(err);
      reject(err);
    }
  });
}

/**
 * Doing both "GameLog" and "Scouting" for Team Item
 * @param {string} teamPId 
 * @param {number} tournamentPId 
 */
export const updateTeamGameLog = (teamPId, tournamentPId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const tourneyDbObject = await dynamoDbGetItem('Tournament', tournamentPId);
      const seasonPId = tourneyDbObject['Information']['SeasonPId'];
      const teamDbObject = await dynamoDbGetItem('Team', teamPId);

      /*  
          -------------------
          Init DynamoDB Items
          -------------------
      */
      // #region Init Items
      // Check 'GameLog' exists in TeamItem
      const initTeamSeasonGames = {
        'Matches': {}
      };
      const initTeamGameLog = { [seasonPId]: initTeamSeasonGames };
      if (!('GameLog' in teamDbObject)) {
        await dynamoDbUpdateItem('Team', teamPId,
          'SET #gLog = :val',
          {
            '#gLog': 'GameLog'
          },
          {
            ':val': initTeamGameLog
          }
        );
        teamDbObject['GameLog'] = initTeamGameLog;
      }
      else if (!(seasonPId in teamDbObject['GameLog'])) {
        await dynamoDbUpdateItem('Team', teamPId,
          'SET #gLog.#sId = :val',
          {
            '#gLog': 'GameLog',
            '#sId': seasonPId,
          },
          {
            ':val': initTeamSeasonGames
          }
        );
        teamDbObject['GameLog'][seasonPId] = initTeamSeasonGames;
      }
      // Check 'Scouting' exists in TeamItem 
      const initTeamScouting = { [seasonPId]: {} };
      if (!('Scouting' in teamDbObject)) {
        await dynamoDbUpdateItem('Team', teamPId,
          'SET #sct = :val',
          {
            '#sct': 'Scouting'
          },
          {
            ':val': initTeamScouting
          }
        );
        teamDbObject['Scouting'] = initTeamScouting;
      }
      else if (!(seasonPId in teamDbObject['Scouting'])) {
        teamDbObject['Scouting'][seasonPId] = {};
      }
      // #endregion

      // Shallow Copy: Needed to include both Regular+Playoff games
      const scoutingItem = teamDbObject['Scouting'][seasonPId];
      const gameLogTeamItem = teamDbObject['GameLog'][seasonPId]['Matches'];

      /*  
          -------------
          Game Log
          -------------
      */
      // #region Compile Data
      const teamMatchesSqlListTourney = await mySqlCallSProc('teamMatchesByTournamentPId', teamPId, tournamentPId);
      for (const sqlTeamMatch of teamMatchesSqlListTourney) {
        const matchPId = sqlTeamMatch.riotMatchId;

        // Additional sProcs from MySQL
        const playerStatsSqlList = await mySqlCallSProc('playerStatsByMatchIdTeamId', matchPId, teamPId);
        const bannedChampMatchSqlList = await mySqlCallSProc('bannedChampsByMatchId', matchPId);

        const teamGameItem = {
          'Invalid': sqlTeamMatch.invalid,
          'DatePlayed': sqlTeamMatch.datePlayed,
          'TournamentType': sqlTeamMatch.tournamentType,
          'GameWeekNumber': 0, // N/A
          'ChampPicks': {},
          'Side': sqlTeamMatch.side,
          'Patch': sqlTeamMatch.patch,
          'Win': (sqlTeamMatch.win === 1) ? true : false,
          'EnemyTeamHId': getTeamHashId((sqlTeamMatch.side === 'Blue') ? sqlTeamMatch.redTeamPId : sqlTeamMatch.blueTeamPId),
          'GameDuration': sqlTeamMatch.duration,
          'Kills': sqlTeamMatch.totalKills,
          'Deaths': sqlTeamMatch.totalDeaths,
          'Assists': sqlTeamMatch.totalAssists,
          'GoldPerMinute': sqlTeamMatch.goldPerMin,
          'GoldDiffEarly': sqlTeamMatch.goldDiffEarly,
          'GoldDiffMid': sqlTeamMatch.goldDiffMid,
          'BannedByTeam': [],
          'BannedAgainst': [],
        };
        for (const playerSqlRow of playerStatsSqlList) {
          teamGameItem['ChampPicks'][playerSqlRow.role] = {
            'ProfileHId': getProfileHashId(playerSqlRow.profilePId),
            'ChampId': playerSqlRow.champId,
            'PlayerKills': playerSqlRow.kills,
            'PlayerDeaths': playerSqlRow.deaths,
            'PlayerAssists': playerSqlRow.assists,
            'PlayerGoldDiffEarly': playerSqlRow.goldDiffEarly,
            'PlayerGoldDiffMid': playerSqlRow.goldDiffMid,
          };
        }
        for (const champSqlRow of bannedChampMatchSqlList) {
          if (champSqlRow.teamBannedById == teamPId) { teamGameItem['BannedByTeam'].push(champSqlRow.champId); }
          else { teamGameItem['BannedAgainst'].push(champSqlRow.champId); }
        }
        gameLogTeamItem[matchPId] = teamGameItem;
      }
      // #endregion

      /*  
          -------------
          'Scouting' (Season Id dependent)
          -------------
      */
      // #region Compile Data
      // Banned Champs List
      const sqlTeamSeasonStats = (await mySqlCallSProc('teamStatsBySeasonId', teamPId, seasonPId))[0];
      scoutingItem['Ongoing'] = false;
      scoutingItem['GamesPlayed'] = sqlTeamSeasonStats.gamesPlayed;
      scoutingItem['GamesWin'] = sqlTeamSeasonStats.gamesWin;
      scoutingItem['BannedByTeam'] = {};
      scoutingItem['BannedAgainstTeam'] = {};
      const bannedChampsSeasonSqlList = await mySqlCallSProc('bannedChampsByTeamIdSeasonId', teamPId, seasonPId);
      for (const champSqlRow of bannedChampsSeasonSqlList) {
        if (champSqlRow.teamBannedById == teamPId) {
          if (!(champSqlRow.champId in scoutingItem['BannedByTeam'])) {
            scoutingItem['BannedByTeam'][champSqlRow.champId] = 0;
          }
          scoutingItem['BannedByTeam'][champSqlRow.champId]++;
        }
        else {
          if (!(champSqlRow.champId in scoutingItem['BannedAgainstTeam'])) {
            scoutingItem['BannedAgainstTeam'][champSqlRow.champId] = 0;
          }
          scoutingItem['BannedAgainstTeam'][champSqlRow.champId]++;
        }
      }
      // Player Log
      const playerScoutingSqlList = await mySqlCallSProc('playerStatsTotalByTeamIdSeasonId', teamPId, seasonPId);
      const playerLog = {};
      for (const playerSqlRow of playerScoutingSqlList) {
        const role = playerSqlRow.playerRole;
        if (!(role in playerLog)) {
          playerLog[role] = {};
        }
        const { profilePId } = playerSqlRow;
        const profileHId = getProfileHashId(profilePId);
        if (!(profileHId in playerLog[role])) {
          // New entry
          playerLog[role][profileHId] = {
            'GamesPlayed': playerSqlRow.gamesPlayed,
            'TotalKillsPlayer': playerSqlRow.totalKills,
            'TotalDeathsPlayer': playerSqlRow.totalDeaths,
            'TotalAssistsPlayer': playerSqlRow.totalAssists,
            'TotalDamagePlayer': playerSqlRow.totalDamage,
            'TotalGoldPlayer': playerSqlRow.totalGold,
            'TotalVsPlayer': playerSqlRow.totalVisionScore,
            'TotalKillsTeam': playerSqlRow.totalTeamKills,
            'TotalDamageTeam': playerSqlRow.totalTeamDamage,
            'TotalGoldTeam': playerSqlRow.totalTeamGold,
            'TotalVsTeam': playerSqlRow.totalTeamVisionScore,
            'ChampsPlayed': {}
          };
        }
        const champStatsSqlList = await mySqlCallSProc('champStatsByProfileIdTeamIdRoleSeasonId', profilePId, teamPId, role, seasonPId, GLOBAL_CONSTS.MINUTE_AT_EARLY, GLOBAL_CONSTS.MINUTE_AT_MID);
        const champsPlayed = playerLog[role][profileHId]['ChampsPlayed'];
        for (const champStats of champStatsSqlList) {
          const { champId } = champStats;
          champsPlayed[champId] = {};
          champsPlayed[champId]['GamesPlayed'] = champStats.gamesPlayed;
          champsPlayed[champId]['GamesWon'] = champStats.gamesWin;
          champsPlayed[champId]['TotalKills'] = champStats.totalKills;
          champsPlayed[champId]['TotalDeaths'] = champStats.totalDeaths;
          champsPlayed[champId]['TotalAssists'] = champStats.totalAssists;
          champsPlayed[champId]['TotalDuration'] = champStats.totalDuration;
          champsPlayed[champId]['TotalGold'] = champStats.totalGold;
          champsPlayed[champId]['TotalCreepScore'] = champStats.totalCreepScore;
          champsPlayed[champId]['TotalVisionScore'] = champStats.totalVisionScore;
          champsPlayed[champId]['GamesPlayedEarly'] = champStats.gamesPlayedOverEarly;
          champsPlayed[champId]['GamesPlayedMid'] = champStats.gamesPlayedOverMid;
          champsPlayed[champId]['TotalGoldDiffEarly'] = champStats.totalGoldDiffEarly;
          champsPlayed[champId]['TotalGoldDiffMid'] = champStats.totalGoldDiffMid;
        }
      }
      scoutingItem['PlayerLog'] = playerLog;
      // #endregion

      /*  
          ----------
          Push into DB
          ----------
      */
      await dynamoDbUpdateItem('Team', teamPId,
        'SET #gLog.#sId.#mtchs = :val',
        {
          '#gLog': 'GameLog',
          '#sId': seasonPId,
          '#mtchs': 'Matches'
        },
        {
          ':val': gameLogTeamItem
        }
      );
      await dynamoDbUpdateItem('Team', teamPId,
        'SET #scout.#sId = :val',
        {
          '#scout': 'Scouting',
          '#sId': seasonPId
        },
        {
          ':val': scoutingItem
        }
      );
      // Remove cache
      cache.del(CACHE_KEYS.TEAM_GAMES_PREFIX + teamPId + '-' + seasonPId);
      cache.del(CACHE_KEYS.TEAM_SCOUT_PREFIX + teamPId + '-' + seasonPId);

      resolve({
        teamId: teamPId,
        tournamentId: tournamentPId,
        seasonId: seasonPId,
        numberMatches: teamMatchesSqlListTourney.length,
        typeUpdated: 'GameLog',
      });
    }
    catch (err) { reject({ error: err }) }
  });
}

/**
 * Update the team's Stats Log
 * @param {string} teamPId 
 * @param {number} tournamentPId 
 */
export const updateTeamStatsLog = (teamPId, tournamentPId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const teamDbObject = await dynamoDbGetItem('Team', teamPId);

      /*  
          -------------------
          Init DynamoDB Items
          -------------------
      */
      // #region Init items
      // Check 'StatsLog' exists in TeamItem
      const initTeamStatsLog = { [tournamentPId]: {} };
      if (!('StatsLog' in teamDbObject)) {
        await dynamoDbUpdateItem('Team', teamPId,
          'SET #sLog = :val',
          {
            '#sLog': 'StatsLog'
          },
          {
            ':val': initTeamStatsLog
          }
        );
        teamDbObject['StatsLog'] = initTeamStatsLog;
      }
      // Check if that tournamentId in StatsLog
      else if (!(tournamentPId in teamDbObject['StatsLog'])) {
        teamDbObject['StatsLog'][tournamentPId] = {};
      }
      //#endregion

      /*  
          -------------
          'StatsLog' (TournamentId dependent)
          -------------
      */
      // #region Compile Data
      const tourneyTeamStatsItem = {};
      const sqlTeamStatsTotal = (await mySqlCallSProc('teamStatsTotalByTournamentPId', teamPId, tournamentPId, GLOBAL_CONSTS.MINUTE_AT_EARLY, GLOBAL_CONSTS.MINUTE_AT_MID))[0];
      tourneyTeamStatsItem['GamesPlayed'] = sqlTeamStatsTotal.gamesPlayed;
      tourneyTeamStatsItem['GamesPlayedOverEarly'] = sqlTeamStatsTotal.gamesPlayedOverEarly;
      tourneyTeamStatsItem['GamesPlayedOverMid'] = sqlTeamStatsTotal.gamesPlayedOverMid;
      tourneyTeamStatsItem['GamesWon'] = sqlTeamStatsTotal.totalWins;
      tourneyTeamStatsItem['GamesPlayedOnBlue'] = sqlTeamStatsTotal.gamesPlayedOnBlue;
      tourneyTeamStatsItem['BlueWins'] = sqlTeamStatsTotal.totalBlueWins;
      tourneyTeamStatsItem['TotalGameDuration'] = sqlTeamStatsTotal.totalDuration;
      tourneyTeamStatsItem['TotalXpDiffEarly'] = sqlTeamStatsTotal.totalXpDiffEarly;
      tourneyTeamStatsItem['TotalXpDiffMid'] = sqlTeamStatsTotal.totalXpDiffMid;
      tourneyTeamStatsItem['TotalGold'] = sqlTeamStatsTotal.totalGold;
      tourneyTeamStatsItem['TotalGoldDiffEarly'] = sqlTeamStatsTotal.totalGoldDiffEarly;
      tourneyTeamStatsItem['TotalGoldDiffMid'] = sqlTeamStatsTotal.totalGoldDiffMid;
      tourneyTeamStatsItem['TotalCreepScore'] = sqlTeamStatsTotal.totalCreepScore;
      tourneyTeamStatsItem['TotalCsDiffEarly'] = sqlTeamStatsTotal.totalCsDiffEarly;
      tourneyTeamStatsItem['TotalCsDiffMid'] = sqlTeamStatsTotal.totalCsDiffMid;
      tourneyTeamStatsItem['TotalDamageDealt'] = sqlTeamStatsTotal.totalDamageDealt;
      tourneyTeamStatsItem['TotalFirstBloods'] = sqlTeamStatsTotal.totalFirstBloods;
      tourneyTeamStatsItem['TotalFirstTowers'] = sqlTeamStatsTotal.totalFirstTowers;
      tourneyTeamStatsItem['TotalKills'] = sqlTeamStatsTotal.totalKills;
      tourneyTeamStatsItem['TotalDeaths'] = sqlTeamStatsTotal.totalDeaths;
      tourneyTeamStatsItem['TotalAssists'] = sqlTeamStatsTotal.totalAssists;
      tourneyTeamStatsItem['TotalTeamKillsAtEarly'] = sqlTeamStatsTotal.totalKillsAtEarly;
      tourneyTeamStatsItem['TotalTeamKillsAtMid'] = sqlTeamStatsTotal.totalKillsAtMid;
      tourneyTeamStatsItem['TotalTowersTaken'] = sqlTeamStatsTotal.totalTeamTowers;
      tourneyTeamStatsItem['TotalTowersLost'] = sqlTeamStatsTotal.totalEnemyTowers;
      tourneyTeamStatsItem['TotalDragonsTaken'] = sqlTeamStatsTotal.totalTeamDragons;
      tourneyTeamStatsItem['TotalEnemyDragons'] = sqlTeamStatsTotal.totalEnemyDragons;
      tourneyTeamStatsItem['TotalHeraldsTaken'] = sqlTeamStatsTotal.totalTeamHeralds;
      tourneyTeamStatsItem['TotalEnemyHeralds'] = sqlTeamStatsTotal.totalEnemyHeralds;
      tourneyTeamStatsItem['TotalBaronsTaken'] = sqlTeamStatsTotal.totalTeamBarons;
      tourneyTeamStatsItem['TotalEnemyBarons'] = sqlTeamStatsTotal.totalEnemyBarons;
      tourneyTeamStatsItem['TotalVisionScore'] = sqlTeamStatsTotal.totalVisionScore;
      tourneyTeamStatsItem['TotalWardsPlaced'] = sqlTeamStatsTotal.totalWardsPlaced;
      tourneyTeamStatsItem['TotalControlWardsBought'] = sqlTeamStatsTotal.totalControlWardsBought;
      tourneyTeamStatsItem['TotalWardsCleared'] = sqlTeamStatsTotal.totalWardsCleared;
      tourneyTeamStatsItem['TotalEnemyWardsPlaced'] = sqlTeamStatsTotal.totalEnemyWardsPlaced;
      teamDbObject['StatsLog'][tournamentPId] = tourneyTeamStatsItem;
      // #endregion

      /*  
          ----------
          Push into DB
          ----------
      */
      await dynamoDbUpdateItem('Team', teamPId,
        'SET #sLog.#tId = :val',
        {
          '#sLog': 'StatsLog',
          '#tId': tournamentPId
        },
        {
          ':val': tourneyTeamStatsItem
        }
      );
      // Remove cache
      cache.del(CACHE_KEYS.TEAM_STATS_PREFIX + teamPId + '-' + tournamentPId);

      resolve({
        teamId: teamPId,
        tournamentId: tournamentPId,
        typeUpdated: 'StatsLog',
      })
    }
    catch (err) { reject(err) }
  });
}