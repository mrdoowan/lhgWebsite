import React from 'react';
// MUI
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.primary,
    background: '#A9A9A9',
    'font-weight': 'bold',
  },
  title: {
    padding: theme.spacing(2),
    fontSize: 'large',
  },
}));

// If the data is empty, display a Component indicating
export default function DataWrapper({ data, component, emptyMessage }) {
  const classes = useStyles();

  const emptyComponent = (
    <div className={classes.root}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper className={classes.paper}>
            <div className={classes.title}>{emptyMessage}</div>
          </Paper>
        </Grid>
      </Grid>
    </div>
  );

  const finalMarkup = (Object.keys(data).length === 0) ?
    (emptyComponent) : (component);

  return (
    <div>
      {finalMarkup}
    </div>
  );
}
