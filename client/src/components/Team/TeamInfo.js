import React from 'react';
// MUI
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';

const useStyles = makeStyles((theme) => ({
  paper: {
    height: '100%',
    padding: theme.spacing(1),
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    color: theme.palette.text.primary,
    background: '#A9A9A9',
  },
  title: {
    marginTop: theme.spacing(2),
    'text-decoration': 'bold',
    fontSize: 'large',
  },
}));

export default function TeamInfo({ info }) {
  const classes = useStyles();

  return (
    <div>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper className={classes.paper}>
            <p className={classes.title}>Team Information Coming Soon!</p>
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
}
