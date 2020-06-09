// Code === ShortName

module.exports = {
    LEAGUE_KEY: 'Leagues',                      // TTL: 1 Day
    SEASON_CODE_PREFIX: 'SnCode-',              // Key: Season Id, TTL: Never
    SEASON_NAME_PREFIX: 'SnName-',              // Key: Season Id, TTL: Never
    SEASON_TIME_PREFIX: 'SnTime-',              // Key: Season Id, TTL: Never
    SEASON_ID_PREFIX: 'SnId-',                  // Key: Season shortName, TTL: Never
    SEASON_INFO_PREFIX: 'SnInfo-',              // Key: Season Id, TTL: 1 Day
    SEASON_ROSTER_PREFIX: 'SnRoster-',          // Key: Season Id, TTL: 1 Day
    SEASON_REGULAR_PREFIX: 'SnRegular-',        // Key: Season Id, TTL: 1 Day
    SEASON_PLAYOFF_PREFIX: 'SnPlayoff-',        // Key: Season Id, TTL: 1 Day
    SEASON_TAB_PREFIX: 'SnTab-',                // Key: Season Id, TTL: Never
    TN_CODE_PREFIX: 'TnCode-',                  // Key: Tourn Id, TTL: Never
    TN_NAME_PREFIX: 'TnName-',                  // Key: Tourn Id, TTL: Never
    TN_ID_PREFIX: 'TnId-',                      // Key: Tourn shortName, TTL: Never
    TN_INFO_PREFIX: 'TnInfo-',                  // Key: Tourn Id, TTL: 1 Day
    TN_STATS_PREFIX: 'TnStats-',                // Key: Tourn Id, TTL: 1 Day
    TN_LEADER_PREFIX: 'TnLB-',                  // Key: Tourn Id, TTL: 1 Day
    TN_PLAYER_PREFIX: 'TnPlay-',                // Key: Tourn Id, TTL: 1 Day
    TN_TEAM_PREFIX: 'TnTeam-',                  // Key: Tourn Id, TTL: 1 Day
    TN_PICKBANS_PREFIX: 'TnPB-',                // Key: Tourn Id, TTL: 1 Day
    TN_GAMES_PREFIX: 'TnGames-',                // Key: Tourn Id, TTL: 1 Day
    TN_TAB_PREFIX: 'TnTab-',                    // Key: Tourn Id, TTL: Never
    PROFILE_NAME_PREFIX: 'PName-',              // Key: Prof Id, TTL: Never
    PROFILE_PID_BYNAME_PREFIX: 'PPId-',         // Key: Prof Name, TTL: Never
    PROFILE_INFO_PREFIX: 'PInfo-',              // Key: Prof Id, TTL: 1 Day
    PROFILE_GAMES_PREFIX: 'PGames-',            // Key: Prof Id-Season Id, TTL: 1 Day
    PROFILE_STATS_PREFIX: 'PStats-',            // Key: Prof Id-Tourn Id, TTL: 1 Day
    PROFILE_PID_BYSUMM_PREFIX: 'PSumm-',        // Key: Summ Id, TTL: Never
    TEAM_NAME_PREFIX: 'TName-',                 // Key: Team Id, TTL: Never
    TEAM_PID_PREFIX: 'TPId-',                   // Key: Team Name, TTL: Never
    TEAM_INFO_PREFIX: 'TInfo-',                 // Key: Team Id, TTL: 1 Day
    TEAM_SCOUT_PREFIX: 'TScout-',               // Key: Team Id-Season Id, TTL: 1 Day
    TEAM_GAMES_PREFIX: 'TGames-',               // Key: Team Id-Season Id, TTL: 1 Day
    TEAM_STATS_PREFIX: 'TStats-',               // Key: Team Id-Tourn Id, TTL: 1 Day
    MATCH_PREFIX: 'Match-',                     // Key: Match Id, TTL: 1 Day
}