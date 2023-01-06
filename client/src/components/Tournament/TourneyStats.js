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

  let totalDragons = 0;
  const dragonData = [];
  const dragonPalette = [];
  if (stats.CloudDrakes) {
    totalDragons += stats.CloudDrakes;
    dragonData.push({ dragon: 'Cloud', number: stats.CloudDrakes });
    dragonPalette.push('#bdc0cd');
  }
  if (stats.InfernalDrakes) {
    totalDragons += stats.InfernalDrakes;
    dragonData.push({ dragon: 'Infernal', number: stats.InfernalDrakes });
    dragonPalette.push('#be3921');
  }
  if (stats.MountainDrakes) {
    totalDragons += stats.MountainDrakes;
    dragonData.push({ dragon: 'Mountain', number: stats.MountainDrakes });
    dragonPalette.push('#ad7941');
  } 
  if (stats.OceanDrakes) {
    totalDragons += stats.OceanDrakes;
    dragonData.push({ dragon: 'Ocean', number: stats.OceanDrakes });
    dragonPalette.push('#5ab1a4');
  }
  if (stats.HextechDrakes) {
    totalDragons += stats.HextechDrakes;
    dragonData.push({ dragon: 'Hextech', number: stats.HextechDrakes });
    dragonPalette.push('#4ebceb');
  }
  if (stats.ChemtechDrakes) {
    totalDragons += stats.ChemtechDrakes;
    dragonData.push({ dragon: 'Chemtech', number: stats.ChemtechDrakes });
    dragonPalette.push('#a7bd72');
  }
  if (stats.ElderDrakes) {
    totalDragons += stats.ElderDrakes;
    dragonData.push({ dragon: 'Elder', number: stats.ElderDrakes });
    dragonPalette.push('#29727b');
  }

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
