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
import { getRiotMatchData } from '../dependencies/awsLambdaHelper';
import {
  getProfileHashId,
  getTeamHashId,
  isPatch1LaterThanPatch2
} from '../dependencies/global';

const MINUTE_SECONDS = 60;
const EARLY_TIME = "Early";
const MID_TIME = "Mid";

/**
 * Creates object tailored for database
 * @param {string} matchId 
 * @param {object} matchSetupObject
 */
export const createDbMatchObject = (matchId, matchSetupObject) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Call Riot API
      console.log(`Processing new matchV5 ID: ${matchSetupObject['RiotMatchId']}`);
      const matchTeamsSetupObject = matchSetupObject['Teams'];
      const riotMatchObject = await getRiotMatchData(matchId);
      const riotMatchDto = riotMatchObject['Data']['info'];
      const riotMatchTimelineDto = riotMatchObject['Timeline']['info'];

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
      const gameDuration = processGameDuration(riotMatchDto.participants);
      matchObject['GameDuration'] = gameDuration;
      const patch = await getPatch(riotMatchDto.gameVersion);
      matchObject['GamePatchVersion'] = patch;
      matchObject['DDragonVersion'] = await getDdragonVersion(patch);
      matchObject['TournamentCode'] = riotMatchDto.tournamentCode;

      // #region 2.1) - MatchV5 Endpoint
      const teamObjects = {}; // teamId (100 or 200) -> teamData {}
      const playerObjects = {}; // participantId -> playerData {}
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
        if (riotTeamDto.win) {
          teamData['Win'] = true;
        }
        else {
          teamData['Win'] = false;
        }
        const { objectives } = riotTeamDto;
        teamData['Towers'] = objectives.tower.kills;
        teamData['FirstTower'] = objectives.tower.first;
        teamData['Inhibitors'] = objectives.inhibitor.kills;
        teamData['FirstInhibitor'] = objectives.inhibitor.first;
        teamData['Barons'] = objectives.baron.kills;
        teamData['FirstBaron'] = objectives.baron.first;
        teamData['Heralds'] = objectives.riftHerald.kills;
        teamData['FirstHerald'] = objectives.riftHerald.first;
        teamData['TeamKills'] = objectives.champion.kills;
        teamData['FirstBlood'] = objectives.champion.first;
        teamData['Dragons'] = []; // Will be built upon in Timeline
        // Bans
        if (teamId == TEAM_ID.BLUE) {
          teamData['Bans'] = matchTeamsSetupObject['BlueTeam']['Bans'];
        }
        else if (teamId == TEAM_ID.RED) {
          teamData['Bans'] = matchTeamsSetupObject['RedTeam']['Bans'];
        }
        // ----------
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
            const profilePId = profileObjByChampId[riotParticipantDto.championId]['PId'];
            playerData['ProfileHId'] = getProfileHashId(profilePId);
            playerData['ParticipantId'] = partId;
            const champRole = profileObjByChampId[riotParticipantDto.championId]['Role'];
            playerData['Role'] = champRole;
            partIdByTeamIdAndRole[teamId][champRole] = partId;
            playerData['ChampLevel'] = riotParticipantDto.champLevel;
            playerData['ChampId'] = riotParticipantDto.championId;
            playerData['Summoner1Id'] = riotParticipantDto.summoner1Id;
            playerData['Summoner2Id'] = riotParticipantDto.summoner2Id;
            playerData['Summoner1Casts'] = riotParticipantDto.summoner1Casts;
            playerData['Summoner2Casts'] = riotParticipantDto.summoner2Casts;
            playerData['Spell1Casts'] = riotParticipantDto.spell1Casts;
            playerData['Spell2Casts'] = riotParticipantDto.spell2Casts;
            playerData['Spell3Casts'] = riotParticipantDto.spell3Casts;
            playerData['Spell4Casts'] = riotParticipantDto.spell4Casts;
            playerData['Kills'] = riotParticipantDto.kills;
            playerData['Deaths'] = riotParticipantDto.deaths;
            teamDeaths += riotParticipantDto.deaths;
            playerData['Assists'] = riotParticipantDto.assists;
            teamAssists += riotParticipantDto.assists;
            playerData['Gold'] = riotParticipantDto.goldEarned;
            teamGold += riotParticipantDto.goldEarned;
            playerData['TotalDamageDealt'] = riotParticipantDto.totalDamageDealtToChampions;
            teamDamageDealt += riotParticipantDto.totalDamageDealtToChampions;
            playerData['DamagePerMinute'] = parseFloat((riotParticipantDto.totalDamageDealtToChampions / (gameDuration / MINUTE_SECONDS)).toFixed(2));
            playerData['PhysicalDamageDealt'] = riotParticipantDto.physicalDamageDealtToChampions;
            playerData['MagicDamageDealt'] = riotParticipantDto.magicDamageDealtToChampions;
            playerData['TrueDamageDealt'] = riotParticipantDto.trueDamageDealtToChampions;
            const totalCS = riotParticipantDto.neutralMinionsKilled + riotParticipantDto.totalMinionsKilled;
            playerData['CreepScore'] = totalCS;
            teamCreepScore += totalCS;
            playerData['VisionScore'] = riotParticipantDto.visionScore;
            teamVisionScore += riotParticipantDto.visionScore;
            playerData['WardsPlaced'] = riotParticipantDto.wardsPlaced;
            teamWardsPlaced += riotParticipantDto.wardsPlaced;
            playerData['ControlWardsBought'] = riotParticipantDto.visionWardsBoughtInGame;
            teamControlWardsBought += riotParticipantDto.visionWardsBoughtInGame;
            playerData['WardsCleared'] = riotParticipantDto.wardsKilled;
            teamWardsCleared += riotParticipantDto.wardsKilled;
            playerData['FirstBloodKill'] = riotParticipantDto.firstBloodKill;
            playerData['FirstBloodAssist'] = riotParticipantDto.firstBloodAssist;
            playerData['FirstBloodVictim'] = false; // Logic in Timeline
            playerData['FirstTower'] = (riotParticipantDto.firstTowerKill || riotParticipantDto.firstTowerAssist);
            playerData['SoloKills'] = 0; // Logic in Timeline
            playerData['PentaKills'] = riotParticipantDto.pentaKills;
            playerData['QuadraKills'] = riotParticipantDto.quadraKills - riotParticipantDto.pentaKills;
            playerData['TripleKills'] = riotParticipantDto.tripleKills - riotParticipantDto.quadraKills;
            playerData['DoubleKills'] = riotParticipantDto.doubleKills - riotParticipantDto.tripleKills;
            playerData['DamageToTurrets'] = riotParticipantDto.damageDealtToTurrets;
            playerData['DamageToObjectives'] = riotParticipantDto.damageDealtToObjectives;
            playerData['BountyLevel'] = riotParticipantDto.bountyLevel;
            playerData['TotalHeal'] = riotParticipantDto.totalHeal;
            playerData['TimeCrowdControl'] = riotParticipantDto.timeCCingOthers;
            playerData['TotalHealsOnTeammates'] = riotParticipantDto.totalHealsOnTeammates;
            playerData['TotalDamageShieldedOnTeammates'] = riotParticipantDto.totalDamageShieldedOnTeammates;
            playerData['TotalTimeSpentDead'] = riotParticipantDto.totalTimeSpentDead;
            playerData['ItemsPurchased'] = riotParticipantDto.itemsPurchased;
            playerData['ItemsFinal'] = [riotParticipantDto.item0, riotParticipantDto.item1,
              riotParticipantDto.item2, riotParticipantDto.item3, riotParticipantDto.item4,
              riotParticipantDto.item5, riotParticipantDto.item6];
            playerData['ItemBuild'] = {}; // Logic in Timeline
            // Runes
            const playerRunes = {}
            const riotPerksDto = riotParticipantDto.perks;
            const { statPerks } = riotPerksDto;
            playerRunes['ShardSlot0Id'] = statPerks.offense;
            playerRunes['ShardSlot1Id'] = statPerks.flex;
            playerRunes['ShardSlot2Id'] = statPerks.defense;
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
            playerObjects[riotParticipantDto.participantId] = playerData;
          }
        }
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
        if (gameDuration >= MINUTE.EARLY * MINUTE_SECONDS) {
          teamData['CsAtEarly'] = 0;      // Logic in Timeline
          teamData['GoldAtEarly'] = 0;    // Logic in Timeline
          teamData['XpAtEarly'] = 0;      // Logic in Timeline
        }
        if (gameDuration >= MINUTE.MID * MINUTE_SECONDS) {
          teamData['CsAtMid'] = 0;        // Logic in Timeline
          teamData['GoldAtMid'] = 0;      // Logic in Timeline
          teamData['XpAtMid'] = 0;        // Logic in Timeline
        }
        teamObjects[riotTeamDto.teamId] = teamData;
      }
      //#endregion

      // #region 2.2) - MatchV5 Timeline Endpoint
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
          if ((minute === MINUTE.EARLY && gameDuration >= MINUTE.EARLY * MINUTE_SECONDS) ||
            (minute === MINUTE.MID && gameDuration >= MINUTE.MID * MINUTE_SECONDS)) {
            const type = (minute === MINUTE.EARLY) ? EARLY_TIME : MID_TIME;
            playerObjects[participantId][`GoldAt${type}`] = riotParticipantFrameDto.totalGold;
            teamObjects[thisTeamId][`GoldAt${type}`] += riotParticipantFrameDto.totalGold;
            const playerCsAt = riotParticipantFrameDto.minionsKilled + riotParticipantFrameDto.jungleMinionsKilled;
            playerObjects[participantId][`CsAt${type}`] = playerCsAt;
            teamObjects[thisTeamId][`CsAt${type}`] += playerCsAt;
            playerObjects[participantId][`XpAt${type}`] = riotParticipantFrameDto.xp;
            teamObjects[thisTeamId][`XpAt${type}`] += riotParticipantFrameDto.xp;
            playerObjects[participantId][`JungleCsAt${type}`] = riotParticipantFrameDto.jungleMinionsKilled;
          }
        }
        minuteTimelineItem['MinuteStamp'] = minute;
        minuteTimelineItem['BlueTeamGold'] = blueTeamGold;
        minuteTimelineItem['RedTeamGold'] = redTeamGold;
        // Looping through Events
        const eventsList = [];
        for (const riotEventDto of riotFrameDto.events) {
          const eventItem = {};
          /**
           * Only the folloiwng are added to eventData:
           * - Tower
           * - Inhibitor
           * - Dragon
           * - Baron
           * - Herald 
           * - Kills
           * - Turret Plate
           */
          if (riotEventDto.type === 'ELITE_MONSTER_KILL') {
            const teamId = riotEventDto.killerTeamId;
            eventItem['TeamId'] = teamId;
            eventItem['Timestamp'] = riotEventDto.timestamp;
            eventItem['KillerId'] = riotEventDto.killerId;
            if (riotEventDto.monsterType === 'DRAGON') {
              eventItem['EventType'] = 'Dragon';
              const DRAGON_STRING_MAP = {
                'AIR_DRAGON': 'Cloud',
                'FIRE_DRAGON': 'Infernal',
                'EARTH_DRAGON': 'Mountain',
                'WATER_DRAGON': 'Ocean',
                'ELDER_DRAGON': 'Elder'
              };
              const dragonString = DRAGON_STRING_MAP[riotEventDto.monsterSubType];
              eventItem['EventCategory'] = dragonString;
              // playerData: Dragon types
              teamObjects[teamId]['Dragons'].push(dragonString);
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
            if (riotEventDto.assistingParticipantIds) {
              eventItem['AssistIds'] = riotEventDto.assistingParticipantIds;
            }
            const LANE_STRING_MAP = {
              'TOP_LANE': 'Top',
              'MID_LANE': 'Middle',
              'BOT_LANE': 'Bottom'
            };
            eventItem['Lane'] = LANE_STRING_MAP[riotEventDto.laneType];
            if (riotEventDto.buildingType === 'TOWER_BUILDING') {
              eventItem['EventType'] = 'Tower';
              const TOWER_TYPE_MAP = {
                'OUTER_TURRET': 'Outer',
                'INNER_TURRET': 'Inner',
                'BASE_TURRET': 'Base',
                'NEXUS_TURRET': 'Nexus'
              };
              eventItem['EventCategory'] = TOWER_TYPE_MAP[riotEventDto.towerType];
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
            if (!riotEventDto.assistingParticipantIds && killerId != 0) {
              playerObjects[killerId]['SoloKills']++;
            }
            else if (riotEventDto.assistingParticipantIds) {
              eventItem['AssistIds'] = riotEventDto.assistingParticipantIds;
            }
            // playerData: First Blood
            if (!firstBloodFound && killerId != 0 && victimId != 0) {
              playerObjects[killerId]['FirstBloodKill'] = true;
              if (riotEventDto.assistingParticipantIds) {
                riotEventDto.assistingParticipantIds.forEach(function (assistPId) {
                  playerObjects[assistPId]['FirstBloodAssist'] = true;
                });
              }
              playerObjects[victimId]['FirstBloodVictim'] = true;
              firstBloodFound = true;
            }
            // playerData: KillsAtEarly/KillsAtMid
            if (minute < MINUTE.EARLY) {
              playerKillsAtEarly[killerId]++;
              if (riotEventDto.assistingParticipantIds) {
                for (const assistId of riotEventDto.assistingParticipantIds) {
                  playerAssistsAtEarly[assistId]++;
                }
              }
            }
            if (minute < MINUTE.MID) {
              playerKillsAtMid[killerId]++;
              if (riotEventDto.assistingParticipantIds) {
                for (const assistId of riotEventDto.assistingParticipantIds) {
                  playerAssistsAtMid[assistId]++;
                }
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
              playerObjects[riotEventDto.participantId]['SkillOrder']
                .push(getSkillLetter[riotEventDto.skillSlot]);
            }
          }
          else if (riotEventDto.type === 'TURRET_PLATE_DESTROYED') {
            eventItem['EventType'] = 'Plate';
            eventItem['TeamId'] = riotEventDto.teamId;
            // FROM RIOT API, THE ABOVE IS TEAM_ID OF TOWER DESTROYED. NOT KILLED (which is what we intend)
            eventItem['Timestamp'] = riotEventDto.timestamp;
            const LANE_STRING_MAP = {
              'TOP_LANE': 'Top',
              'MID_LANE': 'Middle',
              'BOT_LANE': 'Bottom'
            };
            eventItem['Lane'] = LANE_STRING_MAP[riotEventDto.laneType];
          }
          else if (riotEventDto.type === 'PAUSE_START') {
            eventItem['EventType'] = 'Paused';
            eventItem['Timestamp'] = riotEventDto.timestamp;
          }
          else if (riotEventDto.type === 'PAUSE_END') {
            eventItem['EventType'] = 'Unpaused';
            eventItem['Timestamp'] = riotEventDto.timestamp;
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
        if (gameDuration >= MINUTE.EARLY * MINUTE_SECONDS) {
          playerObjects[participantId]['KillsAtEarly'] = playerKillsAtEarly[participantId];
          playerObjects[participantId]['AssistsAtEarly'] = playerAssistsAtEarly[participantId];
        }
        if (gameDuration >= MINUTE.MID * MINUTE_SECONDS) {
          playerObjects[participantId]['KillsAtMid'] = playerKillsAtMid[participantId];
          playerObjects[participantId]['AssistsAtMid'] = playerAssistsAtMid[participantId];
        }
      }
      // Calculate Diff@Early and Mid for Teams
      if (gameDuration >= MINUTE.EARLY * MINUTE_SECONDS) {
        teamObjects[TEAM_ID.BLUE]['KillsAtEarly'] = blueKillsAtEarly;
        teamObjects[TEAM_ID.RED]['KillsAtEarly'] = redKillsAtEarly;
        const blueKillsDiffEarly = blueKillsAtEarly - redKillsAtEarly;
        const blueTeamGoldDiffEarly = teamObjects[TEAM_ID.BLUE]['GoldAtEarly'] - teamObjects[TEAM_ID.RED]['GoldAtEarly'];
        const blueTeamCsDiffEarly = teamObjects[TEAM_ID.BLUE]['CsAtEarly'] - teamObjects[TEAM_ID.RED]['CsAtEarly'];
        const blueTeamXpDiffEarly = teamObjects[TEAM_ID.BLUE]['XpAtEarly'] - teamObjects[TEAM_ID.RED]['XpAtEarly'];
        teamObjects[TEAM_ID.BLUE]['KillsDiffEarly'] = blueKillsDiffEarly;
        teamObjects[TEAM_ID.RED]['KillsDiffEarly'] = (blueKillsDiffEarly === 0) ? 0 : (blueKillsDiffEarly * -1);
        teamObjects[TEAM_ID.BLUE]['GoldDiffEarly'] = blueTeamGoldDiffEarly;
        teamObjects[TEAM_ID.RED]['GoldDiffEarly'] = (blueTeamGoldDiffEarly === 0) ? 0 : (blueTeamGoldDiffEarly * -1);
        teamObjects[TEAM_ID.BLUE]['CsDiffEarly'] = blueTeamCsDiffEarly;
        teamObjects[TEAM_ID.RED]['CsDiffEarly'] = (blueTeamCsDiffEarly === 0) ? 0 : (blueTeamCsDiffEarly * -1);
        teamObjects[TEAM_ID.BLUE]['XpDiffEarly'] = blueTeamXpDiffEarly;
        teamObjects[TEAM_ID.RED]['XpDiffEarly'] = (blueTeamXpDiffEarly === 0) ? 0 : (blueTeamXpDiffEarly * -1);
      }
      if (gameDuration >= MINUTE.MID * MINUTE_SECONDS) {
        teamObjects[TEAM_ID.BLUE]['KillsAtMid'] = blueKillsAtMid;
        teamObjects[TEAM_ID.RED]['KillsAtMid'] = redKillsAtMid;
        const blueKillsDiffMid = blueKillsAtMid - redKillsAtMid;
        const blueTeamGoldDiffMid = teamObjects[TEAM_ID.BLUE]['GoldAtMid'] - teamObjects[TEAM_ID.RED]['GoldAtMid'];
        const blueTeamCsDiffMid = teamObjects[TEAM_ID.BLUE]['CsAtMid'] - teamObjects[TEAM_ID.RED]['CsAtMid'];
        const blueTeamXpDiffMid = teamObjects[TEAM_ID.BLUE]['XpAtMid'] - teamObjects[TEAM_ID.RED]['XpAtMid'];
        teamObjects[TEAM_ID.BLUE]['KillsDiffMid'] = blueKillsDiffMid;
        teamObjects[TEAM_ID.RED]['KillsDiffMid'] = (blueKillsDiffMid === 0) ? 0 : (blueKillsDiffMid * -1);
        teamObjects[TEAM_ID.BLUE]['GoldDiffMid'] = blueTeamGoldDiffMid;
        teamObjects[TEAM_ID.RED]['GoldDiffMid'] = (blueTeamGoldDiffMid === 0) ? 0 : (blueTeamGoldDiffMid * -1);
        teamObjects[TEAM_ID.BLUE]['CsDiffMid'] = blueTeamCsDiffMid;
        teamObjects[TEAM_ID.RED]['CsDiffMid'] = (blueTeamCsDiffMid === 0) ? 0 : (blueTeamCsDiffMid * -1);
        teamObjects[TEAM_ID.BLUE]['XpDiffMid'] = blueTeamXpDiffMid;
        teamObjects[TEAM_ID.RED]['XpDiffMid'] = (blueTeamXpDiffMid === 0) ? 0 : (blueTeamXpDiffMid * -1);
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
        playerObjects[participantId]['ItemBuild'] = playerItemBuild;
      }
      // Calculate Diff based on Roles for Players
      for (const role in partIdByTeamIdAndRole[TEAM_ID.BLUE]) {
        const bluePartId = partIdByTeamIdAndRole[TEAM_ID.BLUE][role];
        const redPartId = partIdByTeamIdAndRole[TEAM_ID.RED][role];
        if (gameDuration >= MINUTE.EARLY * MINUTE_SECONDS) {
          const bluePlayerGoldDiffEarly = playerObjects[bluePartId].GoldAtEarly - playerObjects[redPartId].GoldAtEarly;
          playerObjects[bluePartId]['GoldDiffEarly'] = bluePlayerGoldDiffEarly;
          playerObjects[redPartId]['GoldDiffEarly'] = (bluePlayerGoldDiffEarly === 0) ? 0 : (bluePlayerGoldDiffEarly * -1);
          const bluePlayerCsDiffEarly = playerObjects[bluePartId].CsAtEarly - playerObjects[redPartId].CsAtEarly;
          playerObjects[bluePartId]['CsDiffEarly'] = bluePlayerCsDiffEarly;
          playerObjects[redPartId]['CsDiffEarly'] = (bluePlayerCsDiffEarly === 0) ? 0 : (bluePlayerCsDiffEarly * -1);
          const bluePlayerXpDiffEarly = playerObjects[bluePartId].XpAtEarly - playerObjects[redPartId].XpAtEarly;
          playerObjects[bluePartId]['XpDiffEarly'] = bluePlayerXpDiffEarly;
          playerObjects[redPartId]['XpDiffEarly'] = (bluePlayerXpDiffEarly === 0) ? 0 : (bluePlayerXpDiffEarly * -1);
          const bluePlayerJgCsDiffEarly = playerObjects[bluePartId].JungleCsAtEarly - playerObjects[redPartId].JungleCsAtEarly;
          playerObjects[bluePartId]['JungleCsDiffEarly'] = bluePlayerJgCsDiffEarly;
          playerObjects[redPartId]['JungleCsDiffEarly'] = (bluePlayerJgCsDiffEarly === 0) ? 0 : (bluePlayerJgCsDiffEarly * -1);
        }
        if (gameDuration >= MINUTE.MID * MINUTE_SECONDS) {
          const bluePlayerGoldDiffMid = playerObjects[bluePartId].GoldAtMid - playerObjects[redPartId].GoldAtMid;
          playerObjects[bluePartId]['GoldDiffMid'] = bluePlayerGoldDiffMid;
          playerObjects[redPartId]['GoldDiffMid'] = (bluePlayerGoldDiffMid === 0) ? 0 : (bluePlayerGoldDiffMid * -1);
          const bluePlayerCsDiffMid = playerObjects[bluePartId].CsAtMid - playerObjects[redPartId].CsAtMid;
          playerObjects[bluePartId]['CsDiffMid'] = bluePlayerCsDiffMid;
          playerObjects[redPartId]['CsDiffMid'] = (bluePlayerCsDiffMid === 0) ? 0 : (bluePlayerCsDiffMid * -1);
          const bluePlayerXpDiffMid = playerObjects[bluePartId].XpAtMid - playerObjects[redPartId].XpAtMid;
          playerObjects[bluePartId]['XpDiffMid'] = bluePlayerXpDiffMid;
          playerObjects[redPartId]['XpDiffMid'] = (bluePlayerXpDiffMid === 0) ? 0 : (bluePlayerXpDiffMid * -1);
          const bluePlayerJgCsDiffMid = playerObjects[bluePartId].JungleCsAtMid - playerObjects[redPartId].JungleCsAtMid;
          playerObjects[bluePartId]['JungleCsDiffMid'] = bluePlayerJgCsDiffMid;
          playerObjects[redPartId]['JungleCsDiffMid'] = (bluePlayerJgCsDiffMid === 0) ? 0 : (bluePlayerJgCsDiffMid * -1);
        }
        const damagePerMinuteDiff = parseFloat((playerObjects[bluePartId].DamagePerMinute - playerObjects[redPartId].DamagePerMinute).toFixed(2));
        playerObjects[bluePartId]['DamagePerMinuteDiff'] = damagePerMinuteDiff;
        playerObjects[redPartId]['DamagePerMinuteDiff'] = (damagePerMinuteDiff === 0) ? 0 : (damagePerMinuteDiff * -1);
      }
      //#endregion

      // 2.3) - Merge teamItem + playerItem (especially with the Diffs)
      for (const partId in playerObjects) {
        const teamId = teamIdByPartId[partId];
        teamObjects[teamId]['Players'][partId] = playerObjects[partId];
      }
      matchObject['Teams'] = teamObjects;

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

// -------------- FUNCTIONS

/**
 * Gets the accurate GameDuration in seconds.
 * @param {Array} participantArray
 * @return {number}
 */
const processGameDuration = (participantArray) => {
  let maxValue = 0;
  for (const participantDto of participantArray) {
    maxValue = Math.max(maxValue, participantDto.timePlayed);
  }
  return maxValue;
}

/**
 * Takes riotMatchObject's game version (i.e. "10.20.337.6704") and only looks at the Major.Minor (returns "10.20")
 * @param {string} patchStr 
 */
const getPatch = (patchStr) => {
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
const updateBaronDuration = (thisPatch) => {
  return (isPatch1LaterThanPatch2(thisPatch, BARON_DURATION.PATCH_CHANGE)) ?
    BARON_DURATION.CURRENT : BARON_DURATION.OLD;
}

/**
 * returns the Team Gold at the given timestamp. Does a linear approximation in between seconds
 * @param {number} timestamp        Expressed in seconds
 * @param {Array} timelineList      List of events from the Riot Timeline API Request
 * @param {string} teamId           "100" == Blue, "200" == Red
 */
const teamGoldAtTimeStamp = (timestamp, timelineList, teamId) => {
  const timeStampMinute = Math.floor(timestamp / MINUTE_SECONDS);
  const timeStampSeconds = timestamp % MINUTE_SECONDS;
  if ((timeStampMinute + 1) >= timelineList.length) { return null; }

  // Take team gold at marked minute, and from minute + 1. Average them.
  const teamGoldAtMinute = (teamId == TEAM_ID.BLUE) ? timelineList[timeStampMinute]['BlueTeamGold'] : timelineList[timeStampMinute]['RedTeamGold'];
  const teamGoldAtMinutePlus1 = (teamId == TEAM_ID.BLUE) ? timelineList[timeStampMinute + 1]['BlueTeamGold'] : timelineList[timeStampMinute + 1]['RedTeamGold'];
  const goldPerSecond = (teamGoldAtMinutePlus1 - teamGoldAtMinute) / MINUTE_SECONDS;
  return (teamGoldAtMinute + Math.floor((goldPerSecond * timeStampSeconds)));
}

/**
 * Modifies the timelineList to compute the Power Play of each Baron event
 * Returns nothing.
 * @param {Array} baronObjectiveMinuteIndices   A list of indices where a Baron was taken in the Timeline
 * @param {Array} timelineList                  List of events from the Riot Timeline API Request
 * @param {string} patch                        Patch of what the event took place in
 */
const computeBaronPowerPlay = (baronObjectiveMinuteIndices, timelineList, patch) => {
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