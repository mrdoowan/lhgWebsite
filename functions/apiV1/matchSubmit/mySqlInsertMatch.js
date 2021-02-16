/*  Import dependency modules */

import {
    TEAM_STRING,
    MINUTE,
} from '../../../services/Constants';
import { dynamoDbGetItem } from '../dependencies/dynamoDbHelper';
import { 
    getProfilePIdFromHash,
    getTeamPIdFromHash
} from '../dependencies/global';
import { mySqlInsertQuery } from '../dependencies/mySqlHelper';

/**
 * Takes the LHG Match object and inserts into LHG's MySQL tables
 * @param {object} matchDbObject 
 * @param {object} matchSubmitObject 
 */
export default mySqlInsertMatch = async (newMatchDbObject, matchSetupObject) => {
    try {
        // 1) MatchStats
        const blueTeamPId = getTeamPIdFromHash(newMatchDbObject['Teams'][TEAM_STRING.BLUE]['TeamHId']);
        const redTeamPId = getTeamPIdFromHash(newMatchDbObject['Teams'][TEAM_STRING.RED]['TeamHId']);
        const insertMatchStatsColumn = {
            'riotMatchId': matchSetupObject['RiotMatchId'],
            'seasonPId': matchSetupObject['SeasonPId'],
            'tournamentPId': matchSetupObject['TournamentPId'],
            'tournamentType': (await dynamoDbGetItem('Tournament', 'TournamentPId', matchSetupObject['TournamentPId']))['Information']['TournamentType'],
            'blueTeamPId': blueTeamPId,
            'redTeamPId': redTeamPId,
            'duration': newMatchDbObject.GameDuration,
            'patch': newMatchDbObject.GamePatchVersion,
            'datePlayed': newMatchDbObject.DatePlayed
        };
        await mySqlInsertQuery(insertMatchStatsColumn, 'MatchStats');

        // 2) TeamStats + PlayerStats + BannedChamps
        // 2.1) TeamStats
        for (let i = 0; i < Object.keys(newMatchDbObject['Teams']).length; ++i) {
            const teamSide = Object.keys(newMatchDbObject['Teams'])[i]; // "100" or "200"
            const teamObject = newMatchDbObject['Teams'][teamSide];
            const durationByMinute = newMatchDbObject.GameDuration / 60;
            const thisTeamPId = (teamSide == TEAM_STRING.BLUE) ? blueTeamPId : redTeamPId;
            const enemyTeamPId = (teamSide == TEAM_STRING.BLUE) ? redTeamPId : blueTeamPId;
            const insertTeamStatsColumn = {
                'riotMatchId': matchSetupObject['RiotMatchId'],
                'teamPId': thisTeamPId,
                'side': TEAM_STRING.SIDE[teamSide],
                'win': teamObject.Win,
                'dmgDealtPerMin': (teamObject.TeamDamageDealt / durationByMinute).toFixed(2),
                'goldPerMin': (teamObject.TeamGold / durationByMinute).toFixed(2),
                'csPerMin': (teamObject.TeamCreepScore / durationByMinute).toFixed(2),
                'vsPerMin': (teamObject.TeamVisionScore / durationByMinute).toFixed(2),
                'firstBlood': teamObject.FirstBlood,
                'firstTower': teamObject.FirstTower,
                'totalKills': teamObject.TeamKills,
                'totalDeaths': teamObject.TeamDeaths,
                'totalAssists': teamObject.TeamAssists,
                'totalTowers': teamObject.Towers,
                'totalDragons': teamObject.Dragons.length,
                'totalHeralds': teamObject.Heralds,
                'totalBarons': teamObject.Barons,
                'totalDamageDealt': teamObject.TeamDamageDealt,
                'totalGold': teamObject.TeamGold,
                'totalCreepScore': teamObject.TeamCreepScore,
                'totalVisionScore': teamObject.TeamVisionScore,
                'totalWardsPlaced': teamObject.TeamWardsPlaced,
                'totalControlWardsBought': teamObject.TeamControlWardsBought,
                'totalWardsCleared': teamObject.TeamWardsCleared
            };
            if (newMatchDbObject.GameDuration >= MINUTE.EARLY * 60) {
                insertTeamStatsColumn['goldAtEarly'] = teamObject.GoldAtEarly;
                insertTeamStatsColumn['goldDiffEarly'] = teamObject.GoldDiffEarly;
                insertTeamStatsColumn['csAtEarly'] = teamObject.CsAtEarly;
                insertTeamStatsColumn['csDiffEarly'] = teamObject.CsDiffEarly;
                insertTeamStatsColumn['xpAtEarly'] = teamObject.XpAtEarly;
                insertTeamStatsColumn['xpDiffEarly'] = teamObject.XpDiffEarly;
                insertTeamStatsColumn['killsAtEarly'] = teamObject.KillsAtEarly;
                insertTeamStatsColumn['killsDiffEarly'] = teamObject.KillsDiffEarly;
            }
            if (newMatchDbObject.GameDuration >= MINUTE.MID * 60) {
                insertTeamStatsColumn['goldAtMid'] = teamObject.GoldAtMid;
                insertTeamStatsColumn['goldDiffMid'] = teamObject.GoldDiffMid;
                insertTeamStatsColumn['csAtMid'] = teamObject.CsAtMid;
                insertTeamStatsColumn['csDiffMid'] = teamObject.CsDiffMid;
                insertTeamStatsColumn['xpAtMid'] = teamObject.XpAtMid;
                insertTeamStatsColumn['xpDiffMid'] = teamObject.XpDiffMid,
                insertTeamStatsColumn['killsAtMid'] = teamObject.KillsAtMid;
                insertTeamStatsColumn['killsDiffMid'] = teamObject.KillsDiffMid;
            }
            mySqlInsertQuery(insertTeamStatsColumn, 'TeamStats');

            // 2.2) BannedChamps
            const insertBannedChampsColumn = {
                'riotMatchId': matchSetupObject['RiotMatchId'],
                'sideBannedBy': TEAM_STRING.SIDE[teamSide],
                'teamBannedById': thisTeamPId,
                'teamBannedAgainstId': enemyTeamPId
            };
            for (let j = 0; j < teamObject.Bans.length; ++j) {
                const champId = teamObject.Bans[j]
                insertBannedChampsColumn['champId'] = champId;
                mySqlInsertQuery(insertBannedChampsColumn, 'BannedChamps');
            }

            // 2.3) PlayerStats
            for (let j = 0; j < Object.values(teamObject['Players']).length; ++j) {
                const playerObject = Object.values(teamObject['Players'])[j];
                const insertPlayerStatsColumn = {
                    'profilePId': getProfilePIdFromHash(playerObject.ProfileHId),
                    'riotMatchId': matchSetupObject['RiotMatchId'],
                    'teamPId': getTeamPIdFromHash(teamObject.TeamHId),
                    'side': TEAM_STRING.SIDE[teamSide],
                    'role': playerObject.Role,
                    'champId': playerObject.ChampId,
                    'win': teamObject.Win,
                    'kills': playerObject.Kills,
                    'deaths': playerObject.Deaths,
                    'assists': playerObject.Assists,
                    'dmgDealtPerMin': (playerObject.TotalDamageDealt / durationByMinute).toFixed(2),
                    'csPerMin': (playerObject.CreepScore / durationByMinute).toFixed(2),
                    'goldPerMin': (playerObject.Gold / durationByMinute).toFixed(2),
                    'vsPerMin': (playerObject.VisionScore / durationByMinute).toFixed(2),
                    'firstBloodKill': playerObject.FirstBloodKill,
                    'firstBloodAssist': playerObject.FirstBloodAssist,
                    'firstTower': playerObject.FirstTower,
                    'damageDealt': playerObject.TotalDamageDealt,
                    'gold': playerObject.Gold,
                    'creepScore': playerObject.CreepScore,
                    'visionScore': playerObject.VisionScore,
                    'wardsPlaced': playerObject.WardsPlaced,
                    'controlWardsBought': playerObject.ControlWardsBought,
                    'wardsCleared': playerObject.WardsCleared,
                    'soloKills': playerObject.SoloKills,
                    'doubleKills': playerObject.DoubleKills,
                    'tripleKills': playerObject.TripleKills,
                    'quadraKills': playerObject.QuadraKills,
                    'pentaKills': playerObject.PentaKills
                };
                if (newMatchDbObject.GameDuration >= MINUTE.EARLY * 60) {
                    insertPlayerStatsColumn['goldAtEarly'] = playerObject.GoldAtEarly;
                    insertPlayerStatsColumn['goldDiffEarly'] = playerObject.GoldDiffEarly;
                    insertPlayerStatsColumn['csAtEarly'] = playerObject.CsAtEarly;
                    insertPlayerStatsColumn['csDiffEarly'] = playerObject.CsDiffEarly;
                    insertPlayerStatsColumn['xpAtEarly'] = playerObject.XpAtEarly;
                    insertPlayerStatsColumn['xpDiffEarly'] = playerObject.XpDiffEarly;
                    insertPlayerStatsColumn['jungleCsAtEarly'] = playerObject.JungleCsAtEarly;
                    insertPlayerStatsColumn['jungleCsDiffEarly'] = playerObject.JungleCsDiffEarly;
                }
                if (newMatchDbObject.GameDuration >= MINUTE.MID * 60) {
                    insertPlayerStatsColumn['goldAtMid'] = playerObject.GoldAtMid;
                    insertPlayerStatsColumn['goldDiffMid'] = playerObject.GoldDiffMid;
                    insertPlayerStatsColumn['csAtMid'] = playerObject.CsAtMid;
                    insertPlayerStatsColumn['csDiffMid'] = playerObject.CsDiffMid;
                    insertPlayerStatsColumn['xpAtMid'] = playerObject.XpAtMid;
                    insertPlayerStatsColumn['xpDiffMid'] = playerObject.XpDiffMid;
                    insertPlayerStatsColumn['jungleCsAtMid'] = playerObject.JungleCsAtMid;
                    insertPlayerStatsColumn['jungleCsDiffMid'] = playerObject.JungleCsDiffMid;
                }
                mySqlInsertQuery(insertPlayerStatsColumn, 'PlayerStats');
            }
        }

        // 3.3) Objectives
        newMatchDbObject['Timeline'].forEach(function(minuteObject) {
            if ('Events' in minuteObject) {
                minuteObject['Events'].forEach(function(eventObject) {
                    if (['Tower','Inhibitor','Dragon','Baron','Herald'].includes(eventObject.EventType)) {
                        const insertObjectivesColumn = {
                            'riotMatchId': matchSetupObject['RiotMatchId'],
                            'teamPId': (eventObject.TeamId == TEAM_STRING.BLUE) ? blueTeamPId : redTeamPId,
                            'objectiveEvent': eventObject.EventType,
                            'timestamp': eventObject.Timestamp
                        };
                        if ('EventCategory' in eventObject) {
                            insertObjectivesColumn['objectiveCategory'] = eventObject.EventCategory;
                        }
                        if ('Lane' in eventObject) {
                            insertObjectivesColumn['lane'] = eventObject.Lane;
                        }
                        if ('BaronPowerPlay' in eventObject) {
                            insertObjectivesColumn['baronPowerPlay'] = eventObject.BaronPowerPlay;
                        }
                        mySqlInsertQuery(insertObjectivesColumn, 'Objectives');
                    }
                });
            }
        });

        // Confirm
        console.log(`MySQL: All data from '${newMatchDbObject.MatchPId}' inserted.`);
    }
    catch (error) {
        throw error;
    }
}