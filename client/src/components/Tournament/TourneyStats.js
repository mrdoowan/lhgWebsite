import React from 'react';
// MUI
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
// Components
import PieGraph from '../PieGraph';
// Util
import { getTimeString } from '../../util/StringHelper';

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
  columnInfo: {
    float: 'left',
    width: '50%',
    textAlign: 'right',
  },
  columnData: {
    float: 'right',
    width: '50%',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  row: {
    padding: theme.spacing(1),
  },
  titleOutside: {
    fontWeight: 'bold',
    textDecoration: 'underline',
    padding: theme.spacing(2),
    fontSize: 'x-large',
  },
  titlePaper: {
    padding: theme.spacing(2),
    textDecoration: 'underline',
    fontSize: 'large',
  },
}));

export default function TourneyStats({ stats }) {
  const classes = useStyles();

  const sideData = [
    { side: 'Blue', wins: stats.BlueSideWins },
    { side: 'Red', wins: (stats.NumberGames - stats.BlueSideWins) },
  ];
  const sidePalette = [
    '#1241ce', // Blue
    '#cb2c31', // Red
  ];

  const totalDragons = stats.CloudDrakes + stats.InfernalDrakes
    + stats.MountainDrakes + stats.OceanDrakes + stats.HextechDrakes
    + stats.ElderDrakes;
  const dragonData = [
    { dragon: 'Cloud', number: stats.CloudDrakes },
    { dragon: 'Infernal', number: stats.InfernalDrakes },
    { dragon: 'Mountain', number: stats.MountainDrakes },
    { dragon: 'Ocean', number: stats.OceanDrakes },
    { dragon: 'Hextech', number: stats.HextechDrakes },
    { dragon: 'Elder', number: stats.ElderDrakes },
  ];
  const dragonPalette = [
    '#bdc0cd', // Cloud
    '#be3921', // Infernal
    '#ad7941', // Mountain
    '#5ab1a4', // Ocean
    '#29727b', // Elder
  ];

  return (
    <div>
      <div className={classes.titleOutside}>Tournament Stats</div>
      <Grid container spacing={3}>
        <Grid item xs={6}>
          <Paper className={classes.paper}>
            <div className={classes.row}>
              <div className={classes.columnInfo}>Number of Games:</div>
              <div className={classes.columnData}>{stats.NumberGames}</div>
            </div>
            <div className={classes.row}>
              <div className={classes.columnInfo}>Average Game Duration:</div>
              <div className={classes.columnData}>{getTimeString(stats.TotalGameDuration / stats.NumberGames)}</div>
            </div>
            <div className={classes.row}>
              <PieGraph dataSource={sideData} palette={sidePalette} title="Blue/Red Side Win Rate" />
            </div>
          </Paper>
        </Grid>
        <Grid item xs={6}>
          <Paper className={classes.paper}>
            <div className={classes.row}>
              <div className={classes.columnInfo}>Total Dragons Taken:</div>
              <div className={classes.columnData}>{totalDragons}</div>
            </div>
            <div className={classes.row}>
              <PieGraph dataSource={dragonData} palette={dragonPalette} title="Dragon Percentage" />
            </div>
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
}
