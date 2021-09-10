/**
 * This file is for Riot Endpoint MatchV5.
 */

/*  Import dependency modules */
import {
  TEAM_ID,
  MINUTE,
  BARON_DURATION,
} from '../../../services/constants';
import { getDdragonVersion } from '../../../services/miscDynamoDb';
import {
  getProfileHashId,
  getTeamHashId,
  isPatch1LaterThanPatch2
} from '../dependencies/global';
import { 
  getRiotMatchV5Dto, 
  getRiotMatchV5TimelineDto 
} from '../dependencies/riotEndpoints';

/**
 * Creates object tailored for database
 * @param {string} matchId 
 * @param {object} matchSetupObject
 */
export const createDbMatchObject = (matchId, matchSetupObject) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Call Riot API
      console.log(`Processing new match ID: ${matchSetupObject['RiotMatchId']}`);
      const matchTeamsSetupObject = matchSetupObject['Teams'];
      const riotMatchDto = (await getRiotMatchV5Dto(matchId)).info;
      const riotMatchTimelineDto = (await getRiotMatchV5TimelineDto(matchId)).info;

      // ----- 1) Add onto matchObj of profileHId
      const profileObjByChampId = {}
      const bluePlayerArr = matchTeamsSetupObject['BlueTeam']['Players']; // Array
      for (const playerSetupObject of bluePlayerArr) {
        profileObjByChampId[playerSetupObject['ChampId']] = {
          'PId': playerSetupObject.ProfilePId,
          'Role': playerSetupObject.Role,
        };
      }
      const redPlayerArr = matchTeamsSetupObject['RedTeam']['Players']; // Array
      for (const playerSetupObject of redPlayerArr) {
        profileObjByChampId[playerSetupObject['ChampId']] = {
          'PId': playerSetupObject.ProfilePId,
          'Role': playerSetupObject.Role,
        };
      }

      // ----- 2) Create the Match item for DynamoDB
      const matchObject = {};
      matchObject['Invalid'] = matchSetupObject['Invalid'];
      matchObject['MatchPId'] = matchSetupObject['RiotMatchId'];
      matchObject['SeasonPId'] = matchSetupObject['SeasonPId'];
      matchObject['TournamentPId'] = matchSetupObject['TournamentPId'];
      matchObject['DatePlayed'] = riotMatchDto.gameCreation;
      matchObject['GameDuration'] = riotMatchDto.gameDuration;
      const patch = await getPatch(riotMatchDto.gameVersion);
      matchObject['GamePatchVersion'] = patch;
      matchObject['DDragonVersion'] = await getDdragonVersion(patch);

      // #region 2.1) - Teams+Players
      const teamItems = {}; // teamId (100 or 200) -> teamData {}
      const playerItems = {}; // participantId -> playerData {}
      // We will merge these two Items at 2.3)
      const teamIdByPartId = {}; // Mapping participantId -> teamId in timeline
      const partIdByTeamIdAndRole = {};
      for (const riotTeamDto of riotMatchDto.teams) {
        const teamData = {};
        const teamId = riotTeamDto.teamId; // 100 === BLUE, 200 === RED
        partIdByTeamIdAndRole[teamId] = {};
        if (teamId == TEAM_ID.BLUE) {
          teamData['TeamHId'] = getTeamHashId(matchTeamsSetupObject['BlueTeam']['TeamPId']);
        }
        else if (teamId == TEAM_ID.RED) {
          teamData['TeamHId'] = getTeamHashId(matchTeamsSetupObject['RedTeam']['TeamPId']);
        }
        if (riotTeamDto.win === 'Win') {
          teamData['Win'] = true;
        }
        else {
          teamData['Win'] = false;
        }
        teamData['Towers'] = riotTeamDto.towerKills;
        teamData['Inhibitors'] = riotTeamDto.inhibitorKills;
        teamData['Barons'] = riotTeamDto.baronKills;
        teamData['Dragons'] = []; // Will be built upon in Timeline
        teamData['Heralds'] = riotTeamDto.riftHeraldKills;
        // Bans
        if (teamId == TEAM_ID.BLUE) {
          teamData['Bans'] = matchTeamsSetupObject['BlueTeam']['Bans'];
        }
        else if (teamId == TEAM_ID.RED) {
          teamData['Bans'] = matchTeamsSetupObject['RedTeam']['Bans'];
        }
        // ----------
        teamData['FirstTower'] = riotTeamDto.firstTower;
        teamData['FirstBlood'] = riotTeamDto.firstBlood;
        let teamKills = 0;
        let teamAssists = 0;
        let teamDeaths = 0;
        let teamGold = 0;
        let teamDamageDealt = 0;
        let teamCreepScore = 0;
        let teamVisionScore = 0;
        let teamWardsPlaced = 0;
        let teamControlWardsBought = 0;
        let teamWardsCleared = 0;
        for (const riotParticipantDto of riotMatchDto.participants) {
          const playerData = {}
          if (riotParticipantDto.teamId === teamId) {
            const partId = riotParticipantDto.participantId;
            teamIdByPartId[partId] = teamId;
            const riotParticipantStatsDto = riotParticipantDto.stats;
            const profilePId = profileObjByChampId[riotParticipantDto.championId]['PId'];
            playerData['ProfileHId'] = getProfileHashId(profilePId);
            playerData['ParticipantId'] = partId;
            const champRole = profileObjByChampId[riotParticipantDto.championId]['Role'];
            playerData['Role'] = champRole;
            partIdByTeamIdAndRole[teamId][champRole] = partId;
            playerData['ChampLevel'] = riotParticipantStatsDto.champLevel;
            playerData['ChampId'] = riotParticipantDto.championId;
            playerData['Spell1Id'] = riotParticipantDto.summoner1Id;
            playerData['Spell2Id'] = riotParticipantDto.summoner2Id;
            playerData['Kills'] = riotParticipantStatsDto.kills;
            teamKills += riotParticipantStatsDto.kills;
            playerData['Deaths'] = riotParticipantStatsDto.deaths;
            teamDeaths += riotParticipantStatsDto.deaths;
            playerData['Assists'] = riotParticipantStatsDto.assists;
            teamAssists += riotParticipantStatsDto.assists;
            playerData['Gold'] = riotParticipantStatsDto.goldEarned;
            teamGold += riotParticipantStatsDto.goldEarned;
            playerData['TotalDamageDealt'] = riotParticipantStatsDto.totalDamageDealtToChampions;
            teamDamageDealt += riotParticipantStatsDto.totalDamageDealtToChampions;
            playerData['DamagePerMinute'] = parseFloat((riotParticipantStatsDto.totalDamageDealtToChampions / (riotMatchDto.gameDuration / 60)).toFixed(2));
            playerData['PhysicalDamageDealt'] = riotParticipantStatsDto.physicalDamageDealtToChampions;
            playerData['MagicDamageDealt'] = riotParticipantStatsDto.magicDamageDealtToChampions;
            playerData['TrueDamageDealt'] = riotParticipantStatsDto.trueDamageDealtToChampions;
            const totalCS = riotParticipantStatsDto.neutralMinionsKilled + riotParticipantStatsDto.totalMinionsKilled;
            playerData['CreepScore'] = totalCS;
            teamCreepScore += totalCS;
            playerData['CsInTeamJungle'] = riotParticipantStatsDto.neutralMinionsKilledTeamJungle;
            playerData['CsInEnemyJungle'] = riotParticipantStatsDto.neutralMinionsKilledEnemyJungle;
            playerData['VisionScore'] = riotParticipantStatsDto.visionScore;
            teamVisionScore += riotParticipantStatsDto.visionScore;
            playerData['WardsPlaced'] = riotParticipantStatsDto.wardsPlaced;
            teamWardsPlaced += riotParticipantStatsDto.wardsPlaced;
            playerData['ControlWardsBought'] = riotParticipantStatsDto.visionWardsBoughtInGame;
            teamControlWardsBought += riotParticipantStatsDto.visionWardsBoughtInGame;
            playerData['WardsCleared'] = riotParticipantStatsDto.wardsKilled;
            teamWardsCleared += riotParticipantStatsDto.wardsKilled;
            playerData['FirstBloodKill'] = false; // Logic in Timeline
            playerData['FirstBloodAssist'] = false; // Logic in Timeline
            playerData['FirstBloodVictim'] = false; // Logic in Timeline
            playerData['FirstTower'] = (riotParticipantStatsDto.firstTowerKill || riotParticipantStatsDto.firstTowerAssist);
            playerData['SoloKills'] = 0; // Logic in Timeline
            playerData['PentaKills'] = riotParticipantStatsDto.pentaKills;
            playerData['QuadraKills'] = riotParticipantStatsDto.quadraKills - riotParticipantStatsDto.pentaKills;
            playerData['TripleKills'] = riotParticipantStatsDto.tripleKills - riotParticipantStatsDto.quadraKills;
            playerData['DoubleKills'] = riotParticipantStatsDto.doubleKills - riotParticipantStatsDto.tripleKills;
            playerData['DamageToTurrets'] = riotParticipantStatsDto.damageDealtToTurrets;
            playerData['DamageToObjectives'] = riotParticipantStatsDto.damageDealtToObjectives;
            playerData['TotalHeal'] = riotParticipantStatsDto.totalHeal;
            playerData['TimeCrowdControl'] = riotParticipantStatsDto.timeCCingOthers;
            playerData['ItemsFinal'] = [riotParticipantStatsDto.item0, riotParticipantStatsDto.item1,
            riotParticipantStatsDto.item2, riotParticipantStatsDto.item3, riotParticipantStatsDto.item4,
            riotParticipantStatsDto.item5, riotParticipantStatsDto.item6];
            playerData['ItemBuild'] = {}; // Logic in Timeline
            // Runes
            const playerRunes = {}
            const riotPerksDto = riotParticipantStatsDto.perks;
            const { statsPerks } = riotPerksDto;
            playerRunes['ShardSlot0Id'] = statsPerks.offense;
            playerRunes['ShardSlot1Id'] = statsPerks.flex;
            playerRunes['ShardSlot2Id'] = statsPerks.defense;
            const { styles } = riotPerksDto; // Should just an array of 2
            for (const styleDto of styles) {
              // A little scuffed because this is how I originally set with v4
              if (styleDto.description === 'primaryStyle') {
                playerRunes['PrimaryPathId'] = styleDto.style;
                for (let i = 0; i < styleDto.selections.length; ++i) {
                  const selection = styleDto.selections[i];
                  if (i === 0) {
                    playerRunes['PrimaryKeystoneId'] = selection.perk;
                  }
                  else {
                    playerRunes[`PrimarySlot${i}Id`] = selection.perk;
                  }
                  playerRunes[`PrimarySlot${i}Var1`] = selection.var1;
                  playerRunes[`PrimarySlot${i}Var2`] = selection.var2;
                  playerRunes[`PrimarySlot${i}Var3`] = selection.var3;
                }
              }
              else if (styleDto.description === 'subStyle') {
                playerRunes['SecondaryPathId'] = styleDto.style;
                for (let i = 0; i < styleDto.selections.length; ++i) {
                  const selection = styleDto.selections[i];
                  playerRunes[`SecondarySlot${i+1}Id`] = selection.perk;
                  playerRunes[`SecondarySlot${i+1}Var1`] = selection.var1;
                  playerRunes[`SecondarySlot${i+1}Var2`] = selection.var2;
                  playerRunes[`SecondarySlot${i+1}Var3`] = selection.var3;
                }
              }
            }
            playerData['Runes'] = playerRunes;
            playerData['SkillOrder'] = []; // Logic will be done in Timeline
            // Add to playerItem. Phew
            playerItems[riotParticipantDto.participantId] = playerData;
          }
        }
        teamData['TeamKills'] = teamKills;
        teamData['TeamDeaths'] = teamDeaths;
        teamData['TeamAssists'] = teamAssists;
        teamData['TeamGold'] = teamGold;
        teamData['TeamDamageDealt'] = teamDamageDealt;
        teamData['TeamCreepScore'] = teamCreepScore;
        teamData['TeamVisionScore'] = teamVisionScore;
        teamData['TeamWardsPlaced'] = teamWardsPlaced;
        teamData['TeamControlWardsBought'] = teamControlWardsBought;
        teamData['TeamWardsCleared'] = teamWardsCleared;
        teamData['Players'] = {};   // Merge after
        if (riotMatchDto.gameDuration >= MINUTE.EARLY * 60) {
          teamData['CsAtEarly'] = 0;      // Logic in Timeline
          teamData['GoldAtEarly'] = 0;    // Logic in Timeline
          teamData['XpAtEarly'] = 0;      // Logic in Timeline
        }
        if (riotMatchDto.gameDuration >= MINUTE.MID * 60) {
          teamData['CsAtMid'] = 0;        // Logic in Timeline
          teamData['GoldAtMid'] = 0;      // Logic in Timeline
          teamData['XpAtMid'] = 0;        // Logic in Timeline
        }
        teamItems[riotTeamDto.teamId] = teamData;
      }
      //#endregion

      // #region 2.2) - Timeline
      // Each index represents the minute
      const timelineList = [];
      let blueKillsAtEarly = 0;
      let blueKillsAtMid = 0;
      let redKillsAtEarly = 0;
      let redKillsAtMid = 0;
      let firstBloodFound = false;
      // We want to get the entire list of items being built. Key is the 'participantId'
      const allItemBuilds = { '1': [], '2': [], '3': [], '4': [], '5': [], '6': [], '7': [], '8': [], '9': [], '10': [] };
      // We want to keep track of number of kills/assists at Early and at Mid for each Player. Key is the 'participantId'
      const playerKillsAtEarly = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0, '7': 0, '8': 0, '9': 0, '10': 0 };
      const playerAssistsAtEarly = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0, '7': 0, '8': 0, '9': 0, '10': 0 };
      const playerKillsAtMid = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0, '7': 0, '8': 0, '9': 0, '10': 0 };
      const playerAssistsAtMid = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0, '7': 0, '8': 0, '9': 0, '10': 0 };
      // Since we want to calculate baron power play AFTER the total team gold is calculated,
      // we want to store which indices in the timelineList of each minute and what index in the eventsList
      const baronObjectiveMinuteIndex = {};
      // Key: minute -> Value: index in ['Events']
      for (let minute = 0; minute < riotMatchTimelineDto.frames.length; minute++) {
        const minuteTimelineItem = {};
        const riotFrameDto = riotMatchTimelineDto.frames[minute];
        let blueTeamGold = 0;
        let redTeamGold = 0;
        for (const riotParticipantFrameDto of Object.values(riotFrameDto.participantFrames)) {
          const participantId = riotParticipantFrameDto.participantId;
          const thisTeamId = teamIdByPartId[participantId];
          if (thisTeamId == TEAM_ID.BLUE) {
            blueTeamGold += riotParticipantFrameDto.totalGold;
          }
          else if (thisTeamId == TEAM_ID.RED) {
            redTeamGold += riotParticipantFrameDto.totalGold;
          }
          // playerData: EARLY_MINUTE and MID_MINUTE
          if ((minute === MINUTE.EARLY && riotMatchDto.gameDuration >= MINUTE.EARLY * 60) ||
            (minute === MINUTE.MID && riotMatchDto.gameDuration >= MINUTE.MID * 60)) {
            const type = (minute === MINUTE.EARLY) ? "Early" : "Mid";
            playerItems[participantId]['GoldAt' + type] = riotParticipantFrameDto.totalGold;
            teamItems[thisTeamId]['GoldAt' + type] += riotParticipantFrameDto.totalGold;
            const playerCsAt = riotParticipantFrameDto.minionsKilled + riotParticipantFrameDto.jungleMinionsKilled;
            playerItems[participantId]['CsAt' + type] = playerCsAt;
            teamItems[thisTeamId]['CsAt' + type] += playerCsAt;
            playerItems[participantId]['XpAt' + type] = riotParticipantFrameDto.xp;
            teamItems[thisTeamId]['XpAt' + type] += riotParticipantFrameDto.xp;
            playerItems[participantId]['JungleCsAt' + type] = riotParticipantFrameDto.jungleMinionsKilled;
          }
        }
        minuteTimelineItem['MinuteStamp'] = minute;
        minuteTimelineItem['BlueTeamGold'] = blueTeamGold;
        minuteTimelineItem['RedTeamGold'] = redTeamGold;
        // Looping through Events
        const eventsList = [];
        for (const riotEventDto of riotFrameDto.events) {
          const eventItem = {};
          // Only Tower, Inhibitor, Dragon, Baron, Herald, and Kills are added to eventData
          if (riotEventDto.type === 'ELITE_MONSTER_KILL') {
            const teamId = teamIdByPartId[riotEventDto.killerId];
            eventItem['TeamId'] = teamId;
            eventItem['Timestamp'] = riotEventDto.timestamp;
            eventItem['KillerId'] = riotEventDto.killerId;
            if (riotEventDto.monsterType === 'DRAGON') {
              eventItem['EventType'] = 'Dragon';
              const getDragonString = {
                'AIR_DRAGON': 'Cloud',
                'FIRE_DRAGON': 'Infernal',
                'EARTH_DRAGON': 'Mountain',
                'WATER_DRAGON': 'Ocean',
                'ELDER_DRAGON': 'Elder'
              };
              const dragonString = getDragonString[riotEventDto.monsterSubType];
              eventItem['EventCategory'] = dragonString;
              // playerData: Dragon types
              teamItems[teamId]['Dragons'].push(dragonString);
            }
            else if (riotEventDto.monsterType === 'BARON_NASHOR') {
              eventItem['EventType'] = 'Baron';
              baronObjectiveMinuteIndex[minute] = eventsList.length; // We'll add to eventsList anyways
            }
            else if (riotEventDto.monsterType === 'RIFTHERALD') {
              eventItem['EventType'] = 'Herald';
            }
            else {
              // Put some placeholder mystery here in case there's a future monster
              eventItem['EventType'] = 'MYSTERIOUS MONSTER';
            }
          }
          else if (riotEventDto.type === 'BUILDING_KILL') {
            eventItem['TeamId'] = (riotEventDto.teamId == TEAM_ID.BLUE)
              ? parseInt(TEAM_ID.RED) : parseInt(TEAM_ID.BLUE);
            // FROM RIOT API, THE ABOVE IS TEAM_ID OF TOWER DESTROYED. NOT KILLED (which is what we intend)
            eventItem['Timestamp'] = riotEventDto.timestamp;
            eventItem['KillerId'] = riotEventDto.killerId;
            if (riotEventDto.assistingParticipantIds.length > 0) {
              eventItem['AssistIds'] = riotEventDto.assistingParticipantIds;
            }
            const getLaneString = {
              'TOP_LANE': 'Top',
              'MID_LANE': 'Middle',
              'BOT_LANE': 'Bottom'
            };
            eventItem['Lane'] = getLaneString[riotEventDto.laneType];
            if (riotEventDto.buildingType === 'TOWER_BUILDING') {
              eventItem['EventType'] = 'Tower';
              let getTowerType = {
                'OUTER_TURRET': 'Outer',
                'INNER_TURRET': 'Inner',
                'BASE_TURRET': 'Base',
                'NEXUS_TURRET': 'Nexus'
              };
              eventItem['EventCategory'] = getTowerType[riotEventDto.towerType];
            }
            else if (riotEventDto.buildingType === 'INHIBITOR_BUILDING') {
              eventItem['EventType'] = 'Inhibitor';
            }
            else {
              // Put some placeholder mystery here in case there's a future Building
              eventItem['EventType'] = 'NEW BUILDING';
            }
          }
          else if (riotEventDto.type === 'CHAMPION_KILL') {
            const killerId = riotEventDto.killerId;
            const teamId = teamIdByPartId[killerId];
            eventItem['TeamId'] = teamId
            eventItem['Timestamp'] = riotEventDto.timestamp;
            eventItem['KillerId'] = killerId;
            eventItem['PositionX'] = riotEventDto.position.x;
            eventItem['PositionY'] = riotEventDto.position.y;
            const victimId = riotEventDto.victimId;
            eventItem['VictimId'] = victimId;
            eventItem['EventType'] = 'Kill';
            // playerData: Solo Kills
            if (riotEventDto.assistingParticipantIds.length === 0 && killerId != 0) {
              playerItems[killerId]['SoloKills']++;
            }
            else {
              eventItem['AssistIds'] = riotEventDto.assistingParticipantIds;
            }
            // playerData: First Blood
            if (!firstBloodFound && killerId != 0 && victimId != 0) {
              playerItems[killerId]['FirstBloodKill'] = true;
              riotEventDto.assistingParticipantIds.forEach(function (assistPId) {
                playerItems[assistPId]['FirstBloodAssist'] = true;
              });
              playerItems[victimId]['FirstBloodVictim'] = true;
              firstBloodFound = true;
            }
            // playerData: KillsAtEarly/KillsAtMid
            if (minute < MINUTE.EARLY) {
              playerKillsAtEarly[killerId]++;
              for (const assistId of riotEventDto.assistingParticipantIds) {
                playerAssistsAtEarly[assistId]++;
              }
            }
            if (minute < MINUTE.MID) {
              playerKillsAtMid[killerId]++;
              for (const assistId of riotEventDto.assistingParticipantIds) {
                playerAssistsAtMid[assistId]++;
              }
            }
            // teamData: EARLY_MINUTE and MID_MINUTE Kills
            if (minute < MINUTE.EARLY) {
              if (teamId == TEAM_ID.BLUE) { blueKillsAtEarly++; }
              else if (teamId == TEAM_ID.RED) { redKillsAtEarly++; }
            }
            if (minute < MINUTE.MID) {
              if (teamId == TEAM_ID.BLUE) { blueKillsAtMid++; }
              else if (teamId == TEAM_ID.RED) { redKillsAtMid++; }
            }
          }
          else if (riotEventDto.type === 'ITEM_PURCHASED') {
            const itemEvent = {
              'MinuteStamp': minute - 1, // Apparently a minute after...
              'ItemId': riotEventDto.itemId,
              'Bought': true,
            };
            allItemBuilds[riotEventDto.participantId].push(itemEvent);
          }
          else if (riotEventDto.type === 'ITEM_SOLD') {
            const itemEvent = {
              'MinuteStamp': minute - 1, // Apparently a minute after...
              'ItemId': riotEventDto.itemId,
              'Bought': false,
            }
            allItemBuilds[riotEventDto.participantId].push(itemEvent);
          }
          else if (riotEventDto.type === 'ITEM_UNDO') {
            // Based on the API, I could just remove the last Item Build event
            allItemBuilds[riotEventDto.participantId].pop();
          }
          else if (riotEventDto.type === 'SKILL_LEVEL_UP') {
            // playerData['Skillorder']
            const getSkillLetter = { '1': 'Q', '2': 'W', '3': 'E', '4': 'R' };
            const skillValue = riotEventDto.skillSlot;
            if (skillValue in getSkillLetter) {
              playerItems[riotEventDto.participantId]['SkillOrder']
                .push(getSkillLetter[riotEventDto.skillSlot]);
            }
          }
          if (!(Object.keys(eventItem).length === 0 && eventItem.constructor === Object)) {
            // Javascript's stupid way of checking if an object is empty
            eventsList.push(eventItem);
          }
        }
        if (eventsList.length > 0) {
          minuteTimelineItem['Events'] = eventsList;
        }
        timelineList.push(minuteTimelineItem);
      }
      // Calculate baron power plays
      await computeBaronPowerPlay(baronObjectiveMinuteIndex, timelineList, matchObject['GamePatchVersion']);
      // Timeline completed
      matchObject['Timeline'] = timelineList;

      // Assign Kills and Assists at Early/Mid
      for (const participantId in teamIdByPartId) {
        if (riotMatchDto.gameDuration >= MINUTE.EARLY * 60) {
          playerItems[participantId]['KillsAtEarly'] = playerKillsAtEarly[participantId];
          playerItems[participantId]['AssistsAtEarly'] = playerAssistsAtEarly[participantId];
        }
        if (riotMatchDto.gameDuration >= MINUTE.MID * 60) {
          playerItems[participantId]['KillsAtMid'] = playerKillsAtMid[participantId];
          playerItems[participantId]['AssistsAtMid'] = playerAssistsAtMid[participantId];
        }
      }
      // Calculate Diff@Early and Mid for Teams
      if (riotMatchDto.gameDuration >= MINUTE.EARLY * 60) {
        teamItems[TEAM_ID.BLUE]['KillsAtEarly'] = blueKillsAtEarly;
        teamItems[TEAM_ID.RED]['KillsAtEarly'] = redKillsAtEarly;
        const blueKillsDiffEarly = blueKillsAtEarly - redKillsAtEarly;
        const blueTeamGoldDiffEarly = teamItems[TEAM_ID.BLUE]['GoldAtEarly'] - teamItems[TEAM_ID.RED]['GoldAtEarly'];
        const blueTeamCsDiffEarly = teamItems[TEAM_ID.BLUE]['CsAtEarly'] - teamItems[TEAM_ID.RED]['CsAtEarly'];
        const blueTeamXpDiffEarly = teamItems[TEAM_ID.BLUE]['XpAtEarly'] - teamItems[TEAM_ID.RED]['XpAtEarly'];
        teamItems[TEAM_ID.BLUE]['KillsDiffEarly'] = blueKillsDiffEarly;
        teamItems[TEAM_ID.RED]['KillsDiffEarly'] = (blueKillsDiffEarly === 0) ? 0 : (blueKillsDiffEarly * -1);
        teamItems[TEAM_ID.BLUE]['GoldDiffEarly'] = blueTeamGoldDiffEarly;
        teamItems[TEAM_ID.RED]['GoldDiffEarly'] = (blueTeamGoldDiffEarly === 0) ? 0 : (blueTeamGoldDiffEarly * -1);
        teamItems[TEAM_ID.BLUE]['CsDiffEarly'] = blueTeamCsDiffEarly;
        teamItems[TEAM_ID.RED]['CsDiffEarly'] = (blueTeamCsDiffEarly === 0) ? 0 : (blueTeamCsDiffEarly * -1);
        teamItems[TEAM_ID.BLUE]['XpDiffEarly'] = blueTeamXpDiffEarly;
        teamItems[TEAM_ID.RED]['XpDiffEarly'] = (blueTeamXpDiffEarly === 0) ? 0 : (blueTeamXpDiffEarly * -1);
      }
      if (riotMatchDto.gameDuration >= MINUTE.MID * 60) {
        teamItems[TEAM_ID.BLUE]['KillsAtMid'] = blueKillsAtMid;
        teamItems[TEAM_ID.RED]['KillsAtMid'] = redKillsAtMid;
        const blueKillsDiffMid = blueKillsAtMid - redKillsAtMid;
        const blueTeamGoldDiffMid = teamItems[TEAM_ID.BLUE]['GoldAtMid'] - teamItems[TEAM_ID.RED]['GoldAtMid'];
        const blueTeamCsDiffMid = teamItems[TEAM_ID.BLUE]['CsAtMid'] - teamItems[TEAM_ID.RED]['CsAtMid'];
        const blueTeamXpDiffMid = teamItems[TEAM_ID.BLUE]['XpAtMid'] - teamItems[TEAM_ID.RED]['XpAtMid'];
        teamItems[TEAM_ID.BLUE]['KillsDiffMid'] = blueKillsDiffMid;
        teamItems[TEAM_ID.RED]['KillsDiffMid'] = (blueKillsDiffMid === 0) ? 0 : (blueKillsDiffMid * -1);
        teamItems[TEAM_ID.BLUE]['GoldDiffMid'] = blueTeamGoldDiffMid;
        teamItems[TEAM_ID.RED]['GoldDiffMid'] = (blueTeamGoldDiffMid === 0) ? 0 : (blueTeamGoldDiffMid * -1);
        teamItems[TEAM_ID.BLUE]['CsDiffMid'] = blueTeamCsDiffMid;
        teamItems[TEAM_ID.RED]['CsDiffMid'] = (blueTeamCsDiffMid === 0) ? 0 : (blueTeamCsDiffMid * -1);
        teamItems[TEAM_ID.BLUE]['XpDiffMid'] = blueTeamXpDiffMid;
        teamItems[TEAM_ID.RED]['XpDiffMid'] = (blueTeamXpDiffMid === 0) ? 0 : (blueTeamXpDiffMid * -1);
      }
      // playerData['ItemBuild']. Reformat allItemBuilds to have each minute as the key
      for (const participantId in allItemBuilds) {
        const playerItemBuild = {};
        let currMinute = 0;
        let itemBuildsByMinute = [];
        allItemBuilds[participantId].forEach(function (itemEvent) {
          if (currMinute != itemEvent.MinuteStamp) {
            playerItemBuild[currMinute] = itemBuildsByMinute;
            currMinute = itemEvent.MinuteStamp;
            itemBuildsByMinute = [];
          }
          itemBuildsByMinute.push({
            'ItemId': itemEvent.ItemId,
            'Bought': itemEvent.Bought
          });
        });
        playerItems[participantId]['ItemBuild'] = playerItemBuild;
      }
      // Calculate Diff based on Roles for Players
      for (const role in partIdByTeamIdAndRole[TEAM_ID.BLUE]) {
        const bluePartId = partIdByTeamIdAndRole[TEAM_ID.BLUE][role];
        const redPartId = partIdByTeamIdAndRole[TEAM_ID.RED][role];
        if (riotMatchDto.gameDuration >= MINUTE.EARLY * 60) {
          const bluePlayerGoldDiffEarly = playerItems[bluePartId].GoldAtEarly - playerItems[redPartId].GoldAtEarly;
          playerItems[bluePartId]['GoldDiffEarly'] = bluePlayerGoldDiffEarly;
          playerItems[redPartId]['GoldDiffEarly'] = (bluePlayerGoldDiffEarly === 0) ? 0 : (bluePlayerGoldDiffEarly * -1);
          const bluePlayerCsDiffEarly = playerItems[bluePartId].CsAtEarly - playerItems[redPartId].CsAtEarly;
          playerItems[bluePartId]['CsDiffEarly'] = bluePlayerCsDiffEarly;
          playerItems[redPartId]['CsDiffEarly'] = (bluePlayerCsDiffEarly === 0) ? 0 : (bluePlayerCsDiffEarly * -1);
          const bluePlayerXpDiffEarly = playerItems[bluePartId].XpAtEarly - playerItems[redPartId].XpAtEarly;
          playerItems[bluePartId]['XpDiffEarly'] = bluePlayerXpDiffEarly;
          playerItems[redPartId]['XpDiffEarly'] = (bluePlayerXpDiffEarly === 0) ? 0 : (bluePlayerXpDiffEarly * -1);
          const bluePlayerJgCsDiffEarly = playerItems[bluePartId].JungleCsAtEarly - playerItems[redPartId].JungleCsAtEarly;
          playerItems[bluePartId]['JungleCsDiffEarly'] = bluePlayerJgCsDiffEarly;
          playerItems[redPartId]['JungleCsDiffEarly'] = (bluePlayerJgCsDiffEarly === 0) ? 0 : (bluePlayerJgCsDiffEarly * -1);
        }
        if (riotMatchDto.gameDuration >= MINUTE.MID * 60) {
          const bluePlayerGoldDiffMid = playerItems[bluePartId].GoldAtMid - playerItems[redPartId].GoldAtMid;
          playerItems[bluePartId]['GoldDiffMid'] = bluePlayerGoldDiffMid;
          playerItems[redPartId]['GoldDiffMid'] = (bluePlayerGoldDiffMid === 0) ? 0 : (bluePlayerGoldDiffMid * -1);
          const bluePlayerCsDiffMid = playerItems[bluePartId].CsAtMid - playerItems[redPartId].CsAtMid;
          playerItems[bluePartId]['CsDiffMid'] = bluePlayerCsDiffMid;
          playerItems[redPartId]['CsDiffMid'] = (bluePlayerCsDiffMid === 0) ? 0 : (bluePlayerCsDiffMid * -1);
          const bluePlayerXpDiffMid = playerItems[bluePartId].XpAtMid - playerItems[redPartId].XpAtMid;
          playerItems[bluePartId]['XpDiffMid'] = bluePlayerXpDiffMid;
          playerItems[redPartId]['XpDiffMid'] = (bluePlayerXpDiffMid === 0) ? 0 : (bluePlayerXpDiffMid * -1);
          const bluePlayerJgCsDiffMid = playerItems[bluePartId].JungleCsAtMid - playerItems[redPartId].JungleCsAtMid;
          playerItems[bluePartId]['JungleCsDiffMid'] = bluePlayerJgCsDiffMid;
          playerItems[redPartId]['JungleCsDiffMid'] = (bluePlayerJgCsDiffMid === 0) ? 0 : (bluePlayerJgCsDiffMid * -1);
        }
        const damagePerMinuteDiff = parseFloat((playerItems[bluePartId].DamagePerMinute - playerItems[redPartId].DamagePerMinute).toFixed(2));
        playerItems[bluePartId]['DamagePerMinuteDiff'] = damagePerMinuteDiff;
        playerItems[redPartId]['DamagePerMinuteDiff'] = (damagePerMinuteDiff === 0) ? 0 : (damagePerMinuteDiff * -1);
      }
      //#endregion

      // 2.3) - Merge teamItem + playerItem (especially with the Diffs)
      for (const partId in playerItems) {
        const teamId = teamIdByPartId[partId];
        teamItems[teamId]['Players'][partId] = playerItems[partId];
      }
      matchObject['Teams'] = teamItems;

      // Return the whole matchObject
      resolve(matchObject);
    }
    catch (err) {
      reject({
        error: err,
        message: `Function "createDbMatchObject" Failed`,
      });
    }
  });
}

/**
 * Takes riotMatchObject's game version (i.e. "10.20.337.6704") and only looks at the Major.Minor (returns "10.20")
 * @param {string} patchStr 
 */
function getPatch(patchStr) {
  return new Promise((resolve, reject) => {
    try {
      const patchArr = patchStr.split('.');
      resolve(`${patchArr[0]}.${patchArr[1]}`);
    }
    catch (err) {
      reject(err);
    }
  });
}

/**
 * Ever since Patch 9.23, baron duration is 3 minutes. Before then, it used to be 3.5 minutes.
 * @param {string} thisPatch    patch in string format (i.e. "10.20")
 */
function updateBaronDuration(thisPatch) {
  return (isPatch1LaterThanPatch2(thisPatch, BARON_DURATION.PATCH_CHANGE)) ?
    BARON_DURATION.CURRENT : BARON_DURATION.OLD;
}

/**
 * returns the Team Gold at the given timestamp. Does a linear approximation in between seconds
 * @param {number} timestamp        Expressed in seconds
 * @param {Array} timelineList      List of events from the Riot Timeline API Request
 * @param {string} teamId           "100" == Blue, "200" == Red
 */
function teamGoldAtTimeStamp(timestamp, timelineList, teamId) {
  const timeStampMinute = Math.floor(timestamp / 60);
  const timeStampSeconds = timestamp % 60;
  if ((timeStampMinute + 1) >= timelineList.length) { return null; }

  // Take team gold at marked minute, and from minute + 1. Average them.
  const teamGoldAtMinute = (teamId == TEAM_ID.BLUE) ? timelineList[timeStampMinute]['BlueTeamGold'] : timelineList[timeStampMinute]['RedTeamGold'];
  const teamGoldAtMinutePlus1 = (teamId == TEAM_ID.BLUE) ? timelineList[timeStampMinute + 1]['BlueTeamGold'] : timelineList[timeStampMinute + 1]['RedTeamGold'];
  const goldPerSecond = (teamGoldAtMinutePlus1 - teamGoldAtMinute) / 60;
  return (teamGoldAtMinute + Math.floor((goldPerSecond * timeStampSeconds)));
}

/**
 * Modifies the timelineList to compute the Power Play of each Baron event
 * Returns nothing.
 * @param {Array} baronObjectiveMinuteIndices   A list of indices where a Baron was taken in the Timeline
 * @param {Array} timelineList                  List of events from the Riot Timeline API Request
 * @param {string} patch                        Patch of what the event took place in
 */
function computeBaronPowerPlay(baronObjectiveMinuteIndices, timelineList, patch) {
  return new Promise(function (resolve, reject) {
    try {
      const baronDuration = updateBaronDuration(patch); // in seconds
      Object.keys(baronObjectiveMinuteIndices).forEach(function (minute) {
        const eventIndex = baronObjectiveMinuteIndices[minute];
        const baronEventObject = timelineList[minute]['Events'][eventIndex]; // Make shallow copy and change that
        const thisTeamId = baronEventObject.TeamId;
        const oppTeamId = (thisTeamId == TEAM_ID.BLUE) ? TEAM_ID.RED : TEAM_ID.BLUE;
        const timeStampAtKill = baronEventObject.Timestamp / 1000; // Convert ms -> seconds
        const teamGoldAtKill = teamGoldAtTimeStamp(timeStampAtKill, timelineList, thisTeamId);
        const oppGoldAtKill = teamGoldAtTimeStamp(timeStampAtKill, timelineList, oppTeamId);
        if (!teamGoldAtKill || !oppGoldAtKill) { return; }
        const timeStampAtExpire = timeStampAtKill + baronDuration;
        const teamGoldAtExpire = teamGoldAtTimeStamp(timeStampAtExpire, timelineList, thisTeamId);
        const oppGoldAtExpire = teamGoldAtTimeStamp(timeStampAtExpire, timelineList, oppTeamId);
        if (!teamGoldAtExpire || !oppGoldAtExpire) { return; }
        baronEventObject['BaronPowerPlay'] = (teamGoldAtExpire - teamGoldAtKill) - (oppGoldAtExpire - oppGoldAtKill);
      });
      resolve(0);
    }
    catch (err) {
      console.error("computeBaronPowerPlay Promise Rejected.");
      reject(err);
    }
  });
}