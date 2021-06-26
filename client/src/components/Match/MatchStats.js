import React from 'react';
// MUI
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
// import Table from '@material-ui/core/Table';
// import TableBody from '@material-ui/core/TableBody';
// import TableCell from '@material-ui/core/TableCell';
// import TableContainer from '@material-ui/core/TableContainer';
// import TableHead from '@material-ui/core/TableHead';
// import TableRow from '@material-ui/core/TableRow';

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
    padding: theme.spacing(2),
    'text-decoration': 'bold',
    fontSize: 'large',
  },
}));

export default function MatchStats({ match }) {
  const classes = useStyles();

  return (
    <div>
      <Grid container spacing={3}>
      <Grid item xs={12}>
          <Paper className={classes.paper}>
            <p className={classes.title}>Match Stats Coming Soon!</p>
          </Paper>
        </Grid>
        {/* <Grid item xs={12}>
          <TableContainer component={Paper}>
            <Table className={classes.table} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell>Player</TableCell>
                  <TableCell />
                  <TableCell />
                  <TableCell>K/D/A</TableCell>
                  <TableCell>CS</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.entries(match.Teams['100'].Players).map(([playerNum, player]) => (
                  <TableRow key={playerNum}>
                    <TableCell><a href={`/profile/${player.ProfileName}/games/${match.SeasonShortName}`}>{player.ProfileName}</a></TableCell>
                    <TableCell />
                    <TableCell />
                    <TableCell>{player.Kills}/{player.Deaths}/{player.Assists}</TableCell>
                    <TableCell>{player.CreepScore}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid> */}
      </Grid>
    </div>
  );
}
