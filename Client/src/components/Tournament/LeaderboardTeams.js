import React from 'react';
import { Link } from 'react-router-dom';
// MUI
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
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
    columnName: {
        width: "25%",
        textAlign: 'left',
        verticalAlign: 'middle',
        wordWrap: 'break-word',
    },
    columnData: {
        width: "75%",
        padding: '5px 20px 5px 20px',
        textAlign: 'left',
        wordWrap: 'break-word',
    },
    row: {
        padding: theme.spacing(1),
    },
    link: {
        color: 'blue',
    }
}));

export default function LeaderboardTeams({ teamRecords }) {
    const classes = useStyles();
    const titles = {
        'TeamTopBaronPowerPlay': "Highest Baron Power Play",
        'TeamEarliestTower': "Earliest Tower", 
    }

    return (
        <div>
            <p className={classes.title}>Team Leaderboards</p>
            <Grid container spacing={3}>
                {Object.keys(teamRecords).map((recordType) => (
                    <Grid key={recordType} item xs={6}>
                        <Paper className={classes.paper}>
                            <div className={classes.title}>{titles[recordType]}</div>
                            <table>
                                <tbody>
                                {teamRecords[recordType].map((item, i) => (
                                    <tr key={i} className={classes.row}>
                                        <td className={classes.columnName}><Link className={classes.link} to={`/team/${item.TeamName}`}>{item.TeamName}</Link></td>
                                        <td className={classes.columnData}>{recordString(recordType, item)} (<Link className={classes.link} to={`/match/${item.MatchPId}`}>vs. {opposingTeam(item.TeamName, item.BlueTeamName, item.RedTeamName)}</Link>)</td>
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
    let tsSeconds = Math.floor(item.Timestamp / 1000);
    switch (type) {
        case 'TeamTopBaronPowerPlay':
            return '+' + item.BaronPowerPlay + ' Power Play - Taken at ' + lhgString.time(tsSeconds);
        case 'TeamEarliestTower':
            return item.Lane + ' ' + item.TowerType + ' Tower - Taken at ' + lhgString.time(tsSeconds);
        default:
            return '';
    }
}

function opposingTeam(team, blue, red) {
    return (team === red) ? blue : red;
}