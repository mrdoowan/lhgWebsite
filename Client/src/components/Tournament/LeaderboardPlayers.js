import React from 'react';
import { Link } from 'react-router-dom';
// MUI
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
// Component
import ChampionSquare from '../ChampionSquare';
// Util
const lhgString = require('../../util/StringHelper');

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
        padding: theme.spacing(2),
        fontSize: 'large',
    },
    columnImage: {
        width: "5%",
        textAlign: 'right',
    },
    columnName: {
        width: "20%",
        textAlign: 'left',
        verticalAlign: 'middle',
        wordWrap: 'break-word',
        paddingBottom: '10px',
    },
    columnData: {
        width: "75%",
        padding: '5px 20px 5px 20px',
        textAlign: 'left',
        wordWrap: 'break-word',
        paddingBottom: '10px',
    },
    row: {
        padding: theme.spacing(1),
    },
    link: {
        color: 'blue',
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
            <p className={classes.title}>Player Leaderboards</p>
            <Grid container spacing={3}>
                {Object.keys(playerRecords).map((recordType) => (
                    <Grid key={recordType} item xs={6}>
                        <Paper className={classes.paper}>
                            <div className={classes.title}>{titles[recordType]}</div>
                            <table>
                                <tbody>
                                {playerRecords[recordType].map((item, i) => (
                                    <tr key={i} className={classes.row}>
                                        <td className={classes.columnImage}><ChampionSquare id={item.ChampId}  /></td>
                                        <td className={classes.columnName}><Link className={classes.link} to={`/profile/${item.ProfileName}`}>{item.ProfileName}</Link></td>
                                        <td className={classes.columnData}>{recordString(recordType, item)} (<Link className={classes.link} to={`/match/${item.MatchPId}`}>{item.BlueTeamName} vs. {item.RedTeamName}</Link>)</td>
                                    </tr>
                                ))}
                                </tbody>
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
            return item.DamagePerMin.toFixed(2) + ' DPM - ' + item.DamageDealt + ' in ' + lhgString.timeString(item.GameDuration);
        case 'PlayerMostFarm':
            return item.CsPerMin.toFixed(2) + ' CSPM - ' + item.CreepScore + ' in ' + lhgString.timeString(item.GameDuration);
        case 'PlayerMostGoldDiffEarly':
            return '+' + item.GDiffEarly + ' GD@15 - ' + item.GAtEarly + ' Gold';
        case 'PlayerMostXpDiffEarly':
            return '+' + item.XpDiffEarly + ' XPD@15 - ' + item.XpAtEarly + ' XP';
        case 'PlayerMostVision':
            return item.VsPerMin.toFixed(2) + ' VSPM - ' + item.VisionScore + ' in ' + lhgString.timeString(item.GameDuration);
        default:
            return '';
    }
}