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
        padding: theme.spacing(2),
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        color: theme.palette.text.primary,
        background: '#A9A9A9',
    },
    title: {
        fontWeight: 'bold',
        fontSize: 'x-large',
        padding: theme.spacing(2),
    },
    row: {
        padding: theme.spacing(2),
    },
    header: {
        textDecoration: 'underline',
        textAlign: 'middle'
    },
    headerRight: {
        textDecoration: 'underline',
        textAlign: 'right'
    },
    headerLeft: {
        textDecoration: 'underline',
        textAlign: 'left'
    },
    colDate: {
        width: "15%",
        textAlign: 'middle',
    },
    colDuration: {
        width: "5%",
        textAlign: 'middle',
    },
    colBlueTeam: {
        width: "25%",
        textAlign: 'right',
    },
    colVs: {
        width: "10%",
        textAlign: 'middle',
    },
    colRedTeam: {
        width: "25%",
        textAlign: 'left',
    },
    colLink: {
        width: "20%",
        textAlign: 'middle',
    },
    win: {
        color: '#006400', // Green
    },
    lose: {
        color: '#eb0c04', // Red
    },
    matchLink: {
        color: 'blue',
    },
}));

export default function TourneyGames({ games }) {
    const classes = useStyles();
    let gamesListSorted = Object.values(games).sort((a, b) => (a.DatePlayed > b.DatePlayed) ? 1 : -1);

    return (
        <div>
        <Grid container spacing={3}>
            <Grid item xs={12}>
            <Paper className={classes.paper}>
                <div className={classes.title}>Game Log</div>
                <table>
                    <thead>
                        <tr className={classes.row}>
                            <td className={classes.header}>Time Played</td>
                            <td className={classes.header}>Duration</td>
                            <td className={classes.headerRight}>Blue Side</td>
                            <td className={classes.header}></td>
                            <td className={classes.headerLeft}>Red Side</td>
                            <td className={classes.header}>Link</td>
                        </tr>
                    </thead>
                    <tbody>
                    {gamesListSorted.map((match) => (
                        <tr key={match.MatchPId} className={classes.row}>
                            <td className={classes.colDate}>{lhgString.dateString(match.DatePlayed / 1000)}EST</td>
                            <td className={classes.colDuration}>{lhgString.timeString(match.Duration)}</td>
                            <td className={classes.colBlueTeam}>{teamName(classes, match.BlueTeamName, match.BlueWin)}</td>
                            <td className={classes.colVs}>VS.</td>
                            <td className={classes.colRedTeam}>{teamName(classes, match.RedTeamName, !match.BlueWin)}</td>
                            <td className={classes.colLink}><Link className={classes.matchLink} to={`/match/${match.MatchPId}`}>Match Details</Link></td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </Paper>
            </Grid>
        </Grid>
        </div>
    )
}

function teamName(classes, name, blueWin) {
    if (blueWin) return (<Link className={classes.win} to={`/team/${name}`}>{name}</Link>);
    else return (<Link className={classes.lose} to={`/team/${name}`}>{name}</Link>);
}