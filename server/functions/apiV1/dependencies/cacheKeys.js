// Code === ShortName
export const CACHE_KEYS = {
  LEAGUE_KEY: 'Leagues',                      // TTL: Yes
  SEASON_CODE_PREFIX: 'SnCode-',              // Key: SeasonId, TTL: Never
  SEASON_NAME_PREFIX: 'SnName-',              // Key: SeasonId, TTL: Never
  SEASON_TIME_PREFIX: 'SnTime-',              // Key: SeasonId, TTL: Never
  SEASON_ID_PREFIX: 'SnId-',                  // Key: SeasonShortName, TTL: Never
  SEASON_INFO_PREFIX: 'SnInfo-',              // Key: SeasonId, TTL: Yes
  SEASON_ROSTER_PREFIX: 'SnRoster-',          // Key: SeasonId, TTL: Yes
  SEASON_REGULAR_PREFIX: 'SnRegular-',        // Key: SeasonId, TTL: Yes
  SEASON_PLAYOFF_PREFIX: 'SnPlayoff-',        // Key: SeasonId, TTL: Yes
  SEASON_TAB_PREFIX: 'SnTab-',                // Key: SeasonId, TTL: Never
  TN_CODE_PREFIX: 'TnCode-',                  // Key: TourneyId, TTL: Never
  TN_NAME_PREFIX: 'TnName-',                  // Key: TourneyId, TTL: Never
  TN_ID_PREFIX: 'TnId-',                      // Key: TournShortName, TTL: Never
  TN_INFO_PREFIX: 'TnInfo-',                  // Key: TourneyId, TTL: Yes
  TN_STATS_PREFIX: 'TnStats-',                // Key: TourneyId, TTL: Yes
  TN_LEADER_PREFIX: 'TnLB-',                  // Key: TourneyId, TTL: Yes
  TN_PLAYER_PREFIX: 'TnPlay-',                // Key: TourneyId, TTL: Yes
  TN_TEAM_PREFIX: 'TnTeam-',                  // Key: TourneyId, TTL: Yes
  TN_PICKBANS_PREFIX: 'TnPB-',                // Key: TourneyId, TTL: Yes
  TN_GAMES_PREFIX: 'TnGames-',                // Key: TourneyId, TTL: Yes
  TN_TAB_PREFIX: 'TnTab-',                    // Key: TourneyId, TTL: Never
  PROFILE_NAME_PREFIX: 'PName-',              // Key: ProfileId, TTL: Yes
  PROFILE_PID_BYNAME_PREFIX: 'PPId-',         // Key: ProfileName, TTL: Yes
  PROFILE_INFO_PREFIX: 'PInfo-',              // Key: ProfileId, TTL: Yes
  PROFILE_GAMES_PREFIX: 'PGames-',            // Key: ProfileId-SeasonId, TTL: Yes
  PROFILE_STATS_PREFIX: 'PStats-',            // Key: ProfileId-TourneyId, TTL: Yes
  PROFILE_PID_BYSUMM_PREFIX: 'PSumm-',        // Key: SummonerId, TTL: Never
  TEAM_NAME_PREFIX: 'TName-',                 // Key: TeamId, TTL: Yes
  TEAM_SHORTNAME_PREFIX: 'TShortName-',       // Key: TeamId, TTL: Yes
  TEAM_PID_PREFIX: 'TPId-',                   // Key: TeamName, TTL: Yes
  TEAM_INFO_PREFIX: 'TInfo-',                 // Key: TeamId, TTL: Yes
  TEAM_SCOUT_PREFIX: 'TScout-',               // Key: TeamId-SeasonId, TTL: Yes
  TEAM_GAMES_PREFIX: 'TGames-',               // Key: TeamId-SeasonId, TTL: Yes
  TEAM_STATS_PREFIX: 'TStats-',               // Key: TeamId-TourneyId, TTL: Yes
  MATCH_PREFIX: 'Match-',                     // Key: MatchId, TTL: Yes
  LATEST_PATCH: 'LatestPatch',                // TTL: Yes
  CHAMP_OBJECT: 'ChampObject',                // TTL: Yes
}