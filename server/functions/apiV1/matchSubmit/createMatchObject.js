/*  Import dependency modules */
import {
    TEAM_ID,
    MINUTE,
    BARON_DURATION,
} from '../../../services/constants';
import { getDDragonVersion } from '../../../services/ddragonVersion';
import { getRiotMatchData } from '../dependencies/awsLambdaHelper';
import { 
    getProfileHashId,
    getTeamHashId,
    isPatch1LaterThanPatch2
} from '../dependencies/global';

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
            const riotMatchObject = await getRiotMatchData(matchId);
            const matchDataRiotJson = riotMatchObject['Data'];
            const matchTimelineRiotJson = riotMatchObject['Timeline'];

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
            matchObject['DatePlayed'] = matchDataRiotJson.gameCreation;
            matchObject['GameDuration'] = matchDataRiotJson.gameDuration;
            const patch = await getPatch(matchDataRiotJson.gameVersion);
            matchObject['GamePatchVersion'] = patch;
            matchObject['DDragonVersion'] = await getDDragonVersion(patch);

            // #region 2.1) - Teams+Players
            const teamItems = {}; // teamId (100 or 200) -> teamData {}
            const playerItems = {}; // participantId -> playerData {}
            // We will merge these two Items at 2.3)
            const teamIdByPartId = {}; // Mapping participantId -> teamId in timeline
            const partIdByTeamIdAndRole = {};
            for (const teamRiotObject of matchDataRiotJson.teams) {
                const teamData = {};
                const teamId = teamRiotObject.teamId; // 100 === BLUE, 200 === RED
                partIdByTeamIdAndRole[teamId] = {};
                if (teamId == TEAM_ID.BLUE) {
                    teamData['TeamHId'] = getTeamHashId(matchTeamsSetupObject['BlueTeam']['TeamPId']);
                }
                else if (teamId == TEAM_ID.RED) {
                    teamData['TeamHId'] = getTeamHashId(matchTeamsSetupObject['RedTeam']['TeamPId']);
                }
                if (teamRiotObject.win === 'Win') {
                    teamData['Win'] = true;
                }
                else {
                    teamData['Win'] = false;
                }
                teamData['Towers'] = teamRiotObject.towerKills;
                teamData['Inhibitors'] = teamRiotObject.inhibitorKills;
                teamData['Barons'] = teamRiotObject.baronKills;
                teamData['Dragons'] = []; // Will be built upon in Timeline
                teamData['Heralds'] = teamRiotObject.riftHeraldKills;
                // Bans
                if (teamId == TEAM_ID.BLUE) {
                    teamData['Bans'] = matchTeamsSetupObject['BlueTeam']['Bans'];
                }
                else if (teamId == TEAM_ID.RED) {
                    teamData['Bans'] = matchTeamsSetupObject['RedTeam']['Bans'];
                }
                // ----------
                teamData['FirstTower'] = teamRiotObject.firstTower;
                teamData['FirstBlood'] = teamRiotObject.firstBlood;
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
                for (const participantRiotObject of matchDataRiotJson.participants) {
                    const playerData = {}
                    if (participantRiotObject.teamId === teamId) {
                        const partId = participantRiotObject.participantId;
                        teamIdByPartId[partId] = teamId;
                        const pStatsRiotObject = participantRiotObject.stats;
                        const profilePId = profileObjByChampId[participantRiotObject.championId]['PId'];
                        playerData['ProfileHId'] = getProfileHashId(profilePId);
                        playerData['ParticipantId'] = partId;
                        const champRole = profileObjByChampId[participantRiotObject.championId]['Role'];
                        playerData['Role'] = champRole;
                        partIdByTeamIdAndRole[teamId][champRole] = partId;
                        playerData['ChampLevel'] = pStatsRiotObject.champLevel;
                        playerData['ChampId'] = participantRiotObject.championId;
                        playerData['Spell1Id'] = participantRiotObject.spell1Id;
                        playerData['Spell2Id'] = participantRiotObject.spell2Id;
                        playerData['Kills'] = pStatsRiotObject.kills;
                        teamKills += pStatsRiotObject.kills;
                        playerData['Deaths'] = pStatsRiotObject.deaths;
                        teamDeaths += pStatsRiotObject.deaths;
                        playerData['Assists'] = pStatsRiotObject.assists;
                        teamAssists += pStatsRiotObject.assists;
                        playerData['Gold'] = pStatsRiotObject.goldEarned;
                        teamGold += pStatsRiotObject.goldEarned;
                        playerData['TotalDamageDealt'] = pStatsRiotObject.totalDamageDealtToChampions;
                        teamDamageDealt += pStatsRiotObject.totalDamageDealtToChampions;
                        playerData['DamagePerMinute'] = parseFloat((pStatsRiotObject.totalDamageDealtToChampions / (matchDataRiotJson.gameDuration / 60)).toFixed(2));
                        playerData['PhysicalDamageDealt'] = pStatsRiotObject.physicalDamageDealtToChampions;
                        playerData['MagicDamageDealt'] = pStatsRiotObject.magicDamageDealtToChampions;
                        playerData['TrueDamageDealt'] = pStatsRiotObject.trueDamageDealtToChampions;
                        let totalCS = pStatsRiotObject.neutralMinionsKilled + pStatsRiotObject.totalMinionsKilled;
                        playerData['CreepScore'] = totalCS;
                        teamCreepScore += totalCS;
                        playerData['CsInTeamJungle'] = pStatsRiotObject.neutralMinionsKilledTeamJungle;
                        playerData['CsInEnemyJungle'] = pStatsRiotObject.neutralMinionsKilledEnemyJungle;
                        playerData['VisionScore'] = pStatsRiotObject.visionScore;
                        teamVisionScore += pStatsRiotObject.visionScore;
                        playerData['WardsPlaced'] = pStatsRiotObject.wardsPlaced;
                        teamWardsPlaced += pStatsRiotObject.wardsPlaced;
                        playerData['ControlWardsBought'] = pStatsRiotObject.visionWardsBoughtInGame;
                        teamControlWardsBought += pStatsRiotObject.visionWardsBoughtInGame;
                        playerData['WardsCleared'] = pStatsRiotObject.wardsKilled;
                        teamWardsCleared += pStatsRiotObject.wardsKilled;
                        playerData['FirstBloodKill'] = false; // Logic in Timeline
                        playerData['FirstBloodAssist'] = false; // Logic in Timeline
                        playerData['FirstBloodVictim'] = false; // Logic in Timeline
                        playerData['FirstTower'] = (pStatsRiotObject.firstTowerKill || pStatsRiotObject.firstTowerAssist);
                        playerData['SoloKills'] = 0; // Logic in Timeline
                        playerData['PentaKills'] = pStatsRiotObject.pentaKills;
                        playerData['QuadraKills'] = pStatsRiotObject.quadraKills - pStatsRiotObject.pentaKills;
                        playerData['TripleKills'] = pStatsRiotObject.tripleKills - pStatsRiotObject.quadraKills;
                        playerData['DoubleKills'] = pStatsRiotObject.doubleKills - pStatsRiotObject.tripleKills;
                        playerData['DamageToTurrets'] = pStatsRiotObject.damageDealtToTurrets;
                        playerData['DamageToObjectives'] = pStatsRiotObject.damageDealtToObjectives;
                        playerData['TotalHeal'] = pStatsRiotObject.totalHeal;
                        playerData['TimeCrowdControl'] = pStatsRiotObject.timeCCingOthers;
                        playerData['ItemsFinal'] = [pStatsRiotObject.item0, pStatsRiotObject.item1, 
                            pStatsRiotObject.item2, pStatsRiotObject.item3, pStatsRiotObject.item4, 
                            pStatsRiotObject.item5, pStatsRiotObject.item6];
                        playerData['ItemBuild'] = {}; // Logic in Timeline
                        // Runes
                        let playerRunes = {}
                        playerRunes['PrimaryPathId'] = pStatsRiotObject.perkPrimaryStyle;
                        playerRunes['PrimaryKeystoneId'] = pStatsRiotObject.perk0;
                        playerRunes['PrimarySlot0Var1'] = pStatsRiotObject.perk0Var1;
                        playerRunes['PrimarySlot0Var2'] = pStatsRiotObject.perk0Var2;
                        playerRunes['PrimarySlot0Var3'] = pStatsRiotObject.perk0Var3;
                        playerRunes['PrimarySlot1Id'] = pStatsRiotObject.perk1;
                        playerRunes['PrimarySlot1Var1'] = pStatsRiotObject.perk1Var1;
                        playerRunes['PrimarySlot1Var2'] = pStatsRiotObject.perk1Var2;
                        playerRunes['PrimarySlot1Var3'] = pStatsRiotObject.perk1Var3;
                        playerRunes['PrimarySlot2Id'] = pStatsRiotObject.perk2;
                        playerRunes['PrimarySlot2Var1'] = pStatsRiotObject.perk2Var1;
                        playerRunes['PrimarySlot2Var2'] = pStatsRiotObject.perk2Var2;
                        playerRunes['PrimarySlot2Var3'] = pStatsRiotObject.perk2Var3;
                        playerRunes['PrimarySlot3Id'] = pStatsRiotObject.perk3;
                        playerRunes['PrimarySlot3Var1'] = pStatsRiotObject.perk3Var1;
                        playerRunes['PrimarySlot3Var2'] = pStatsRiotObject.perk3Var2;
                        playerRunes['PrimarySlot3Var3'] = pStatsRiotObject.perk3Var3;
                        playerRunes['SecondarySlot1Id'] = pStatsRiotObject.perk4;
                        playerRunes['SecondarySlot1Var1'] = pStatsRiotObject.perk4Var1;
                        playerRunes['SecondarySlot1Var2'] = pStatsRiotObject.perk4Var2;
                        playerRunes['SecondarySlot1Var3'] = pStatsRiotObject.perk4Var3;
                        playerRunes['SecondarySlot2Id'] = pStatsRiotObject.perk5;
                        playerRunes['SecondarySlot2Var1'] = pStatsRiotObject.perk5Var1;
                        playerRunes['SecondarySlot2Var2'] = pStatsRiotObject.perk5Var2;
                        playerRunes['SecondarySlot2Var3'] = pStatsRiotObject.perk5Var3;
                        playerRunes['ShardSlot0Id'] = pStatsRiotObject.statPerk0;
                        playerRunes['ShardSlot1Id'] = pStatsRiotObject.statPerk1;
                        playerRunes['ShardSlot2Id'] = pStatsRiotObject.statPerk2;
                        playerData['Runes'] = playerRunes;
                        playerData['SkillOrder'] = []; // Logic will be done in Timeline
                        // Add to playerItem. Phew
                        playerItems[participantRiotObject.participantId] = playerData;
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
                if (matchDataRiotJson.gameDuration >= MINUTE.EARLY * 60) {
                    teamData['CsAtEarly'] = 0;      // Logic in Timeline
                    teamData['GoldAtEarly'] = 0;    // Logic in Timeline
                    teamData['XpAtEarly'] = 0;      // Logic in Timeline
                }
                if (matchDataRiotJson.gameDuration >= MINUTE.MID * 60) {
                    teamData['CsAtMid'] = 0;        // Logic in Timeline
                    teamData['GoldAtMid'] = 0;      // Logic in Timeline
                    teamData['XpAtMid'] = 0;        // Logic in Timeline
                }
                teamItems[teamRiotObject.teamId] = teamData;
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
            const allItemBuilds = {'1': [], '2': [], '3': [], '4': [], '5': [], '6': [], '7': [], '8': [], '9': [], '10': []};
            // We want to keep track of number of kills/assists at Early and at Mid for each Player. Key is the 'participantId'
            const playerKillsAtEarly = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0, '7': 0, '8': 0, '9': 0, '10': 0 };
            const playerAssistsAtEarly = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0, '7': 0, '8': 0, '9': 0, '10': 0 };
            const playerKillsAtMid = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0, '7': 0, '8': 0, '9': 0, '10': 0 };
            const playerAssistsAtMid = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0, '7': 0, '8': 0, '9': 0, '10': 0 };
            // Since we want to calculate baron power play AFTER the total team gold is calculated,
            // we want to store which indices in the timelineList of each minute and what index in the eventsList
            const baronObjectiveMinuteIndex = {};
            // Key: minute -> Value: index in ['Events']
            for (let minute = 0; minute < matchTimelineRiotJson.frames.length; minute++) {
                const minuteTimelineItem = {};
                const frameRiotObject = matchTimelineRiotJson.frames[minute];
                let blueTeamGold = 0;
                let redTeamGold = 0;
                for (const participantFrameRiotObject of Object.values(frameRiotObject.participantFrames)) {
                    const participantId = participantFrameRiotObject.participantId;
                    const thisTeamId = teamIdByPartId[participantId];
                    if (thisTeamId == TEAM_ID.BLUE) {
                        blueTeamGold += participantFrameRiotObject.totalGold;
                    }
                    else if (thisTeamId == TEAM_ID.RED) {
                        redTeamGold += participantFrameRiotObject.totalGold;
                    }
                    // playerData: EARLY_MINUTE and MID_MINUTE
                    if ((minute === MINUTE.EARLY && matchDataRiotJson.gameDuration >= MINUTE.EARLY * 60) || 
                        (minute === MINUTE.MID && matchDataRiotJson.gameDuration >= MINUTE.MID * 60)) {
                        const type = (minute === MINUTE.EARLY) ? "Early" : "Mid";
                        playerItems[participantId]['GoldAt'+type] = participantFrameRiotObject.totalGold;
                        teamItems[thisTeamId]['GoldAt'+type] += participantFrameRiotObject.totalGold;
                        const playerCsAt = participantFrameRiotObject.minionsKilled + participantFrameRiotObject.jungleMinionsKilled;
                        playerItems[participantId]['CsAt'+type] = playerCsAt;
                        teamItems[thisTeamId]['CsAt'+type] += playerCsAt;
                        playerItems[participantId]['XpAt'+type] = participantFrameRiotObject.xp;
                        teamItems[thisTeamId]['XpAt'+type] += participantFrameRiotObject.xp;
                        playerItems[participantId]['JungleCsAt'+type] = participantFrameRiotObject.jungleMinionsKilled;
                    }
                }
                minuteTimelineItem['MinuteStamp'] = minute;
                minuteTimelineItem['BlueTeamGold'] = blueTeamGold;
                minuteTimelineItem['RedTeamGold'] = redTeamGold;
                // Looping through Events
                const eventsList = [];
                for (const riotEventObject of frameRiotObject.events) {
                    const eventItem = {};
                    // Only Tower, Inhibitor, Dragon, Baron, Herald, and Kills are added to eventData
                    if (riotEventObject.type === 'ELITE_MONSTER_KILL') {
                        const teamId = teamIdByPartId[riotEventObject.killerId];
                        eventItem['TeamId'] = teamId;
                        eventItem['Timestamp'] = riotEventObject.timestamp;
                        eventItem['KillerId'] = riotEventObject.killerId;
                        if (riotEventObject.monsterType === 'DRAGON') {
                            eventItem['EventType'] = 'Dragon';
                            const getDragonString = {
                                'AIR_DRAGON': 'Cloud',
                                'FIRE_DRAGON': 'Infernal',
                                'EARTH_DRAGON': 'Mountain',
                                'WATER_DRAGON': 'Ocean',
                                'ELDER_DRAGON': 'Elder'
                            };
                            const dragonString = getDragonString[riotEventObject.monsterSubType];
                            eventItem['EventCategory'] = dragonString;
                            // playerData: Dragon types
                            teamItems[teamId]['Dragons'].push(dragonString);
                        }
                        else if (riotEventObject.monsterType === 'BARON_NASHOR') {
                            eventItem['EventType'] = 'Baron';
                            baronObjectiveMinuteIndex[minute] = eventsList.length; // We'll add to eventsList anyways
                        }
                        else if (riotEventObject.monsterType === 'RIFTHERALD') {
                            eventItem['EventType'] = 'Herald';
                        }
                        else {
                            // Put some placeholder mystery here in case there's a future monster
                            eventItem['EventType'] = 'MYSTERIOUS MONSTER';
                        }
                    }
                    else if (riotEventObject.type === 'BUILDING_KILL') {
                        eventItem['TeamId'] = (riotEventObject.teamId == TEAM_ID.BLUE) 
                            ? parseInt(TEAM_ID.RED) : parseInt(TEAM_ID.BLUE);   
                        // FROM RIOT API, THE ABOVE IS TEAM_ID OF TOWER DESTROYED. NOT KILLED (which is what we intend)
                        eventItem['Timestamp'] = riotEventObject.timestamp;
                        eventItem['KillerId'] = riotEventObject.killerId;
                        if (riotEventObject.assistingParticipantIds.length > 0) {
                            eventItem['AssistIds'] = riotEventObject.assistingParticipantIds;
                        }
                        const getLaneString = {
                            'TOP_LANE': 'Top',
                            'MID_LANE': 'Middle',
                            'BOT_LANE': 'Bottom'
                        };
                        eventItem['Lane'] = getLaneString[riotEventObject.laneType];
                        if (riotEventObject.buildingType === 'TOWER_BUILDING') {
                            eventItem['EventType'] = 'Tower';
                            let getTowerType = {
                                'OUTER_TURRET': 'Outer',
                                'INNER_TURRET': 'Inner',
                                'BASE_TURRET': 'Base',
                                'NEXUS_TURRET': 'Nexus'
                            };
                            eventItem['EventCategory'] = getTowerType[riotEventObject.towerType];
                        }
                        else if (riotEventObject.buildingType === 'INHIBITOR_BUILDING') {
                            eventItem['EventType'] = 'Inhibitor';
                        }
                        else {
                            // Put some placeholder mystery here in case there's a future Building
                            eventItem['EventType'] = 'NEW BUILDING';
                        }
                    }
                    else if (riotEventObject.type === 'CHAMPION_KILL') {
                        const killerId = riotEventObject.killerId;
                        const teamId = teamIdByPartId[killerId];
                        eventItem['TeamId'] = teamId
                        eventItem['Timestamp'] = riotEventObject.timestamp;
                        eventItem['KillerId'] = killerId;
                        eventItem['PositionX'] = riotEventObject.position.x;
                        eventItem['PositionY'] = riotEventObject.position.y;
                        const victimId = riotEventObject.victimId;
                        eventItem['VictimId'] = victimId;
                        eventItem['EventType'] = 'Kill';
                        // playerData: Solo Kills
                        if (riotEventObject.assistingParticipantIds.length === 0 && killerId != 0) {
                            playerItems[killerId]['SoloKills']++;
                        }
                        else {
                            eventItem['AssistIds'] = riotEventObject.assistingParticipantIds;
                        }
                        // playerData: First Blood
                        if (!firstBloodFound && killerId != 0 && victimId != 0) {
                            playerItems[killerId]['FirstBloodKill'] = true;
                            riotEventObject.assistingParticipantIds.forEach(function(assistPId) {
                                playerItems[assistPId]['FirstBloodAssist'] = true;
                            });
                            playerItems[victimId]['FirstBloodVictim'] = true;
                            firstBloodFound = true;
                        }
                        // playerData: KillsAtEarly/KillsAtMid
                        if (minute < MINUTE.EARLY) {
                            playerKillsAtEarly[killerId]++;
                            for (const assistId of riotEventObject.assistingParticipantIds) {
                                playerAssistsAtEarly[assistId]++;
                            }
                        }
                        if (minute < MINUTE.MID) {
                            playerKillsAtMid[killerId]++;
                            for (const assistId of riotEventObject.assistingParticipantIds) {
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
                    else if (riotEventObject.type === 'ITEM_PURCHASED') {
                        const itemEvent = {
                            'MinuteStamp': minute - 1, // Apparently a minute after...
                            'ItemId': riotEventObject.itemId,
                            'Bought': true,
                        };
                        allItemBuilds[riotEventObject.participantId].push(itemEvent);
                    }
                    else if (riotEventObject.type === 'ITEM_SOLD') {
                        const itemEvent = {
                            'MinuteStamp': minute - 1, // Apparently a minute after...
                            'ItemId': riotEventObject.itemId,
                            'Bought': false,
                        }
                        allItemBuilds[riotEventObject.participantId].push(itemEvent);
                    }
                    else if (riotEventObject.type === 'ITEM_UNDO') {
                        // Based on the API, I could just remove the last Item Build event
                        allItemBuilds[riotEventObject.participantId].pop();
                    }
                    else if (riotEventObject.type === 'SKILL_LEVEL_UP') {
                        // playerData['Skillorder']
                        const getSkillLetter = { '1': 'Q', '2': 'W', '3': 'E', '4': 'R' };
                        const skillValue = riotEventObject.skillSlot;
                        if (skillValue in getSkillLetter) {
                            playerItems[riotEventObject.participantId]['SkillOrder']
                                .push(getSkillLetter[riotEventObject.skillSlot]);
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
                if (matchDataRiotJson.gameDuration >= MINUTE.EARLY * 60) {
                    playerItems[participantId]['KillsAtEarly'] = playerKillsAtEarly[participantId];
                    playerItems[participantId]['AssistsAtEarly'] = playerAssistsAtEarly[participantId];
                }
                if (matchDataRiotJson.gameDuration >= MINUTE.MID * 60) {
                    playerItems[participantId]['KillsAtMid'] = playerKillsAtMid[participantId];
                    playerItems[participantId]['AssistsAtMid'] = playerAssistsAtMid[participantId];
                }
            }
            // Calculate Diff@Early and Mid for Teams
            if (matchDataRiotJson.gameDuration >= MINUTE.EARLY * 60) {
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
            if (matchDataRiotJson.gameDuration >= MINUTE.MID * 60) {
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
            for (const partId in allItemBuilds) {
                const playerItemBuild = {};
                let currMinute = 0;
                let itemBuildsByMinute = [];
                allItemBuilds[partId].forEach(function(itemEvent) {
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
                playerItems[partId]['ItemBuild'] = playerItemBuild;
            }
            // Calculate Diff based on Roles for Players
            for (const role in partIdByTeamIdAndRole[TEAM_ID.BLUE]) {
                const bluePartId = partIdByTeamIdAndRole[TEAM_ID.BLUE][role];
                const redPartId = partIdByTeamIdAndRole[TEAM_ID.RED][role];
                if (matchDataRiotJson.gameDuration >= MINUTE.EARLY * 60) {
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
                if (matchDataRiotJson.gameDuration >= MINUTE.MID * 60) {
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
                message: `Function "convertRiotToLhgObject" Failed`,
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
    const teamGoldAtMinutePlus1 = (teamId == TEAM_ID.BLUE) ? timelineList[timeStampMinute+1]['BlueTeamGold'] : timelineList[timeStampMinute+1]['RedTeamGold'];
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
    return new Promise(function(resolve, reject) {
        try {
            const baronDuration = updateBaronDuration(patch); // in seconds
            Object.keys(baronObjectiveMinuteIndices).forEach(function(minute) {
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