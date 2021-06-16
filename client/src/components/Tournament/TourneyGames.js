import React from 'react';
import { Link } from 'react-router-dom';
// MUI
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
// Util
import {
    getTimeString,
    getDateString
} from '../../util/StringHelper';

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
        textAlign: 'middle',
        fontWeight: 'bold',
    },
    headerBlue: {
        textDecoration: 'underline',
        textAlign: 'right',
        color: '#1241ce',
        fontWeight: 'bold',
    },
    headerRed: {
        textDecoration: 'underline',
        textAlign: 'left',
        color: '#cb2c31',
        fontWeight: 'bold',
    },
    colDate: {
        width: "15%",
        textAlign: 'middle',
    },
    colDuration: {
        width: "5%",
        textAlign: 'middle',
    },
    colPatch: {
        width: "5%",
        textAlign: 'middle',
    },
    colBlueTeam: {
        width: "20%",
        textAlign: 'right',
    },
    colVs: {
        width: "10%",
        textAlign: 'middle',
    },
    colRedTeam: {
        width: "20%",
        textAlign: 'left',
    },
    colLink: {
        width: "25%",
        textAlign: 'middle',
    },
    win: {
        color: '#006f3c', // Green
    },
    lose: {
        color: '#bf212f', // Red
    },
    matchLink: {
        color: 'blue',
    },
}));

export default function TourneyGames({ games }) {
    const classes = useStyles();
    const gamesListSorted = Object.values(games).sort((a, b) => (a.DatePlayed <= b.DatePlayed) ? 1 : -1);

    return (
        <div>
        <Grid container spacing={3}>
            <Grid item xs={12}>
            <Paper className={classes.paper}>
                <div className={classes.title}>Game Log</div>
                <table>
                    <thead>
                        <tr className={classes.row}>
                            <td className={classes.header}>Date Played</td>
                            <td className={classes.header}>Duration</td>
                            <td className={classes.header}>Patch</td>
                            <td className={classes.headerBlue}><b>Blue Side</b></td>
                            <td className={classes.header}></td>
                            <td className={classes.headerRed}><b>Red Side</b></td>
                            <td className={classes.header}>Link</td>
                        </tr>
                    </thead>
                    <tbody>
                    {gamesListSorted.map((match) => (
                        <tr key={match.MatchPId} className={classes.row}>
                            <td className={classes.colDate}>{getDateString(match.DatePlayed / 1000)}</td>
                            <td className={classes.colDuration}>{getTimeString(match.Duration)}</td>
                            <td className={classes.colPatch}>{match.Patch}</td>
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
