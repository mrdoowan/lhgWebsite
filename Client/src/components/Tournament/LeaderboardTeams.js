import React from 'react';
import { Link } from 'react-router-dom';
// MUI
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
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
    columnName: {
        width: "20%",
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

export default function LeaderboardTeams({ teamRecords }) {
    const classes = useStyles();
    const titles = {
        'TeamTopBaronPowerPlay': "Highest Baron Power Play",
        'TeamEarliestTower': "Earliest Tower", 
    }

    return (
        <div>
        <Grid container spacing={3}>
            {Object.keys(teamRecords).map((recordType) => (
                <Grid item xs={6}>
                    <Paper className={classes.paper}>
                        <div className={classes.title}>{titles[recordType]}</div>
                        <table>
                            {teamRecords[recordType].map((item) => (
                            <tr className={classes.row}>
                                <td className={classes.columnName}><Link to={`/team/${item.TeamName}`}>{item.TeamName}</Link></td>
                                <td className={classes.columnData}>{recordString(recordType, item)} (<Link to={`/match/${item.MatchPId}`}>vs. {opposingTeam(item.TeamName, item.BlueTeamName, item.RedTeamName)}</Link>)</td>
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
    let tsSeconds = Math.floor(item.Timestamp / 1000);
    switch (type) {
        case 'TeamTopBaronPowerPlay':
            return '+' + item.BaronPowerPlay + ' Power Play - Taken at ' + fxn.timeString(tsSeconds);
        case 'TeamEarliestTower':
            return item.Lane + ' ' + item.TowerType + ' Tower - Taken at ' + fxn.timeString(tsSeconds);
        default:
            return '';
    }
}

function opposingTeam(team, blue, red) {
    return (team === red) ? blue : red;
}