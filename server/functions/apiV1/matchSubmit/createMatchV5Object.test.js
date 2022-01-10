import { createDbMatchObject } from "./createMatchV5Object";

test('MatchV5 test object of Id 4037325211 (from: s2021agl Play-Ins)', async () => {
  const matchSetupObject = {
    "RiotMatchId": "4037325211",
    "Teams": {
        "BlueTeam": {
            "TeamName": "Stubby Gun",
            "Bans": [
                34,
                12,
                131,
                777,
                157
            ],
            "Players": [
                {
                    "Role": "Top",
                    "ChampId": 85,
                    "ProfileName": "Stubbyy"
                },
                {
                    "Role": "Jungle",
                    "ChampId": 2,
                    "ProfileName": "Gwordon"
                },
                {
                    "Role": "Middle",
                    "ChampId": 69,
                    "ProfileName": "AWRD"
                },
                {
                    "Role": "Bottom",
                    "ChampId": 21,
                    "ProfileName": "trioxide"
                },
                {
                    "Role": "Support",
                    "ChampId": 412,
                    "ProfileName": "FireStreakZ"
                }
            ]
        },
        "RedTeam": {
            "TeamName": "Sprouts",
            "Bans": [
                59,
                39,
                13,
                134,
                7
            ],
            "Players": [
                {
                    "Role": "Top",
                    "ChampId": 54,
                    "ProfileName": "Kobita"
                },
                {
                    "Role": "Jungle",
                    "ChampId": 78,
                    "ProfileName": "JetBlackxD"
                },
                {
                    "Role": "Middle",
                    "ChampId": 50,
                    "ProfileName": "Cicadaco"
                },
                {
                    "Role": "Bottom",
                    "ChampId": 875,
                    "ProfileName": "AfterDatBootay"
                },
                {
                    "Role": "Support",
                    "ChampId": 235,
                    "ProfileName": "HalfSumo"
                }
            ]
        }
    },
    "Invalid": false,
    "SeasonPId": 16,
    "TournamentPId": 31,
    "SeasonName": "Summer 2021 Aegis Guardians League",
    "SeasonShortName": "s2021agl",
    "TournamentName": "Summer 2021 Aegis Guardians League Regular Season"
  };
  try {
    const matchData = await createDbMatchObject('4037325211', matchSetupObject);
    // Base
    //expect(matchData.DatePlayed).toBe(1631316115329); // v5 now rounds to the 1000s
    expect(matchData.GameDuration).toBe(2096);
    expect(matchData.GamePatchVersion).toBe("11.18");
    // Teams (Blue)
    const blueTeamData = matchData.Teams[100];
    expect(blueTeamData.Barons).toBe(2);
    expect(blueTeamData.CsAtEarly).toBe(435);
    expect(blueTeamData.CsAtMid).toBe(750);
    expect(blueTeamData.CsDiffEarly).toBe(40);
    expect(blueTeamData.CsDiffMid).toBe(93);
    expect(blueTeamData.Dragons).toEqual(["Mountain", "Cloud", "Cloud"]);
    expect(blueTeamData.FirstBlood).toBe(false);
    expect(blueTeamData.FirstTower).toBe(true);
    expect(blueTeamData.GoldAtEarly).toBe(23654);
    expect(blueTeamData.GoldAtMid).toBe(43127);
    expect(blueTeamData.GoldDiffEarly).toBe(-914);
    expect(blueTeamData.GoldDiffMid).toBe(2479);
    expect(blueTeamData.Heralds).toBe(0);
    expect(blueTeamData.Inhibitors).toBe(1);
    expect(blueTeamData.KillsAtEarly).toBe(6);
    expect(blueTeamData.KillsAtMid).toBe(15);
    expect(blueTeamData.KillsDiffEarly).toBe(-1);
    expect(blueTeamData.KillsDiffMid).toBe(3);
    expect(blueTeamData.TeamAssists).toBe(67);
    expect(blueTeamData.TeamControlWardsBought).toBe(30);
    expect(blueTeamData.TeamCreepScore).toBe(942);
    expect(blueTeamData.TeamDamageDealt).toBe(99830);
    expect(blueTeamData.TeamDeaths).toBe(20);
    expect(blueTeamData.TeamGold).toBe(68194);
    expect(blueTeamData.TeamKills).toBe(34);
    expect(blueTeamData.TeamVisionScore).toBe(254);
    expect(blueTeamData.TeamWardsCleared).toBe(35);
    expect(blueTeamData.TeamWardsPlaced).toBe(97);
    expect(blueTeamData.Towers).toBe(8);
    expect(blueTeamData.Win).toBe(true);
    expect(blueTeamData.XpAtEarly).toBe(28134);
    expect(blueTeamData.XpAtMid).toBe(52164);
    expect(blueTeamData.XpDiffEarly).toBe(-344);
    expect(blueTeamData.XpDiffMid).toBe(3612);

    // Teams (Red)
    const redTeamData = matchData.Teams[200];
    expect(redTeamData.Barons).toBe(0);
    expect(redTeamData.CsAtEarly).toBe(395);
    expect(redTeamData.CsAtMid).toBe(657);
    expect(redTeamData.CsDiffEarly).toBe(-40);
    expect(redTeamData.CsDiffMid).toBe(-93);
    expect(redTeamData.Dragons).toEqual(["Infernal", "Cloud", "Cloud"]);
    expect(redTeamData.FirstBlood).toBe(true);
    expect(redTeamData.FirstTower).toBe(false);
    expect(redTeamData.GoldAtEarly).toBe(24568);
    expect(redTeamData.GoldAtMid).toBe(40648);
    expect(redTeamData.GoldDiffEarly).toBe(914);
    expect(redTeamData.GoldDiffMid).toBe(-2479);
    expect(redTeamData.Heralds).toBe(2);
    expect(redTeamData.Inhibitors).toBe(0);
    expect(redTeamData.KillsAtEarly).toBe(7);
    expect(redTeamData.KillsAtMid).toBe(12);
    expect(redTeamData.KillsDiffEarly).toBe(1);
    expect(redTeamData.KillsDiffMid).toBe(-3);
    expect(redTeamData.TeamAssists).toBe(34);
    expect(redTeamData.TeamControlWardsBought).toBe(25);
    expect(redTeamData.TeamCreepScore).toBe(814);
    expect(redTeamData.TeamDamageDealt).toBe(79032);
    expect(redTeamData.TeamDeaths).toBe(34);
    expect(redTeamData.TeamGold).toBe(57108);
    expect(redTeamData.TeamKills).toBe(20);
    expect(redTeamData.TeamVisionScore).toBe(225);
    expect(redTeamData.TeamWardsCleared).toBe(41);
    expect(redTeamData.TeamWardsPlaced).toBe(85);
    expect(redTeamData.Towers).toBe(3);
    expect(redTeamData.Win).toBe(false);
    expect(redTeamData.XpAtEarly).toBe(28478);
    expect(redTeamData.XpAtMid).toBe(48552);
    expect(redTeamData.XpDiffEarly).toBe(344);
    expect(redTeamData.XpDiffMid).toBe(-3612);

    // Blue Player 1
    const bluePlayerData = blueTeamData.Players[1];
    expect(bluePlayerData.Assists).toBe(12);
    expect(bluePlayerData.AssistsAtEarly).toBe(0);
    expect(bluePlayerData.AssistsAtMid).toBe(4);
    expect(bluePlayerData.ChampId).toBe(85);
    expect(bluePlayerData.ChampLevel).toBe(17);
    expect(bluePlayerData.ControlWardsBought).toBe(6);
    expect(bluePlayerData.CreepScore).toBe(213);
    expect(bluePlayerData.CsAtEarly).toBe(115);
    expect(bluePlayerData.CsAtMid).toBe(181);
    expect(bluePlayerData.CsDiffEarly).toBe(25);
    expect(bluePlayerData.CsDiffMid).toBe(34);
    expect(bluePlayerData.DamagePerMinute).toBe(735.43);
    expect(bluePlayerData.DamageToObjectives).toBe(11250);
    expect(bluePlayerData.DamageToTurrets).toBe(5326);
    expect(bluePlayerData.Deaths).toBe(3);
    expect(bluePlayerData.DoubleKills).toBe(1);
    expect(bluePlayerData.FirstBloodAssist).toBe(false);
    expect(bluePlayerData.FirstBloodKill).toBe(false);
    expect(bluePlayerData.FirstBloodVictim).toBe(true);
    expect(bluePlayerData.FirstTower).toBe(true);
    expect(bluePlayerData.Gold).toBe(14359);
    expect(bluePlayerData.GoldAtEarly).toBe(5353);
    expect(bluePlayerData.GoldAtMid).toBe(9279);
    expect(bluePlayerData.GoldDiffEarly).toBe(740);
    expect(bluePlayerData.GoldDiffMid).toBe(2040);
    expect(bluePlayerData.JungleCsAtEarly).toBe(0);
    expect(bluePlayerData.JungleCsAtMid).toBe(2);
    expect(bluePlayerData.JungleCsDiffEarly).toBe(0);
    expect(bluePlayerData.JungleCsDiffMid).toBe(-2);
    expect(bluePlayerData.Kills).toBe(6);
    expect(bluePlayerData.KillsAtEarly).toBe(1);
    expect(bluePlayerData.KillsAtMid).toBe(2);
    expect(bluePlayerData.MagicDamageDealt).toBe(24162);
    expect(bluePlayerData.PentaKills).toBe(0);
    expect(bluePlayerData.PhysicalDamageDealt).toBe(1454);
    expect(bluePlayerData.QuadraKills).toBe(0);
    const blueRunesData = bluePlayerData.Runes;
    expect(blueRunesData.PrimaryKeystoneId).toBe(8214);
    expect(blueRunesData.PrimaryPathId).toBe(8200);
    expect(blueRunesData.PrimarySlot0Var1).toBe(1532);
    expect(blueRunesData.PrimarySlot0Var2).toBe(0);
    expect(blueRunesData.PrimarySlot0Var3).toBe(0);
    expect(blueRunesData.PrimarySlot1Id).toBe(8275);
    expect(blueRunesData.PrimarySlot1Var1).toBe(8);
    expect(blueRunesData.PrimarySlot1Var2).toBe(0);
    expect(blueRunesData.PrimarySlot1Var3).toBe(0);
    expect(blueRunesData.PrimarySlot2Id).toBe(8233);
    expect(blueRunesData.PrimarySlot2Var1).toBe(25);
    expect(blueRunesData.PrimarySlot2Var2).toBe(10);
    expect(blueRunesData.PrimarySlot2Var3).toBe(0);
    expect(blueRunesData.PrimarySlot3Id).toBe(8236);
    expect(blueRunesData.PrimarySlot3Var1).toBe(48);
    expect(blueRunesData.PrimarySlot3Var2).toBe(0);
    expect(blueRunesData.PrimarySlot3Var3).toBe(0);
    expect(blueRunesData.SecondaryPathId).toBe(8100);
    expect(blueRunesData.SecondarySlot1Id).toBe(8139);
    expect(blueRunesData.SecondarySlot1Var1).toBe(764);
    expect(blueRunesData.SecondarySlot1Var2).toBe(0);
    expect(blueRunesData.SecondarySlot1Var3).toBe(0);
    expect(blueRunesData.SecondarySlot2Id).toBe(8135);
    expect(blueRunesData.SecondarySlot2Var1).toBe(3075);
    expect(blueRunesData.SecondarySlot2Var2).toBe(5);
    expect(blueRunesData.SecondarySlot2Var3).toBe(0);
    expect(blueRunesData.ShardSlot0Id).toBe(5005);
    expect(blueRunesData.ShardSlot1Id).toBe(5008);
    expect(blueRunesData.ShardSlot2Id).toBe(5003);
    expect(bluePlayerData.SkillOrder).toEqual(
      ["Q", "E", "W", "W", "W", "R", "W", "Q", "W", "Q", "R", "Q", "Q", "E", "E", "R", "E"]
    );
    expect(bluePlayerData.SoloKills).toBe(0);
    expect(bluePlayerData.Summoner1Id).toBe(4);
    expect(bluePlayerData.Summoner2Id).toBe(12);
    expect(bluePlayerData.TimeCrowdControl).toBe(23);
    expect(bluePlayerData.TotalDamageDealt).toBe(25691);
    expect(bluePlayerData.TotalHeal).toBe(2854);
    expect(bluePlayerData.TripleKills).toBe(0);
    expect(bluePlayerData.TrueDamageDealt).toBe(75);
    expect(bluePlayerData.VisionScore).toBe(60);
    expect(bluePlayerData.WardsCleared).toBe(6);
    expect(bluePlayerData.WardsPlaced).toBe(16);
    expect(bluePlayerData.XpAtEarly).toBe(7327);
    expect(bluePlayerData.XpAtMid).toBe(12063);
    expect(bluePlayerData.XpDiffEarly).toBe(1147);
    expect(bluePlayerData.XpDiffMid).toBe(1647);
    expect(bluePlayerData.Summoner1Casts).toBe(3);
    expect(bluePlayerData.Summoner2Casts).toBe(5);
    expect(bluePlayerData.Spell1Casts).toBe(148);
    expect(bluePlayerData.Spell2Casts).toBe(41);
    expect(bluePlayerData.Spell3Casts).toBe(103);
    expect(bluePlayerData.Spell4Casts).toBe(7);
    expect(bluePlayerData.BountyLevel).toBe(2);
    expect(bluePlayerData.TotalHealsOnTeammates).toBe(0);
    expect(bluePlayerData.TotalDamageShieldedOnTeammates).toBe(0);
    expect(bluePlayerData.TotalTimeSpentDead).toBe(113);
    expect(bluePlayerData.ItemsPurchased).toBe(29);

    // Red Player 7
    const redPlayerData = redTeamData.Players[7];
    expect(redPlayerData.Assists).toBe(7);
    expect(redPlayerData.AssistsAtEarly).toBe(1);
    expect(redPlayerData.AssistsAtMid).toBe(3);
    expect(redPlayerData.ChampId).toBe(78);
    expect(redPlayerData.ChampLevel).toBe(15);
    expect(redPlayerData.ControlWardsBought).toBe(7);
    expect(redPlayerData.CreepScore).toBe(187);
    expect(redPlayerData.CsAtEarly).toBe(91);
    expect(redPlayerData.CsAtMid).toBe(157);
    expect(redPlayerData.CsDiffEarly).toBe(-11);
    expect(redPlayerData.CsDiffMid).toBe(-6);
    expect(redPlayerData.DamagePerMinute).toBe(349.32);
    expect(redPlayerData.DamageToObjectives).toBe(28699);
    expect(redPlayerData.DamageToTurrets).toBe(1094);
    expect(redPlayerData.Deaths).toBe(6);
    expect(redPlayerData.DoubleKills).toBe(0);
    expect(redPlayerData.FirstBloodAssist).toBe(false);
    expect(redPlayerData.FirstBloodKill).toBe(true);
    expect(redPlayerData.FirstBloodVictim).toBe(false);
    expect(redPlayerData.FirstTower).toBe(false);
    expect(redPlayerData.Gold).toBe(11732);
    expect(redPlayerData.GoldAtEarly).toBe(5464);
    expect(redPlayerData.GoldAtMid).toBe(8467);
    expect(redPlayerData.GoldDiffEarly).toBe(830);
    expect(redPlayerData.GoldDiffMid).toBe(-377);
    expect(redPlayerData.JungleCsAtEarly).toBe(86);
    expect(redPlayerData.JungleCsAtMid).toBe(134);
    expect(redPlayerData.JungleCsDiffEarly).toBe(6);
    expect(redPlayerData.JungleCsDiffMid).toBe(6);
    expect(redPlayerData.Kills).toBe(4);
    expect(redPlayerData.KillsAtEarly).toBe(2);
    expect(redPlayerData.KillsAtMid).toBe(2);
    expect(redPlayerData.MagicDamageDealt).toBe(1163);
    expect(redPlayerData.PentaKills).toBe(0);
    expect(redPlayerData.PhysicalDamageDealt).toBe(9992);
    expect(redPlayerData.QuadraKills).toBe(0);
    const redRunesData = redPlayerData.Runes;
    expect(redRunesData.PrimaryKeystoneId).toBe(8128);
    expect(redRunesData.PrimaryPathId).toBe(8100);
    expect(redRunesData.PrimarySlot0Var1).toBe(628);
    expect(redRunesData.PrimarySlot0Var2).toBe(13);
    expect(redRunesData.PrimarySlot0Var3).toBe(0);
    expect(redRunesData.PrimarySlot1Id).toBe(8126);
    expect(redRunesData.PrimarySlot1Var1).toBe(522);
    expect(redRunesData.PrimarySlot1Var2).toBe(0);
    expect(redRunesData.PrimarySlot1Var3).toBe(0);
    expect(redRunesData.PrimarySlot2Id).toBe(8138);
    expect(redRunesData.PrimarySlot2Var1).toBe(18);
    expect(redRunesData.PrimarySlot2Var2).toBe(0);
    expect(redRunesData.PrimarySlot2Var3).toBe(0);
    expect(redRunesData.PrimarySlot3Id).toBe(8135);
    expect(redRunesData.PrimarySlot3Var1).toBe(2314);
    expect(redRunesData.PrimarySlot3Var2).toBe(5);
    expect(redRunesData.PrimarySlot3Var3).toBe(0);
    expect(redRunesData.SecondaryPathId).toBe(8200);
    expect(redRunesData.SecondarySlot1Id).toBe(8234);
    expect(redRunesData.SecondarySlot1Var1).toBe(10889);
    expect(redRunesData.SecondarySlot1Var2).toBe(0);
    expect(redRunesData.SecondarySlot1Var3).toBe(0);
    expect(redRunesData.SecondarySlot2Id).toBe(8232);
    expect(redRunesData.SecondarySlot2Var1).toBe(11);
    expect(redRunesData.SecondarySlot2Var2).toBe(10);
    expect(redRunesData.SecondarySlot2Var3).toBe(0);
    expect(redRunesData.ShardSlot0Id).toBe(5008);
    expect(redRunesData.ShardSlot1Id).toBe(5008);
    expect(redRunesData.ShardSlot2Id).toBe(5002);
    expect(redPlayerData.SkillOrder).toEqual(
      ["Q", "E", "Q", "W", "Q", "R", "Q", "E", "Q", "E", "R", "E", "E", "W", "W"]
    );
    expect(redPlayerData.SoloKills).toBe(1);
    expect(redPlayerData.Summoner1Id).toBe(11);
    expect(redPlayerData.Summoner2Id).toBe(4);
    expect(redPlayerData.TimeCrowdControl).toBe(15);
    expect(redPlayerData.TotalDamageDealt).toBe(12203);
    expect(redPlayerData.TotalHeal).toBe(6958);
    expect(redPlayerData.TripleKills).toBe(0);
    expect(redPlayerData.TrueDamageDealt).toBe(1048);
    expect(redPlayerData.VisionScore).toBe(50);
    expect(redPlayerData.WardsCleared).toBe(12);
    expect(redPlayerData.WardsPlaced).toBe(8);
    expect(redPlayerData.XpAtEarly).toBe(5725);
    expect(redPlayerData.XpAtMid).toBe(10020);
    expect(redPlayerData.XpDiffEarly).toBe(290);
    expect(redPlayerData.XpDiffMid).toBe(-229);
    expect(redPlayerData.Summoner1Casts).toBe(16);
    expect(redPlayerData.Summoner2Casts).toBe(5);
    expect(redPlayerData.Spell1Casts).toBe(137);
    expect(redPlayerData.Spell2Casts).toBe(14);
    expect(redPlayerData.Spell3Casts).toBe(34);
    expect(redPlayerData.Spell4Casts).toBe(7);
    expect(redPlayerData.BountyLevel).toBe(0);
    expect(redPlayerData.TotalHealsOnTeammates).toBe(0);
    expect(redPlayerData.TotalDamageShieldedOnTeammates).toBe(0);
    expect(redPlayerData.TotalTimeSpentDead).toBe(208);
    expect(redPlayerData.ItemsPurchased).toBe(25);

    // Timeline
    const timelineList = matchData.Timeline;
    // Apparently the v5 has 5 more gold than v4 in the timeline lol
    // expect(timelineList[0].BlueTeamGold).toBe(2500);
    // expect(timelineList[0].RedTeamGold).toBe(2500);
    // expect(timelineList[1].BlueTeamGold).toBe(2500);
    // expect(timelineList[1].RedTeamGold).toBe(2500);
    // expect(timelineList[2].BlueTeamGold).toBe(2835);
    // expect(timelineList[2].RedTeamGold).toBe(2948);
    // expect(timelineList[3].BlueTeamGold).toBe(4386);
    // expect(timelineList[3].RedTeamGold).toBe(4315);
    // Kill Event
    const killMinuteData = timelineList[4];
    const killEventData = killMinuteData.Events[0];
    expect(killEventData.EventType).toBe("Kill");
    expect(killEventData.AssistIds).toEqual([6]);
    expect(killEventData.KillerId).toBe(7);
    expect(killEventData.PositionX).toBe(2224);
    expect(killEventData.PositionY).toBe(11869);
    expect(killEventData.TeamId).toBe(200);
    expect(killEventData.Timestamp).toBe(199159);
    expect(killEventData.VictimId).toBe(1);
    // Tower Plate Event
    const plateMinuteData = timelineList[8];
    const plateEventData = plateMinuteData.Events[4];
    expect(plateEventData.EventType).toBe("Plate");
    expect(plateEventData.TeamId).toBe(100);
    expect(plateEventData.Timestamp).toBe(480031);
    expect(plateEventData.Lane).toBe("Bottom");
    // Dragon Event
    const dragonMinuteData = timelineList[6];
    const dragonEventData = dragonMinuteData.Events[0];
    expect(dragonEventData.EventType).toBe("Dragon");
    expect(dragonEventData.EventCategory).toBe("Infernal");
    expect(dragonEventData.KillerId).toBe(7);
    expect(dragonEventData.TeamId).toBe(200);
    expect(dragonEventData.Timestamp).toBe(346395);
    // Herald Event
    const heraldMinuteData = timelineList[14];
    const heraldEventData = heraldMinuteData.Events[0];
    expect(heraldEventData.EventType).toBe("Herald");
    expect(heraldEventData.KillerId).toBe(7);
    expect(heraldEventData.TeamId).toBe(200);
    expect(heraldEventData.Timestamp).toBe(791520);
    // Tower Destroyed Event
    const towerMinuteData = timelineList[18];
    const towerEventData = towerMinuteData.Events[1];
    expect(towerEventData.EventType).toBe("Tower");
    expect(towerEventData.EventCategory).toBe("Outer");
    expect(towerEventData.TeamId).toBe(100);
    expect(towerEventData.Timestamp).toBe(1028110);
    expect(towerEventData.KillerId).toBe(1);
    expect(towerEventData.Lane).toBe("Top");
    // Baron Event
    const bowerMinuteData = timelineList[26];
    const baronEventData = bowerMinuteData.Events[7];
    expect(baronEventData.EventType).toBe("Baron");
    expect(baronEventData.TeamId).toBe(100);
    expect(baronEventData.Timestamp).toBe(1560418);
    expect(baronEventData.KillerId).toBe(4);
    //expect(baronEventData.BaronPowerPlay).toBe(1611); // This could change at any point based on the minute
  }
  catch (err) {
    console.log(err);
    expect('Failed').toBe('You failed');
  }
});