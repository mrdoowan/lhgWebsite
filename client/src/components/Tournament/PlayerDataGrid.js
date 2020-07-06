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
    Paging
} from 'devextreme-react/data-grid';

const useStyles = makeStyles((theme) => ({
    paper: {
        height: "100%",
        padding: theme.spacing(1),
        color: theme.palette.text.primary,
        background: '#A9A9A9',
    },
}));

export default function PlayerDataGrid({ players }) {
    const classes = useStyles();

    return (
        <Grid container spacing={3}>
            <Grid item xs={12}>
                <Paper className={classes.paper}>
                <DataGrid
                    id="gridContainer"
                    columnWidth={100}
                    dataSource={players.PlayerList}
                    hoverStateEnabled={true}
                    showBorders={true}
                    wordWrapEnabled={true}
                >
                    <FilterRow visible={true} />
                    <FilterPanel visible={true} />
                    <FilterBuilderPopup position={filterBuilderPopupPosition} />
                    <Paging enabled={false} />

                    <Column dataField="ProfileName" caption="Name" width={150} fixed={true} cellRender={playerLink} />
                    <Column dataField="Role" alignment="center" width={100} fixed={true} />
                    <Column dataField="GamesPlayed" alignment="center" dataType="number" caption="Games" />
                    <Column dataField="GamesWin" alignment="center" dataType="number" caption="Wins" />
                    <Column dataField="Kda" alignment="center" dataType="number" caption="KDA" format={fixedPoint(2)} />
                    <Column dataField="TotalKills" alignment="center" dataType="number" caption="Kills" />
                    <Column dataField="TotalDeaths" alignment="center" dataType="number" caption="Deaths" />
                    <Column dataField="TotalAssists" alignment="center" dataType="number" caption="Assists" />
                    <Column dataField="AverageKills" alignment="center" dataType="number" caption="AVGK" />
                    <Column dataField="AverageDeaths" alignment="center" dataType="number" caption="AVGD" />
                    <Column dataField="AverageAssists" alignment="center" dataType="number" caption="AVGA" />
                    <Column dataField="KillPct" alignment="center" dataType="number" caption="Kill%" format={fixedPercent()} />
                    <Column dataField="DeathPct" alignment="center" dataType="number" caption="Death%" format={fixedPercent()} />
                    <Column dataField="FirstBloodPct" alignment="center" dataType="number" caption="FB%" format={fixedPercent()} />
                    <Column dataField="GoldPct" alignment="center" dataType="number" caption="GOLD%" format={fixedPercent()} />
                    <Column dataField="DamagePct" alignment="center" dataType="number" caption="DMG%" format={fixedPercent()} />
                    <Column dataField="VisionScorePct" alignment="center" dataType="number" caption="VS%" format={fixedPercent()} />
                    <Column dataField="DamagePerGold" alignment="center" dataType="number" caption="DMG/GOLD" format={fixedPoint(4)} />
                    <Column dataField="GoldPerMinute" alignment="center" dataType="number" caption="GOLD/MIN" format={fixedPoint(2)} />
                    <Column dataField="DamagePerMinute" alignment="center" dataType="number" caption="DMG/MIN" format={fixedPoint(2)} />
                    <Column dataField="CreepScorePerMinute" alignment="center" dataType="number" caption="CS/MIN" format={fixedPoint(2)} />
                    <Column dataField="VisionScorePerMinute" alignment="center" dataType="number" caption="VS/MIN" format={fixedPoint(2)} />
                    <Column dataField="WardsPerMinute" alignment="center" dataType="number" caption="WARD/MIN" format={fixedPoint(2)} />
                    <Column dataField="ControlWardsPerMinute" alignment="center" dataType="number" caption="CW/MIN" format={fixedPoint(2)} />
                    <Column dataField="WardsClearedPerMinute" alignment="center" dataType="number" caption="WC/MIN" format={fixedPoint(2)} />
                    <Column dataField="AverageCsDiffEarly" alignment="center" dataType="number" caption="AVG CSD@15" format={fixedPoint(1)} />
                    <Column dataField="AverageCsDiffMid" alignment="center" dataType="number" caption="AVG CSD@25" format={fixedPoint(1)} />
                    <Column dataField="AverageGoldDiffEarly" alignment="center" dataType="number" caption="AVG GD@15" format={fixedPoint(0)} />
                    <Column dataField="AverageGoldDiffMid" alignment="center" dataType="number" caption="AVG GD@25" format={fixedPoint(0)} />
                    <Column dataField="AverageXpDiffEarly" alignment="center" dataType="number" caption="AVG XPD@15" format={fixedPoint(0)} />
                    <Column dataField="AverageXpDiffMid" alignment="center" dataType="number" caption="AVG XPD@25" format={fixedPoint(0)} />
                    <Column dataField="AverageCsAtEarly" alignment="center" dataType="number" caption="AVG CS@15" format={fixedPoint(1)} />
                    <Column dataField="AverageCsAtMid" alignment="center" dataType="number" caption="AVG CS@25" format={fixedPoint(1)} />
                    <Column dataField="AverageGoldAtEarly" alignment="center" dataType="number" caption="AVG G@15" format={fixedPoint(0)} />
                    <Column dataField="AverageGoldAtMid" alignment="center" dataType="number" caption="AVG G@25" format={fixedPoint(0)} />
                    <Column dataField="AverageXpAtEarly" alignment="center" dataType="number" caption="AVG XP@15" format={fixedPoint(0)} />
                    <Column dataField="AverageXpAtMid" alignment="center" dataType="number" caption="AVG XP@25" format={fixedPoint(0)} />
                    <Column dataField="TotalSoloKills" alignment="center" dataType="number" caption="Solo Kills" />
                    <Column dataField="TotalDoubleKills" alignment="center" dataType="number" caption="Double Kills" />
                    <Column dataField="TotalTripleKills" alignment="center" dataType="number" caption="Triple Kills" />
                    <Column dataField="TotalQuadraKills" alignment="center" dataType="number" caption="Quadra Kills" />
                    <Column dataField="TotalPentaKills" alignment="center" dataType="number" caption="Penta Kills" />
                </DataGrid>
                </Paper>
            </Grid>
        </Grid>
    )
}

const filterBuilderPopupPosition = {
    of: window,
    at: 'top',
    my: 'top',
    offset: { y: 50 }
};

function fixedPoint(num) {
    return {
        type: 'fixedPoint',
        precision: num,
    }
}

function fixedPercent() {
    return {
        type: 'percent',
        precision: 2,
    }
}

function playerLink(data) {
    return <Link to={`/profile/${data.value}/games`}>{data.value}</Link>
}