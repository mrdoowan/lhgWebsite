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
    if (weekStr.includes('W')) { return weekStr.replace("W", "Week "); }
    if (weekStr.includes('PI')) { return weekStr.replace("PI", "Play-Ins "); }
    if (weekStr.includes('Q')) { return weekStr.replace("Q", "Qualifiers "); }
    if (weekStr.includes('RO')) { return weekStr.replace("RO", "Round of "); }
    if (weekStr.includes('QF')) { return "Quarterfinals"; }
    if (weekStr.includes('SF')) { return "Semifinals"; }
    if (weekStr.includes('3')) { return "3rd Place"; }
    if (weekStr.includes('F')) { return "Championship"; }
    return null;
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
