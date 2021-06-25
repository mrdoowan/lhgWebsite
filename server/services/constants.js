// All Constants will be here

export const AWS_RDS_STATUS = {
  STOPPED: 'stopped',
  STOPPING: 'stopping',
  AVAILABLE: 'available',
  STARTING: 'starting',
}

export const TEAM_ID = {
  BLUE: "100",
  RED: "200",
}

export const TEAM_STRING = {
  BLUE: 'Blue',
  RED: 'Red',
  SIDE: {
    '100': 'Blue',
    '200': 'Red',
  }
}

export const MINUTE = {
  EARLY: 15,
  MID: 25,
}

export const BARON_DURATION = {
  PATCH_CHANGE: '9.23',
  CURRENT: 180, // in seconds
  OLD: 210, // in seconds
}

export const RDS_TYPE = {
  PROD: 'Production',
  TEST: 'Test',
}

export const DYNAMODB_TABLENAMES = {
  MATCHES: 'Matches',
  MISCELLANEOUS: 'Miscellaneous',
  PROFILE: 'Profile',
  PROFILENAMEMAP: 'ProfileNameMap',
  SEASON: 'Season',
  SUMMONERIDMAP: 'SummonerIdMap',
  TEAM: 'Team',
  TEAMNAMEMAP: 'TeamNameMap',
  TOURNAMENT: 'Tournament',
}

export const PARTITION_KEY_MAP = {
  [DYNAMODB_TABLENAMES.MATCHES]: 'MatchPId',
  [DYNAMODB_TABLENAMES.MISCELLANEOUS]: 'Key',
  [DYNAMODB_TABLENAMES.PROFILE]: 'ProfilePId',
  [DYNAMODB_TABLENAMES.PROFILENAMEMAP]: 'ProfileName',
  [DYNAMODB_TABLENAMES.SEASON]: 'SeasonPId',
  [DYNAMODB_TABLENAMES.SUMMONERIDMAP]: 'SummonerId',
  [DYNAMODB_TABLENAMES.TEAM]: 'TeamPId',
  [DYNAMODB_TABLENAMES.TEAMNAMEMAP]: 'TeamName',
  [DYNAMODB_TABLENAMES.TOURNAMENT]: 'TournamentPId',
}

export const MISC_KEYS = {
  CHAMP_IDS: 'ChampByIds',
  MATCH_SETUP_IDS: 'MatchSetupIds',
  SPELL_IDS: 'SummonerSpellById',
  VERSIONS: 'Versions',
}