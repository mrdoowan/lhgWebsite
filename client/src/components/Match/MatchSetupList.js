import React from 'react';
import { Link } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import {
  Paper,
  Grid,
} from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  paper: {
    height: '100%',
    padding: theme.spacing(1),
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    color: theme.palette.text.primary,
    background: '#A9A9A9',
  },
  row: {
    padding: theme.spacing(2),
    fontWeight: 'bold',
  },
  column: {
    width: '50%',
  },
  title: {
    padding: theme.spacing(2),
    fontWeight: 'bold',
    textDecoration: 'underline',
    fontSize: 'xx-large',
  },
  link: {
    color: 'darkBlue',
  },
}));

export default function MatchSetupList({ setupListData }) {
  const classes = useStyles();

  /**
   * 
   * @param {string} week 
   * @param {string} blueTeam 
   * @param {string} redTeam 
   * @returns 
   */
  const createMatchupString = (week, blueTeam, redTeam) => {
    const teams = [blueTeam, redTeam];
    teams.sort();
    return `${week}-${teams[0]}-${teams[1]}`;
  }

  const mapByMatchUp = {}; // Key: matchupString -> Value: 
  for (const [matchId, setupObject] of Object.entries(setupListData)) {
    const matchupString = createMatchupString(setupObject.week, setupObject.blueTeam, setupObject.redTeam);
    if (!(matchupString in mapByMatchUp)) {
      mapByMatchUp[matchupString] = [];
    }
    mapByMatchUp[matchupString].push({
      ...setupObject,
      matchId: matchId
    });
  }

  const sortedSetupList = [];
  for (const setupListByMatch of Object.values(mapByMatchUp)) {
    setupListByMatch.sort((a,b) => a.timestamp - b.timestamp);
    for (const setupObject of setupListByMatch) {
      sortedSetupList.push(setupObject);
    }
  }

  const setupDescription = (setupObject) => {
    const blueTeam = (setupObject.blueTeam) ? setupObject.blueTeam : 'UNKNOWN';
    const redTeam = (setupObject.redTeam) ? setupObject.redTeam : 'UNKNOWN';
    return `[${setupObject.seasonShortName} - ${setupObject.week}] ${blueTeam} vs. ${redTeam}`;
  }

  return (
    <div>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper className={classes.paper}>
            <h1 className={classes.title}>
              Match Setup Ids List
            </h1>
            <table>
              <tbody>
                {sortedSetupList.map((setupObject, idx) => (
                  <tr className={classes.row} key={`matchSetup${idx}Link`}>
                    <td className={classes.column}>
                      <Link to={`/match/${setupObject.matchId}/setup`} className={classes.link}>{setupObject.matchId}</Link>
                    </td>
                    <td className={classes.column}>
                      {setupDescription(setupObject)}
                    </td>
                  </tr>
                ))}
              </tbody>
              
            </table>
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
}
