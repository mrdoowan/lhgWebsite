import React from 'react';
// MUI
import { makeStyles } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';

const useStyles = makeStyles(() => ({
  loading: {
    margin: 'auto',
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
}));

export default function Loading() {
  const classes = useStyles();

  return (
    <div className={classes.loading}>
      <CircularProgress />
      {/* <CircularProgress color="secondary" /> */}
    </div>
  );
}
