import React from 'react';
import { Link } from 'react-router-dom';
// MUI
import { makeStyles } from '@material-ui/core/styles';
import { getTourneyTypeString } from '../../util/StringHelper';

const useStyles = makeStyles((theme) => ({
  header: {
    padding: theme.spacing(1)
  },
  title: {
    fontSize: 'x-large',
    fontWeight: 'bold',
  },
  season: {
    padding: theme.spacing(0.5),
    fontWeight: 'bold',
  },
  blueTeam: {
    color: '#1241ce', // Blue
  },
  redTeam: {
    color: '#cb2c31', // Red
  },
}));

export default function MatchTitle({ match }) {
  const classes = useStyles();

  const blueName = match.Teams['100'].TeamName;
  const redName = match.Teams['200'].TeamName;

  /**
   * 
   * @param {string} weekStr 
   */
  const generateWeekString = (weekStr) => {
    // 1st part
    if (weekStr.includes('L')) { weekStr = weekStr.replace("L", "Lower "); }
    else if (weekStr.includes('U')) { weekStr = weekStr.replace("U", "Upper "); }
    else if (weekStr.includes('G')) { weekStr = weekStr.replace("G", "Grand "); }
    else if (weekStr.includes('W')) { weekStr = weekStr.replace("W", "Week "); }
    else if (weekStr.includes('PI')) { weekStr = weekStr.replace("PI", "Play-Ins Week "); }
    else if (weekStr.includes('Q')) { weekStr = weekStr.replace("Q", "Qualifiers Week "); }
    // 2nd part
    if (weekStr.includes('RO')) { weekStr = weekStr.replace("RO", "Round of "); }
    else if (weekStr.includes('QF')) { weekStr = weekStr.replace("QF","Quarterfinals"); }
    else if (weekStr.includes('SF')) { weekStr = weekStr.replace("SF", "Semifinals"); }
    else if (weekStr.includes('3RD')) { weekStr = weekStr.replace("3RD", "3rd Place"); }
    else if (weekStr.includes('F')) { weekStr = weekStr.replace("F", "Finals"); }
    return weekStr;
  }

  const blueTeamLink = (<Link className={classes.blueTeam} to={`/team/${blueName}`}>{blueName}</Link>);
  const redTeamLink = (<Link className={classes.redTeam} to={`/team/${redName}`}>{redName}</Link>);
  const seasonLink = (<Link to={`/season/${match.SeasonShortName}`}>{match.SeasonName}</Link>);
  const tourneyLink = (<Link to={`/tournament/${match.TournamentShortName}`}>{getTourneyTypeString(match.TournamentType)}</Link>);

  const firstSubHeader = <div className={classes.season}>{seasonLink} - {tourneyLink}</div>;
  const secondSubHeader = <div className={classes.season}>{`${(match.Week) ? `${generateWeekString(match.Week)} - ` : ''}`}[Patch {match.GamePatchVersion}]</div>;

  return (
    <div className={classes.header}>
      <p className={classes.title}>{blueTeamLink} VS {redTeamLink}</p>
      {firstSubHeader}
      {secondSubHeader}
    </div>
  );
}
