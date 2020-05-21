import React from 'react';
import { Link } from 'react-router-dom';
// MUI
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
// Component
import ChampionSquare from '../ChampionSquare';
// Util
const fxn = require('../../util/Helper');

const useStyles = makeStyles((theme) => ({
    paper: {
        height: "100%",
        padding: theme.spacing(1),
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        color: theme.palette.text.primary,
        background: '#A9A9A9',
    },
    title: {
        'text-decoration': 'underline',
        padding: theme.spacing(1),
        fontSize: 'large',
    },
    columnImage: {
        width: "5%",
        textAlign: 'right',
    },
    columnName: {
        width: "15%",
        textAlign: 'left',
        verticalAlign: 'middle',
        wordWrap: 'break-word',
    },
    columnData: {
        width: "80%",
        padding: '5px 20px 5px 20px',
        textAlign: 'left',
        wordWrap: 'break-word',
    },
    row: {
        padding: theme.spacing(1),
    },
}));

export default function LeaderboardPlayers({ playerRecords }) {
    const classes = useStyles();
    const titles = {
        'PlayerMostDamage': "Highest Damage Dealt",
        'PlayerMostFarm': "Highest Farming Rate",
        'PlayerMostGoldDiffEarly': "Highest Gold Diff @15",
        'PlayerMostXpDiffEarly': "Highest XP Diff @15",
        'PlayerMostVision': "Highest Vision",
    }

    return (
        <div>
        <Grid container spacing={3}>
            {Object.keys(playerRecords).map((recordType) => (
                <Grid item xs={6}>
                    <Paper className={classes.paper}>
                        <div className={classes.title}>{titles[recordType]}</div>
                        <table>
                            {playerRecords[recordType].map((item) => (
                            <tr className={classes.row}>
                                <td className={classes.columnImage}><ChampionSquare id={item.ChampId} /></td>
                                <td className={classes.columnName}><Link to={`/profile/${item.ProfileName}`}>{item.ProfileName}</Link></td>
                                <td className={classes.columnData}>{recordString(recordType, item)} (<Link to={`/match/${item.MatchPId}`}>{item.BlueTeamName} vs. {item.RedTeamName}</Link>)</td>
                            </tr>
                            ))}
                        </table>
                    </Paper>
                </Grid>
            ))}
        </Grid>
        </div>
    )
}

function recordString(type, item) {
    switch (type) {
        case 'PlayerMostDamage':
            return item.DamagePerMin.toFixed(2) + ' DPM - ' + item.DamageDealt + ' in ' + fxn.timeString(item.GameDuration);
        case 'PlayerMostFarm':
            return item.CsPerMin.toFixed(2) + ' CSPM - ' + item.CreepScore + ' in ' + fxn.timeString(item.GameDuration);
        case 'PlayerMostGoldDiffEarly':
            return '+' + item.GDiffEarly + ' GD@15 - ' + item.GAtEarly + ' Gold';
        case 'PlayerMostXpDiffEarly':
            return '+' + item.XpDiffEarly + ' XPD@15 - ' + item.XpAtEarly + ' XP';
        case 'PlayerMostVision':
            return item.VsPerMin.toFixed(2) + ' VSPM - ' + item.VisionScore + ' in ' + fxn.timeString(item.GameDuration);
        default:
            return '';
    }
}