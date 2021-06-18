import React from 'react';
import { Link } from 'react-router-dom';
// MUI
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
// Components
import SeasonHelmet from '../Helmet/SeasonHelmet';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.primary,
    background: '#A9A9A9',
  },
  link: {
    color: 'blue',
    fontSize: 'large',
  },
  titleMain: {
    fontWeight: 'bold',
    textDecoration: 'underline',
    padding: theme.spacing(2),
    fontSize: 'x-large',
  },
}));

export default function SeasonHeader({ info }) {
  const classes = useStyles();

  const seasonBaseMarkup = info ? (
    <div>
      <div className={classes.titleMain}>{info.SeasonName}</div>
      <p><Link className={classes.link} to={`/tournament/${info.TournamentPIds.RegTournamentShortName}`}>Regular Season Stats</Link></p>
      <p><Link className={classes.link} to={`/tournament/${info.TournamentPIds.PostTournamentShortName}`}>Playoffs Stats</Link></p>
    </div>
  ) : (<div />);

  return (
    <div className={classes.root}>
      <SeasonHelmet info={info} />
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper className={classes.paper}>
            {seasonBaseMarkup}
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
}
