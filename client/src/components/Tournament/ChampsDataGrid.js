import React from 'react';
// MUI
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
// Component
import ChampionSquare from '../ChampionSquare';
// Devextreme
import DataGrid, {
    Column,
    FilterRow,
    FilterPanel,
    FilterBuilderPopup,
    Scrolling,
    Paging
} from 'devextreme-react/data-grid';

const useStyles = makeStyles((theme) => ({
    paper: {
        height: "100%",
        padding: theme.spacing(1),
        color: theme.palette.text.primary,
        background: '#A9A9A9',
    },
    title: {
        textDecoration: 'underline',
        fontSize: 'large',
        paddingTop: theme.spacing(2),
    },
    blurb: {
        paddingBottom: theme.spacing(4),
    }
}));

export default function ChampsDataGrid({ pickbans }) {
    const classes = useStyles();

    return (
        <Grid container spacing={3}>
            <Grid item xs={12}>
                <Paper className={classes.paper}>
                <div className={classes.title}>{pickbans.NumberGames} Games Played</div>
                <div className={classes.blurb}>{pickbans.ChampsWithPresence} / {pickbans.PickBanList.length} Champions Picked or Banned</div>
                <DataGrid
                    id="gridContainer"
                    width="inherit"
                    columnAutoWidth={true}
                    dataSource={pickbans.PickBanList}
                    hoverStateEnabled={true}
                    showBorders={true}
                    wordWrapEnabled={true}
                >
                    <FilterRow visible={true} />
                    <FilterPanel visible={true} />
                    <FilterBuilderPopup position={filterBuilderPopupPosition} />
                    <Scrolling columnRenderingMode="virtual" />
                    <Paging enabled={false} />

                    <Column dataField="Id" caption="Champ" width={150} fixed={true} cellRender={champCell} />
                    <Column dataField="Presence" alignment="center" dataType="number" caption="Presence" format={fixedPercent()} cssClass="myClass" />
                    <Column dataField="TimesPicked" alignment="center" dataType="number" caption="Picks" cssClass="myClass" />
                    <Column dataField="TimesBanned" alignment="center" dataType="number" caption="Bans" cssClass="myClass" />
                    <Column dataField="PickPct" alignment="center" dataType="number" caption="Pick %" format={fixedPercent()} cssClass="myClass" />
                    <Column dataField="BanPct" alignment="center" dataType="number" caption="Ban %" format={fixedPercent()} cssClass="myClass" />
                    <Column dataField="NumWins" alignment="center" dataType="number" caption="Wins" cssClass="myClass" />
                    <Column dataField="NumLosses" alignment="center" dataType="number" caption="Losses" cssClass="myClass" />
                    <Column dataField="WinPct" alignment="center" dataType="number" caption="Win %" format={fixedPercent()} cssClass="myClass" />
                    <Column dataField="BluePicks" alignment="center" dataType="number" caption="Blue Picks" cssClass="myClass" />
                    <Column dataField="RedPicks" alignment="center" dataType="number" caption="Red Picks" cssClass="myClass" />
                    <Column dataField="BlueBans" alignment="center" dataType="number" caption="Blue Bans" cssClass="myClass" />
                    <Column dataField="RedBans" alignment="center" dataType="number" caption="Red Bans" cssClass="myClass" />
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

function fixedPercent() {
    return {
        type: 'percent',
        precision: 2,
    }
}

function champCell(data) {
    return (<ChampionSquare id={data.value} withName={true} />);
}