import React from 'react';
import { Link } from 'react-router-dom';
// MUI
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
// Devextreme
import DataGrid, {
  Column,
  FilterRow,
  FilterPanel,
  FilterBuilderPopup,
  Paging,
} from 'devextreme-react/data-grid';
// Util
import { getTimeString } from '../../util/StringHelper';

const useStyles = makeStyles((theme) => ({
  paper: {
    height: '100%',
    padding: theme.spacing(1),
    color: theme.palette.text.primary,
    background: '#A9A9A9',
  },
}));

export default function TeamDataGrid({
  teams,
  seasonShortName,
}) {
  const classes = useStyles();

  const filterBuilderPopupPosition = {
    of: window,
    at: 'top',
    my: 'top',
    offset: { y: 50 },
  };

  const fixedPoint = (num) => {
    return {
      type: 'fixedPoint',
      precision: num,
    }
  };

  const fixedPercent = () => {
    return {
      type: 'percent',
      precision: 2,
    }
  };

  const formatTime = () => {
    return {
      formatter: getTimeString,
    }
  };

  const cellLink = (data) => {
    return <Link to={`/team/${data.value}/games/${seasonShortName}`}>{data.value}</Link>
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Paper className={classes.paper}>
          <DataGrid
            id="gridContainer"
            columnWidth={100}
            dataSource={teams.TeamList}
            hoverStateEnabled={true}
            showBorders={true}
            wordWrapEnabled={true}
          >
            <FilterRow visible={true} />
            <FilterPanel visible={true} />
            <FilterBuilderPopup position={filterBuilderPopupPosition} />
            <Paging enabled={false} />

            <Column dataField="TeamName" caption="Name" width={200} fixed={true} cellRender={cellLink} />
            <Column dataField="GamesPlayed" alignment="center" dataType="number" caption="Games" />
            <Column dataField="GamesWon" alignment="center" dataType="number" caption="Wins" />
            <Column dataField="AverageGameDuration" alignment="center" dataType="number" caption="AVG Time" format={formatTime()} />
            <Column dataField="KillDeathRatio" alignment="center" dataType="number" caption="K:D" format={fixedPoint(2)} />
            <Column dataField="AverageKills" alignment="center" dataType="number" caption="AVG Kills" format={fixedPoint(1)} />
            <Column dataField="AverageDeaths" alignment="center" dataType="number" caption="AVG Deaths" format={fixedPoint(1)} />
            <Column dataField="AverageAssists" alignment="center" dataType="number" caption="AVG Assists" format={fixedPoint(1)} />
            <Column dataField="AverageTeamKillsEarly" alignment="center" dataType="number" caption="AVG K@15" format={fixedPoint(1)} />
            <Column dataField="AverageTeamKillsMid" alignment="center" dataType="number" caption="AVG K@25" format={fixedPoint(1)} />
            <Column dataField="GoldPerMinute" alignment="center" dataType="number" caption="GPM" format={fixedPoint(2)} />
            <Column dataField="DamagePerMinute" alignment="center" dataType="number" caption="DPM" format={fixedPoint(2)} />
            <Column dataField="CreepScorePerMinute" alignment="center" dataType="number" caption="CSPM" format={fixedPoint(2)} />
            <Column dataField="VisionScorePerMinute" alignment="center" dataType="number" caption="VSPM" format={fixedPoint(2)} />
            <Column dataField="WardsPerMinute" alignment="center" dataType="number" caption="WPM" format={fixedPoint(2)} />
            <Column dataField="ControlWardsPerMinute" alignment="center" dataType="number" caption="CWPM" format={fixedPoint(2)} />
            <Column dataField="WardsClearedPerMinute" alignment="center" dataType="number" caption="WCPM" format={fixedPoint(2)} />
            <Column dataField="WardsClearedPct" alignment="center" dataType="number" caption="WC%" format={fixedPercent()} />
            <Column dataField="FirstBloodPct" alignment="center" dataType="number" caption="FB%" format={fixedPercent()} />
            <Column dataField="FirstTowerPct" alignment="center" dataType="number" caption="FT%" format={fixedPercent()} />
            <Column dataField="DragonPct" alignment="center" dataType="number" caption="DRAG%" format={fixedPercent()} />
            <Column dataField="HeraldPct" alignment="center" dataType="number" caption="RIFT%" format={fixedPercent()} />
            <Column dataField="BaronPct" alignment="center" dataType="number" caption="NASH%" format={fixedPercent()} />
            <Column dataField="AverageXpDiffEarly" alignment="center" dataType="number" caption="AVG XPD@15" format={fixedPoint(0)} />
            <Column dataField="AverageXpDiffMid" alignment="center" dataType="number" caption="AVG XPD@25" format={fixedPoint(0)} />
            <Column dataField="AverageGoldDiffEarly" alignment="center" dataType="number" caption="AVG GD@15" format={fixedPoint(0)} />
            <Column dataField="AverageGoldDiffMid" alignment="center" dataType="number" caption="AVG GD@25" format={fixedPoint(0)} />
            <Column dataField="AverageTeamGoldDiffEarlyToMid" alignment="center" dataType="number" caption="GD15->25" format={fixedPoint(0)} />
            <Column dataField="AverageCsDiffEarly" alignment="center" dataType="number" caption="AVG CSD@15" format={fixedPoint(1)} />
            <Column dataField="AverageCsDiffMid" alignment="center" dataType="number" caption="AVG CSD@25" format={fixedPoint(1)} />
            <Column dataField="AverageTowersTaken" alignment="center" dataType="number" caption="AVG TKills" format={fixedPoint(1)} />
            <Column dataField="AverageTowersLost" alignment="center" dataType="number" caption="AVG TLost" format={fixedPoint(1)} />
            <Column dataField="AverageDragonsTaken" alignment="center" dataType="number" caption="AVG Drag" format={fixedPoint(1)} />
            <Column dataField="AverageHeraldsTaken" alignment="center" dataType="number" caption="AVG Rift" format={fixedPoint(1)} />
            <Column dataField="AverageBaronsTaken" alignment="center" dataType="number" caption="AVG Nash" format={fixedPoint(1)} />
          </DataGrid>
        </Paper>
      </Grid>
    </Grid>
  );
}
