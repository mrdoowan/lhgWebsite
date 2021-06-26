import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
// Components
import MatchTab from './MatchTab';
import MatchTitle from './MatchTitle';

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.primary,
    background: '#A9A9A9',
  },
  title: {
    fontSize: 'x-large',
    fontWeight: 'bold',
  },
}));

export default function MatchHeader({ match, type }) {
  const classes = useStyles();

  const titleComponent = (<MatchTitle match={match} />);
  const matchBar = (<MatchTab id={match.MatchPId} type={type} />);

  return (
    <div>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper className={classes.paper}>
            {titleComponent}
            {matchBar}
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
}
